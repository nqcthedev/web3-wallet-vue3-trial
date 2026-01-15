/**
 * Token balances store
 * Fetches and manages USDC/USDT balances with stale-request protection
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TokenSymbol } from '@/config/tokens'
import { getTokensForChain } from '@/config/tokens'
import { getErc20Balance } from '@/features/tokens/core/erc20'
import { createWeb3Instance } from '@/shared/utils/web3'
import { mapWeb3ErrorToKey } from '@/shared/utils/web3ErrorMapper'
import { isStaleRequest } from '@/shared/utils/epoch'
import type { ErrorKey } from '@/messages/errors'

export type TokenStatus = 'ok' | 'na' | 'error' | 'loading'

export interface TokenBalance {
  address: string
  value: string // Human-readable balance
  status: TokenStatus
  decimals: number
  symbol?: string
}

export const useTokenBalancesStore = defineStore('tokenBalances', () => {
  // State
  const balances = ref<Record<TokenSymbol, TokenBalance | null>>({
    USDC: null,
    USDT: null
  })
  const loading = ref(false)
  const errorKey = ref<ErrorKey | null>(null)
  const lastUpdated = ref<number | null>(null)
  const fetchEpoch = ref(0)

  /**
   * Fetch token balances for USDC and USDT
   * Uses epoch guard to prevent stale data when account/chain changes quickly
   * Fetches balances in parallel for better performance
   * @param account - Account address to fetch balances for
   * @param chainId - Chain ID (decimal)
   * @param expectedEpoch - Expected epoch before increment (for stale guard)
   * @param _isManualRefresh - Whether this is a manual refresh (for UI feedback, reserved for future use)
   */
  async function fetchBalances(
    account: string,
    chainId: number,
    expectedEpoch: number,
    _isManualRefresh = false
  ) {
    // Check if expected epoch matches current epoch (stale guard)
    // This prevents stale requests from overwriting newer data
    if (expectedEpoch !== fetchEpoch.value) {
      // This request is already stale, ignore
      return
    }

    // Increment fetch epoch at start
    const currentEpochValue = ++fetchEpoch.value

    loading.value = true
    errorKey.value = null

    try {
      // Get token configs for this chain
      const tokenConfigs = getTokensForChain(chainId)

      // Create Web3 instance
      const web3 = createWeb3Instance(chainId)

      // Fetch balances in parallel - use array directly instead of Object.entries for better performance
      const symbols: TokenSymbol[] = ['USDC', 'USDT']
      const balancePromises = symbols.map(async (symbol): Promise<{ symbol: TokenSymbol; balance: TokenBalance | null }> => {
        const config = tokenConfigs[symbol]
        
        if (!config) {
          // Token not available on this chain
          return {
            symbol,
            balance: {
              address: '',
              value: '—',
              status: 'na',
              decimals: 0
            }
          }
        }

        try {
          // Fetch balance
          const result = await getErc20Balance(web3, config.address, account)
          return {
            symbol,
            balance: {
              address: config.address,
              value: result.value,
              status: 'ok' as TokenStatus,
              decimals: result.decimals,
              symbol: result.symbol || symbol
            }
          }
        } catch (err) {
          console.error(`Failed to fetch ${symbol} balance:`, err)
          return {
            symbol,
            balance: {
              address: config.address,
              value: 'Error',
              status: 'error' as TokenStatus,
              decimals: config.decimals
            }
          }
        }
      })

      // Wait for all balances
      const results = await Promise.all(balancePromises)

      // Check epoch again before committing (stale guard)
      if (isStaleRequest(fetchEpoch.value, currentEpochValue)) {
        // This request is stale, ignore results
        return
      }

      // Update balances - use reduce for better performance
      const newBalances = results.reduce((acc, { symbol, balance }) => {
        acc[symbol] = balance
        return acc
      }, { USDC: null, USDT: null } as Record<TokenSymbol, TokenBalance | null>)

      balances.value = newBalances
      lastUpdated.value = Date.now()
      errorKey.value = null
    } catch (err: unknown) {
      // Check epoch before committing error
      if (isStaleRequest(fetchEpoch.value, currentEpochValue)) {
        return // Stale request, ignore
      }

      // Map error to ErrorKey for centralized error messages
      errorKey.value = mapWeb3ErrorToKey(err)
      console.error('Error fetching token balances:', err)
    } finally {
      // Check epoch before updating loading state
      if (!isStaleRequest(fetchEpoch.value, currentEpochValue)) {
        loading.value = false
      }
    }
  }

  /**
   * Clear balances (reset state)
   */
  function clearBalances() {
    balances.value = {
      USDC: null,
      USDT: null
    }
    loading.value = false
    errorKey.value = null
    lastUpdated.value = null
  }

  /**
   * Clear error only
   */
  function clearError() {
    errorKey.value = null
  }

  return {
    // State
    balances,
    loading,
    errorKey,
    lastUpdated,
    fetchEpoch,
    // Actions
    fetchBalances,
    clearBalances,
    clearError
  }
})
