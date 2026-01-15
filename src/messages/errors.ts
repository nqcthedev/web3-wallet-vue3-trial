/**
 * Centralized user-facing error messages
 * All error messages displayed to users should use keys from this file
 */

export const ERROR_MESSAGES = {
  // Wallet/Provider errors
  WALLET_ADAPTER_NOT_FOUND: 'Wallet adapter not found',
  WALLET_NOT_INSTALLED: 'Wallet is not installed',
  WALLET_CONNECT_FAILED: 'Failed to connect wallet',
  WALLET_CONNECT_REJECTED: 'Connection rejected',
  WALLET_CONNECT_REJECTED_DESC: 'Please approve the connection request in your wallet',
  WALLET_CONNECT_ERROR: 'An error occurred. Please try again later.',
  WALLET_METAMASK_NOT_INSTALLED: 'MetaMask is not installed',
  WALLET_METAMASK_CONNECT_FAILED: 'Failed to connect to MetaMask',
  WALLET_CHAIN_ID_FAILED: 'Failed to get chain ID',
  
  // Network/Chain errors
  CHAIN_ID_REQUIRED: 'Chain ID is required',
  NETWORK_UNSUPPORTED: 'This network is not supported',
  CHAIN_MISMATCH: 'Network mismatch detected',
  
  // Account errors
  ACCOUNT_REQUIRED: 'Account address is required',
  ACCOUNT_INVALID: 'Invalid account address',
  
  // ERC-20/Token errors
  TOKEN_CONTRACT_ADDRESS_REQUIRED: 'Contract address is required',
  TOKEN_ADDRESS_INVALID: 'Invalid Ethereum address format',
  TOKEN_NOT_SUPPORTED: 'This token is not supported on the current network, or the contract address is not a valid ERC-20 token.',
  TOKEN_BALANCE_FETCH_FAILED: 'Unable to fetch token balance. Please try again later.',
  TOKEN_BALANCES_FETCH_FAILED: 'Failed to fetch token balances',
  TOKEN_ERC20_FETCH_FAILED: 'Failed to fetch ERC-20 balance',
  
  // Balance/Data errors
  BALANCE_STALE: 'Balance data is stale, please refresh',
  DATA_FETCH_FAILED: 'Failed to fetch data',
  
  // Send-token errors (reserved for future)
  SEND_TOKEN_INSUFFICIENT_BALANCE: 'Insufficient balance',
  SEND_TOKEN_INVALID_RECIPIENT: 'Invalid recipient address',
  SEND_TOKEN_FAILED: 'Failed to send token',
  
  // Mobile UX errors
  MOBILE_WALLET_NOT_AVAILABLE: 'Wallet not available on this device',
  
  // Generic fallback
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again later.',
  OPERATION_FAILED: 'Operation failed. Please try again.',
  
  // UI helper messages (not errors, but user-facing)
  NO_ADDRESS_TO_COPY: 'No address to copy',
  COPY_ADDRESS_FAILED: 'Failed to copy address',
  COPY_ADDRESS_TRY_AGAIN: 'Please try again',
} as const

export type ErrorKey = keyof typeof ERROR_MESSAGES

/**
 * Get error message by key
 * @param key - Error key
 * @returns Error message string
 */
export function getErrorMessage(key: ErrorKey): string {
  return ERROR_MESSAGES[key]
}
