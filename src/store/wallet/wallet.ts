/**
 * Wallet store - Single source of truth for wallet state
 * Uses epoch guard to prevent stale async overwrites
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { WalletId } from '@/shared/types'
import { getWalletAdapter, getInstalledWallets } from '@/wallet/adapters'
import type { WalletEvent, IEVMWallet, AccountsChangedPayload, ChainChangedPayload, IWallet } from '@/wallet/core/types'
import { hexToDecimal, shortAddress, isUserRejection, isStaleRequest } from '@/shared/utils'
import { mapWeb3ErrorToKey } from '@/shared/utils/web3ErrorMapper'
import type { ErrorKey } from '@/messages/errors'
import { ERROR_MESSAGES } from '@/messages/errors'
import { SUCCESS_MESSAGES } from '@/messages/success'

type WalletStatus = 'idle' | 'connecting' | 'connected' | 'error'

export const useWalletStore = defineStore('wallet', () => {
  // State
  const installedWallets = ref<WalletId[]>([])
  const activeWalletId = ref<WalletId | null>(null)
  const status = ref<WalletStatus>('idle')
  const account = ref<string | null>(null)
  const accounts = ref<string[]>([])
  const chainIdHex = ref<string | null>(null)
  const chainIdDec = ref<number | null>(null)
  const epoch = ref(0)
  const listenersAttached = ref(false)
  const errorKey = ref<ErrorKey | null>(null)
  const previousAccount = ref<string | null>(null) // Track previous account for change detection

  // Computed
  const isConnected = computed(() => status.value === 'connected' && account.value !== null)

  /**
   * Initialize wallet store
   * Detects installed wallets and attaches listeners once (guard)
   */
  function init() {
    if (listenersAttached.value) {
      return // Already initialized
    }

    // Detect installed wallets
    installedWallets.value = getInstalledWallets()
    listenersAttached.value = true
  }

  /**
   * Connect to wallet
   * @param walletId - Wallet ID to connect
   */
  async function connect(walletId: WalletId) {
    const currentEpochValue = ++epoch.value
    status.value = 'connecting'
    errorKey.value = null

    try {
      const adapter = getWalletAdapter(walletId)
      if (!adapter) {
        // Adapter not found – set error and exit early
        errorKey.value = 'WALLET_ADAPTER_NOT_FOUND'
        status.value = 'error'
        return
      }

      if (!adapter.isInstalled()) {
        // Wallet not installed – set error and exit early
        errorKey.value = 'WALLET_NOT_INSTALLED'
        status.value = 'error'
        return
      }

      // Connect
      const connectedAccounts = await adapter.connect()

      // Check epoch to prevent stale updates
      if (isStaleRequest(epoch.value, currentEpochValue)) {
        return // Stale update, ignore
      }

      // Update state
      activeWalletId.value = walletId
      accounts.value = connectedAccounts
      account.value = connectedAccounts[0] || null
      previousAccount.value = connectedAccounts[0] || null
      status.value = 'connected'
      errorKey.value = null

      // Attach event listeners
      attachListeners(adapter)

      // Sync initial state (silent, no toast)
      await sync()

      // Show success toast using centralized messages
      toast.success(SUCCESS_MESSAGES.WALLET_CONNECT_SUCCESS_TITLE, {
        description: `${SUCCESS_MESSAGES.WALLET_CONNECT_SUCCESS_DESC_PREFIX} ${shortAddress(connectedAccounts[0] || '')}`
      })
    } catch (err: unknown) {
      // Check epoch
      if (isStaleRequest(epoch.value, currentEpochValue)) {
        return // Stale update, ignore
      }

      // Map error to ErrorKey for centralized error messages
      errorKey.value = mapWeb3ErrorToKey(err)
      
      status.value = 'error'
      activeWalletId.value = null
      account.value = null
      accounts.value = []

      // Show error toast
      if (isUserRejection(err)) {
        toast.error(ERROR_MESSAGES.WALLET_CONNECT_REJECTED, {
          description: ERROR_MESSAGES.WALLET_CONNECT_REJECTED_DESC
        })
      } else {
        toast.error(ERROR_MESSAGES.WALLET_CONNECT_FAILED, {
          description: ERROR_MESSAGES.WALLET_CONNECT_ERROR
        })
      }
    }
  }

  /**
   * Disconnect locally (clear local state only)
   */
  function disconnectLocal() {
    ++epoch.value // Increment epoch for consistency

    // Clear state
    const wasConnected = activeWalletId.value !== null
    activeWalletId.value = null
    status.value = 'idle'
    account.value = null
    accounts.value = []
    chainIdHex.value = null
    chainIdDec.value = null
    errorKey.value = null
    previousAccount.value = null

    // Remove event listeners to prevent memory leaks
    removeListeners()

    // Show toast only if was connected (user-triggered action)
    if (wasConnected) {
      toast.info(SUCCESS_MESSAGES.WALLET_DISCONNECT_INFO_TITLE, {
        description: SUCCESS_MESSAGES.WALLET_DISCONNECT_INFO_DESC
      })
    }
  }

  /**
   * Sync wallet state (best-effort read)
   * Silent operation - no toasts (auto-refresh)
   */
  async function sync() {
    if (!activeWalletId.value) {
      return
    }

    const adapter = getWalletAdapter(activeWalletId.value)
    if (!adapter) {
      return
    }

    try {
      // Get accounts
      const currentAccounts = await adapter.getAccounts()
      accounts.value = currentAccounts
      account.value = currentAccounts[0] || null
      // Update previous account silently (no toast on auto-refresh)
      previousAccount.value = currentAccounts[0] || null

      // Get chain ID (EVM only)
      if (adapter.type === 'EVM') {
        const evmAdapter = adapter as IEVMWallet
        const chainId = await evmAdapter.getChainId()
        chainIdHex.value = chainId
        chainIdDec.value = hexToDecimal(chainId)
      }
    } catch (err: unknown) {
      // Silent fail for sync
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      console.warn('Failed to sync wallet state:', errorMessage)
    }
  }

  // Store adapter reference and handlers for cleanup
  let currentAdapter: IWallet | null = null
  let accountsHandler: ((event: WalletEvent) => void) | null = null
  let chainHandler: ((event: WalletEvent) => void) | null = null
  let disconnectHandler: ((event: WalletEvent) => void) | null = null

  /**
   * Attach event listeners to wallet adapter
   * Handles accountsChanged, chainChanged, and disconnect events
   * Uses epoch guard to prevent stale updates
   * Removes old listeners before attaching new ones to prevent duplicates
   * @param adapter - Wallet adapter instance
   */
  function attachListeners(adapter: IWallet) {
    // Always remove old listeners first to prevent duplicates
    if (currentAdapter && accountsHandler && chainHandler && disconnectHandler) {
      currentAdapter.off('accountsChanged', accountsHandler)
      currentAdapter.off('chainChanged', chainHandler)
      currentAdapter.off('disconnect', disconnectHandler)
    }

    currentAdapter = adapter
    
    // Handle accounts changed
    accountsHandler = (event: WalletEvent) => {
      if (event.type !== 'accountsChanged') {
        return
      }
      
      const currentEpochValue = ++epoch.value
      const newAccounts = event.payload as AccountsChangedPayload
      
      // Check epoch (stale guard)
      if (isStaleRequest(epoch.value, currentEpochValue)) {
        return
      }

      const newAccount = newAccounts[0] || null
      const oldAccount = previousAccount.value

      accounts.value = newAccounts || []
      account.value = newAccount

      if (newAccounts.length === 0) {
        // User disconnected
        disconnectLocal()
      } else if (oldAccount && newAccount && oldAccount !== newAccount) {
        // Account switched (user-triggered)
        previousAccount.value = newAccount
        toast.info(SUCCESS_MESSAGES.WALLET_ACCOUNT_SWITCHED_TITLE, {
          description: `${SUCCESS_MESSAGES.WALLET_ACCOUNT_SWITCHED_DESC_PREFIX} ${shortAddress(newAccount)}`
        })
      } else {
        // Update previous account without showing toast (auto-refresh)
        previousAccount.value = newAccount
      }
    }

    // Handle chain changed (EVM only)
    chainHandler = (event: WalletEvent) => {
      if (event.type !== 'chainChanged') {
        return
      }
      
      const currentEpochValue = ++epoch.value
      const newChainId = event.payload as ChainChangedPayload
      
      // Check epoch (stale guard)
      if (isStaleRequest(epoch.value, currentEpochValue)) {
        return
      }

      chainIdHex.value = newChainId
      chainIdDec.value = hexToDecimal(newChainId)
    }

    // Handle disconnect
    disconnectHandler = (event: WalletEvent) => {
      if (event.type === 'disconnect') {
        disconnectLocal()
      }
    }

    adapter.on('accountsChanged', accountsHandler)
    adapter.on('chainChanged', chainHandler)
    adapter.on('disconnect', disconnectHandler)
  }

  /**
   * Remove all event listeners (cleanup)
   */
  function removeListeners() {
    if (currentAdapter && accountsHandler && chainHandler && disconnectHandler) {
      currentAdapter.off('accountsChanged', accountsHandler)
      currentAdapter.off('chainChanged', chainHandler)
      currentAdapter.off('disconnect', disconnectHandler)
    }
    currentAdapter = null
    accountsHandler = null
    chainHandler = null
    disconnectHandler = null
  }

  /**
   * Clear error
   */
  function clearError() {
    errorKey.value = null
  }

  return {
    // State
    installedWallets,
    activeWalletId,
    status,
    account,
    accounts,
    chainIdHex,
    chainIdDec,
    epoch,
    listenersAttached,
    errorKey,
    // Computed
    isConnected,
    // Actions
    init,
    connect,
    disconnectLocal,
    sync,
    clearError
  }
})
