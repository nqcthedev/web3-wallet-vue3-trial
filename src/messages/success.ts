/**
 * Centralized user-facing success / info / non-error messages
 * All non-error user messages (including toast titles/descriptions and
 * informational UI messages) should use keys from this file.
 */

export const SUCCESS_MESSAGES = {
  // Wallet connection toasts
  WALLET_CONNECT_SUCCESS_TITLE: 'Wallet connected successfully!',
  WALLET_CONNECT_SUCCESS_DESC_PREFIX: 'Address:',

  WALLET_DISCONNECT_INFO_TITLE: 'Wallet disconnected',
  WALLET_DISCONNECT_INFO_DESC: 'You can reconnect anytime',

  WALLET_ACCOUNT_SWITCHED_TITLE: 'Account switched',
  WALLET_ACCOUNT_SWITCHED_DESC_PREFIX: 'New account:',

  // Wallet status labels
  WALLET_STATUS_DISCONNECTED: 'Disconnected',
  WALLET_STATUS_CONNECTING: 'Connecting',
  WALLET_STATUS_CONNECTED: 'Connected',
  WALLET_STATUS_ERROR: 'Error',

  // Copy address helpers
  COPY_ADDRESS_SUCCESS: 'Address copied!',
  COPY_CONTRACT_ADDRESS_SUCCESS: 'Contract address copied!',

  // Token balances (built-in tokens)
  TOKEN_BALANCES_NOT_CONNECTED_INFO: 'Not connected. Please connect your wallet to view token balances.',
  TOKEN_BALANCES_REFRESH_LABEL: 'Refresh',
  TOKEN_BALANCES_LOADING_LABEL: 'Loading...',
  TOKEN_NA_ON_NETWORK: 'Not available on this network',
  TOKEN_STATUS_OK: 'OK',
  TOKEN_STATUS_NA: 'N/A',
  TOKEN_STATUS_ERROR: 'Error',
  TOKEN_STATUS_LOADING: 'Loading',

  // Network helpers
  NETWORK_SWITCH_CTA: 'Switch network',

  // Custom token balance
  CUSTOM_TOKEN_NOT_CONNECTED_INFO: 'Please connect your wallet to check custom token balances.',
  CUSTOM_TOKEN_CHECK_BALANCE_LABEL: 'Check Balance',
  CUSTOM_TOKEN_LOADING_LABEL: 'Loading...',
  CUSTOM_TOKEN_FETCHING_INFO: 'Fetching token balance...',
  CUSTOM_TOKEN_INPUT_HELPER: 'Enter an ERC-20 contract address (0x...) on the current network.',
} as const

export type SuccessKey = keyof typeof SUCCESS_MESSAGES

export function getSuccessMessage(key: SuccessKey): string {
  return SUCCESS_MESSAGES[key]
}

