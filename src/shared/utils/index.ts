/**
 * Shared utility functions
 */

/**
 * Shorten address for display
 * @param address - Full address string
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Shortened address (e.g., "0x1234...5678")
 */
export function shortAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (!address || address.length < startChars + endChars) {
    return address
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

/**
 * Convert hex chain ID to decimal
 * @param hex - Hex string (e.g., "0x1")
 * @returns Decimal number or null if invalid
 */
export function hexToDecimal(hex: string | null): number | null {
  if (!hex) return null
  try {
    return parseInt(hex, 16)
  } catch {
    return null
  }
}

/**
 * Convert decimal chain ID to hex
 * @param decimal - Decimal number
 * @returns Hex string (e.g., "0x1")
 */
export function decimalToHex(decimal: number | null): string | null {
  if (decimal === null) return null
  return `0x${decimal.toString(16)}`
}

/**
 * Validate Ethereum address format
 * @param address - Address string to validate
 * @returns True if address format is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim())
}

// Re-export clipboard utilities
export { copyToClipboard } from './clipboard'

// Re-export wallet utilities
export { isUserRejection } from './wallet'

// Re-export epoch utilities
export { isEpochValid, isStaleRequest } from './epoch'

// Re-export error mapping utilities
export { mapWeb3ErrorToKey } from './web3ErrorMapper'
