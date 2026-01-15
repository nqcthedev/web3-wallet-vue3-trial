/**
 * RPC endpoint configuration by chain ID
 */

export const RPC_URLS: Record<number, string> = {
  // Ethereum
  1: 'https://eth.llamarpc.com',
  11155111: 'https://rpc.sepolia.org',
  
  // BNB Chain
  56: 'https://bsc-dataseed.binance.org',
  97: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  
  // Base
  8453: 'https://mainnet.base.org',
  84532: 'https://sepolia.base.org'
}

/**
 * Get RPC URL for a chain ID
 * @param chainId - Chain ID (decimal)
 * @returns RPC URL or default Ethereum mainnet
 */
export function getRpcUrl(chainId: number): string {
  return RPC_URLS[chainId] || 'https://eth.llamarpc.com'
}
