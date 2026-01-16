/**
 * MetaMask wallet adapter (EIP-1193)
 */

import type { IEVMWallet, WalletEvent, AccountsChangedPayload, ChainChangedPayload, DisconnectPayload } from '../core/types'

/**
 * Ethereum provider interface
 */
interface EthereumProvider {
  isMetaMask?: boolean
  providers?: EthereumProvider[]
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
}

/**
 * MetaMask wallet adapter implementation
 */
export class MetaMaskAdapter implements IEVMWallet {
  id = 'metamask' as const
  name = 'MetaMask'
  type = 'EVM' as const

  private eventHandlers: Map<string, Set<(event: WalletEvent) => void>> = new Map()
  private wrapperMap: Map<string, Map<(event: WalletEvent) => void, (...args: unknown[]) => void>> = new Map()

  /**
   * Get MetaMask provider
   * Handles window.ethereum.providers array and direct injection
   */
  private getProvider(): EthereumProvider | null {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null
    }

    // Check if providers array exists (multiple wallets installed)
    if (Array.isArray((window.ethereum as any).providers)) {
      // Find MetaMask in providers array
      const metamaskProvider = (window.ethereum as any).providers.find(
        (provider: EthereumProvider) => provider.isMetaMask === true
      )
      if (metamaskProvider) {
        return metamaskProvider
      }
    }

    // Check if MetaMask is directly injected
    if ((window.ethereum as EthereumProvider).isMetaMask === true) {
      return window.ethereum as EthereumProvider
    }

    return null
  }

  /**
   * Check if MetaMask is installed
   */
  isInstalled(): boolean {
    return this.getProvider() !== null
  }

  /**
   * Connect to MetaMask
   */
  async connect(): Promise<string[]> {
    const provider = this.getProvider()
    if (!provider) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      })
      return accounts as string[]
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to MetaMask'
      throw new Error(errorMessage)
    }
  }

  /**
   * Disconnect locally (clear local state only)
   * Note: EIP-1193 doesn't have a disconnect method, so this is a no-op
   */
  disconnectLocal(): void {
    // MetaMask doesn't support programmatic disconnect
    // This is handled by the store
  }

  /**
   * Get current accounts
   */
  async getAccounts(): Promise<string[]> {
    const provider = this.getProvider()
    if (!provider) {
      return []
    }

    try {
      const accounts = await provider.request({
        method: 'eth_accounts'
      })
      return accounts as string[]
    } catch {
      return []
    }
  }

  /**
   * Request method (EIP-1193)
   */
  async request(method: string, params?: unknown[]): Promise<unknown> {
    const provider = this.getProvider()
    if (!provider) {
      throw new Error('MetaMask is not installed')
    }

    return provider.request({ method, params })
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<string> {
    const provider = this.getProvider()
    if (!provider) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const chainId = await provider.request({
        method: 'eth_chainId'
      })
      return chainId as string
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get chain ID'
      throw new Error(errorMessage)
    }
  }

  /**
   * Subscribe to wallet events
   */
  on(event: 'accountsChanged' | 'chainChanged' | 'disconnect', handler: (event: WalletEvent) => void): void {
    const provider = this.getProvider()
    if (!provider) {
      return
    }

    // Check if handler is already registered
    if (this.eventHandlers.get(event)?.has(handler)) {
      return // Already registered, prevent duplicate listeners
    }

    // Store handler
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.add(handler)
    }

    // Create type-safe wrapper for MetaMask event and store it for cleanup
    const wrapper = this.createEventWrapper(event, handler)
    if (!wrapper) {
      return
    }
    
    provider.on(event, wrapper)

    // Store wrapper for cleanup
    if (!this.wrapperMap.has(event)) {
      this.wrapperMap.set(event, new Map())
    }
    const wrapperMap = this.wrapperMap.get(event)
    if (wrapperMap) {
      wrapperMap.set(handler, wrapper)
    }
  }

  /**
   * Create event wrapper for MetaMask events
   * @private
   */
  private createEventWrapper(
    event: 'accountsChanged' | 'chainChanged' | 'disconnect',
    handler: (event: WalletEvent) => void
  ): ((...args: unknown[]) => void) | null {
    if (event === 'accountsChanged') {
      return (...args: unknown[]) => {
        const accounts = args[0] as AccountsChangedPayload
        handler({
          type: 'accountsChanged',
          payload: accounts
        })
      }
    }
    
    if (event === 'chainChanged') {
      return (...args: unknown[]) => {
        const chainId = args[0] as ChainChangedPayload
        handler({
          type: 'chainChanged',
          payload: chainId
        })
      }
    }
    
    if (event === 'disconnect') {
      return (...args: unknown[]) => {
        const error = args[0] as DisconnectPayload
        handler({
          type: 'disconnect',
          payload: error
        })
      }
    }
    
    return null
  }

  /**
   * Unsubscribe from wallet events
   */
  off(event: 'accountsChanged' | 'chainChanged' | 'disconnect', handler: (event: WalletEvent) => void): void {
    const provider = this.getProvider()
    if (!provider) {
      return
    }

    // Remove handler
    this.eventHandlers.get(event)?.delete(handler)
    
    // Remove wrapper and unsubscribe from MetaMask
    const wrapper = this.wrapperMap.get(event)?.get(handler)
    if (wrapper && provider.removeListener) {
      provider.removeListener(event, wrapper)
      this.wrapperMap.get(event)?.delete(handler)
    }
  }
}
