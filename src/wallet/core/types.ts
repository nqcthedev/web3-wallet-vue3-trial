/**
 * Core wallet types and interfaces
 */

import type { WalletId, WalletType } from '@/shared/types'

/**
 * Wallet event types
 */
export type WalletEventType = 'accountsChanged' | 'chainChanged' | 'disconnect'

/**
 * Wallet event payloads by event type
 */
export type AccountsChangedPayload = string[]
export type ChainChangedPayload = string
export type DisconnectPayload = { code: number; message: string }

/**
 * Wallet event payload union
 */
export type WalletEventPayload = AccountsChangedPayload | ChainChangedPayload | DisconnectPayload

/**
 * Wallet event
 */
export interface WalletEvent {
  type: WalletEventType
  payload: WalletEventPayload
}

/**
 * Type-safe wallet event handlers
 */
export type AccountsChangedHandler = (accounts: AccountsChangedPayload) => void
export type ChainChangedHandler = (chainId: ChainChangedPayload) => void
export type DisconnectHandler = (error: DisconnectPayload) => void

/**
 * Base wallet interface
 */
export interface IWallet {
  id: WalletId
  name: string
  type: WalletType
  icon?: string

  /**
   * Check if wallet is installed
   */
  isInstalled(): boolean

  /**
   * Connect to wallet
   * @returns Promise resolving to connected accounts
   */
  connect(): Promise<string[]>

  /**
   * Disconnect locally (clear local state only)
   */
  disconnectLocal(): void

  /**
   * Get current accounts
   * @returns Promise resolving to current accounts
   */
  getAccounts(): Promise<string[]>

  /**
   * Subscribe to wallet events
   */
  on(event: WalletEventType, handler: (event: WalletEvent) => void): void

  /**
   * Unsubscribe from wallet events
   */
  off(event: WalletEventType, handler: (event: WalletEvent) => void): void
}

/**
 * EVM wallet interface (extends base)
 */
export interface IEVMWallet extends IWallet {
  type: 'EVM'

  /**
   * Request method (EIP-1193)
   * @param method - RPC method name
   * @param params - Optional method parameters
   * @returns Promise resolving to method result
   */
  request(method: string, params?: unknown[]): Promise<unknown>

  /**
   * Get current chain ID
   * @returns Promise resolving to hex chain ID (e.g., "0x1")
   */
  getChainId(): Promise<string>
}

/**
 * Solana wallet interface (extends base)
 * Stub for future implementation
 */
export interface ISolanaWallet extends IWallet {
  type: 'SOLANA'
  // TODO: Add Solana-specific methods (connect, sign, send, etc.)
}
