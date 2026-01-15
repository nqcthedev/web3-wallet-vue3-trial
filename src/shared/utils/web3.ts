/**
 * Web3 utility functions
 */

import Web3 from 'web3'
import { getRpcUrl } from '@/config/rpc'

// Cache Web3 instances by chainId to avoid creating new instances
const web3InstanceCache = new Map<number, Web3>()
const ethereumWeb3Instance: Web3 | null = typeof window !== 'undefined' && window.ethereum
  ? new Web3(window.ethereum)
  : null

/**
 * Create Web3 instance
 * Uses window.ethereum if available, otherwise falls back to public RPC
 * Caches instances by chainId to improve performance
 * @param chainId - Chain ID (decimal)
 * @returns Web3 instance
 */
export function createWeb3Instance(chainId: number): Web3 {
  // If using window.ethereum, return cached instance (works for all chains)
  if (ethereumWeb3Instance) {
    return ethereumWeb3Instance
  }
  
  // For RPC fallback, cache instances by chainId
  if (!web3InstanceCache.has(chainId)) {
    const rpcUrl = getRpcUrl(chainId)
    web3InstanceCache.set(chainId, new Web3(rpcUrl))
  }
  
  const cachedInstance = web3InstanceCache.get(chainId)
  if (!cachedInstance) {
    // Fallback: create new instance if cache somehow fails
    return new Web3(getRpcUrl(chainId))
  }
  return cachedInstance
}
