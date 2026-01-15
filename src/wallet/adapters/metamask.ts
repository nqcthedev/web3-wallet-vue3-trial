/**
 * MetaMask wallet adapter (EIP-1193)
 */

import type { IEVMWallet, WalletEvent, AccountsChangedPayload, ChainChangedPayload, DisconnectPayload } from '../core/types'

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
   * Check if MetaMask is installed
   */
  isInstalled(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask === true
  }

  /**
   * Connect to MetaMask
   */
  async connect(): Promise<string[]> {
    if (!this.isInstalled()) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const accounts = await window.ethereum!.request({
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
    if (!this.isInstalled()) {
      return []
    }

    try {
      const accounts = await window.ethereum!.request({
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
    if (!this.isInstalled()) {
      throw new Error('MetaMask is not installed')
    }

    return window.ethereum!.request({ method, params })
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<string> {
    if (!this.isInstalled()) {
      throw new Error('MetaMask is not installed')
    }

    try {
      const chainId = await window.ethereum!.request({
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
    if (!this.isInstalled()) {
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
    
    window.ethereum!.on(event, wrapper)

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
    if (!this.isInstalled()) {
      return
    }

    // Remove handler
    this.eventHandlers.get(event)?.delete(handler)
    
    // Remove wrapper and unsubscribe from MetaMask
    const wrapper = this.wrapperMap.get(event)?.get(handler)
    if (wrapper && window.ethereum) {
      window.ethereum.removeListener(event, wrapper)
      this.wrapperMap.get(event)?.delete(handler)
    }
  }
}
