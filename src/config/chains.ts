/**
 * Chain configuration
 * Maps chain IDs to chain names and metadata
 */

export interface ChainConfig {
  id: number
  name: string
  shortName: string
  isTestnet: boolean
}

/**
 * Supported chains configuration
 */
export const CHAIN_CONFIG: Record<number, ChainConfig> = {
  // Ethereum
  1: {
    id: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    isTestnet: false
  },
  11155111: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    shortName: 'Sepolia',
    isTestnet: true
  },
  // BNB Chain
  56: {
    id: 56,
    name: 'BNB Chain Mainnet',
    shortName: 'BNB Chain',
    isTestnet: false
  },
  97: {
    id: 97,
    name: 'BNB Chain Testnet',
    shortName: 'BNB Testnet',
    isTestnet: true
  },
  // Base
  8453: {
    id: 8453,
    name: 'Base Mainnet',
    shortName: 'Base',
    isTestnet: false
  },
  84532: {
    id: 84532,
    name: 'Base Sepolia',
    shortName: 'Base Sepolia',
    isTestnet: true
  }
}

/**
 * Get chain config by chain ID
 * @param chainId - Chain ID (decimal)
 * @returns Chain config or null if not found
 */
export function getChainConfig(chainId: number | null): ChainConfig | null {
  if (chainId === null) return null
  return CHAIN_CONFIG[chainId] || null
}

/**
 * Get chain name by chain ID
 * @param chainId - Chain ID (decimal)
 * @returns Chain name or "Unknown Network" if not found
 */
export function getChainName(chainId: number | null): string {
  const config = getChainConfig(chainId)
  return config?.name || 'Unknown Network'
}
