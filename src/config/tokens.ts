/**
 * Token configuration
 * Maps token symbols to their contract addresses by chain ID
 */

export type TokenSymbol = 'USDC' | 'USDT'

export interface TokenConfig {
  address: string
  symbol: TokenSymbol
  name?: string
  decimals: number
}

export type TokenMap = Record<number, Record<TokenSymbol, TokenConfig | null>>

/**
 * Token configuration map
 * chainId -> { USDC: config | null, USDT: config | null }
 */
export const TOKEN_MAP: TokenMap = {
  // Ethereum Mainnet (1)
  1: {
    USDC: {
      address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6
    },
    USDT: null
  },
  // Ethereum Sepolia (11155111)
  11155111: {
    USDC: null,
    USDT: null
  },
  // BNB Chain Mainnet (56)
  56: {
    USDC: null,
    USDT: null
  },
  // BNB Chain Testnet (97)
  97: {
    USDT: {
      address: '0x222D12d538b7FB8B17723322aF40379D51C70372',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18
    },
    USDC: {
      address: '0xb32B8625D2708FC7E7041BE4169EB188eeea3c14',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18
    }
  },
  // Base Mainnet (8453)
  8453: {
    USDC: null,
    USDT: null
  },
  // Base Sepolia (84532)
  84532: {
    USDC: null,
    USDT: null
  }
}

/**
 * Get token config for a specific chain and symbol
 * Returns null if token is not available on that chain (N/A status)
 */
export function getTokenConfig(chainId: number | null, symbol: TokenSymbol): TokenConfig | null {
  if (chainId === null) {
    return null
  }
  return TOKEN_MAP[chainId]?.[symbol] || null
}

/**
 * Get token address for a specific chain and symbol
 * Returns null if token is not available on that chain
 */
export function getTokenAddress(symbol: TokenSymbol, chainId: number | null): string | null {
  const config = getTokenConfig(chainId, symbol)
  return config?.address || null
}

/**
 * Get all available tokens for a chain
 * Returns object with USDC and USDT (can be null if not available)
 */
export function getTokensForChain(chainId: number): Record<TokenSymbol, TokenConfig | null> {
  return TOKEN_MAP[chainId] || { USDC: null, USDT: null }
}
