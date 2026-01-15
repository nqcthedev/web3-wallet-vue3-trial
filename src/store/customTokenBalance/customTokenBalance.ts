/**
 * Custom token balance store
 * Queries ERC-20 token balance by contract address
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getErc20Balance } from '@/features/tokens/core/erc20'
import { createWeb3Instance } from '@/shared/utils/web3'
import { mapWeb3ErrorToKey } from '@/shared/utils/web3ErrorMapper'
import { isStaleRequest } from '@/shared/utils/epoch'
import type { ErrorKey } from '@/messages/errors'
import { useWalletStore } from '@/store/wallet'

export const useCustomTokenBalanceStore = defineStore('customTokenBalance', () => {
  // State
  const contractAddress = ref('')
  const loading = ref(false)
  const balance = ref<string | null>(null)
  const decimals = ref<number | null>(null)
  const errorKey = ref<ErrorKey | null>(null)
  const fetchEpoch = ref(0)

  /**
   * Set contract address
   */
  function setContractAddress(value: string) {
    contractAddress.value = value
  }

  /**
   * Check balance for custom token
   * @param account - Account address
   * @param chainId - Chain ID (decimal)
   */
  async function checkBalance({
    account,
    chainId
  }: {
    account: string
    chainId: number | null
  }) {
    const trimmedAddress = contractAddress.value.trim()
    if (!trimmedAddress) {
      errorKey.value = 'TOKEN_CONTRACT_ADDRESS_REQUIRED'
      return
    }

    if (!chainId) {
      errorKey.value = 'CHAIN_ID_REQUIRED'
      return
    }

    // Get wallet store for stale protection
    const walletStore = useWalletStore()
    const walletEpochSnapshot = walletStore.epoch
    const accountSnapshot = account
    const chainIdSnapshot = chainId

    // Increment fetch epoch
    const currentEpochValue = ++fetchEpoch.value

    loading.value = true
    errorKey.value = null
    balance.value = null
    decimals.value = null

    try {
      // Create Web3 instance
      const web3 = createWeb3Instance(chainId)

      // Fetch balance
      const result = await getErc20Balance(web3, trimmedAddress, account)

      // Check epoch before committing (stale guard)
      if (isStaleRequest(fetchEpoch.value, currentEpochValue)) {
        // Stale request, ignore
        return
      }

      // Check if account/chain changed during fetch (additional stale protection)
      if (walletStore.epoch !== walletEpochSnapshot ||
          walletStore.account !== accountSnapshot ||
          walletStore.chainIdDec !== chainIdSnapshot) {
        // Account or chain changed, ignore result
        return
      }

      balance.value = result.value
      decimals.value = result.decimals
      errorKey.value = null
    } catch (err: unknown) {
      // Check epoch before committing error
      if (isStaleRequest(fetchEpoch.value, currentEpochValue)) {
        return // Stale request, ignore
      }

      // Check if account/chain changed during fetch
      if (walletStore.epoch !== walletEpochSnapshot ||
          walletStore.account !== accountSnapshot ||
          walletStore.chainIdDec !== chainIdSnapshot) {
        return // Account or chain changed, ignore error
      }

      // Map technical blockchain errors to ErrorKey for centralized error messages
      // Technical error details are logged to console in development mode
      // but never exposed to users in the UI
      errorKey.value = mapWeb3ErrorToKey(err)
      balance.value = null
      decimals.value = null
    } finally {
      // Check epoch before updating loading state
      if (!isStaleRequest(fetchEpoch.value, currentEpochValue)) {
        loading.value = false
      }
    }
  }

  /**
   * Reset store state
   */
  function reset() {
    contractAddress.value = ''
    loading.value = false
    balance.value = null
    decimals.value = null
    errorKey.value = null
  }

  return {
    // State
    contractAddress,
    loading,
    balance,
    decimals,
    errorKey,
    fetchEpoch,
    // Actions
    setContractAddress,
    checkBalance,
    reset
  }
})
