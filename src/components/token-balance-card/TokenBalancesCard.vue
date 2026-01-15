<template>
  <div class="space-y-4">
    <SectionHeader title="Token Balances">
      <template #badge>
        <button
          v-if="walletStore.isConnected && walletStore.chainIdDec && !isUnsupportedNetwork"
          @click="handleRefresh"
          :disabled="tokenBalancesStore.loading"
          class="px-4 py-2 min-h-[44px] text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center gap-2"
        >
          <svg v-if="tokenBalancesStore.loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ tokenBalancesStore.loading ? SUCCESS_MESSAGES.TOKEN_BALANCES_LOADING_LABEL : SUCCESS_MESSAGES.TOKEN_BALANCES_REFRESH_LABEL }}
        </button>
      </template>
    </SectionHeader>

    <!-- Network Info -->
    <div v-if="walletStore.isConnected && walletStore.chainIdDec && !isUnsupportedNetwork" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div class="flex items-center gap-2 text-sm">
        <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ networkName }}</span>
        <span v-if="walletStore.chainIdHex" class="ml-auto text-xs text-gray-500 dark:text-gray-400 font-mono">
          {{ walletStore.chainIdDec }}
        </span>
      </div>
    </div>

    <!-- Not Connected -->
    <InlineAlert v-if="!walletStore.isConnected" variant="warning">
      <p>{{ SUCCESS_MESSAGES.TOKEN_BALANCES_NOT_CONNECTED_INFO }}</p>
    </InlineAlert>

    <!-- Unsupported Network -->
    <InlineAlert v-else-if="isUnsupportedNetwork" variant="warning">
      <p>{{ ERROR_MESSAGES.NETWORK_UNSUPPORTED }}</p>
      <template #action>
        <button
          @click="handleSwitchNetwork"
          class="ml-2 px-3 py-1 text-xs font-medium bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-gray-900"
        >
          {{ SUCCESS_MESSAGES.NETWORK_SWITCH_CTA }}
        </button>
      </template>
    </InlineAlert>

    <!-- Error -->
    <InlineAlert v-else-if="tokenBalancesStore.errorKey" variant="error">
      <p>{{ ERROR_MESSAGES[tokenBalancesStore.errorKey] }}</p>
      <template #action>
        <button
          @click="handleRefresh"
          :disabled="tokenBalancesStore.loading"
          class="ml-2 px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
          aria-label="Retry fetching token balances"
        >
          Retry
        </button>
      </template>
    </InlineAlert>

    <!-- Token Cards -->
    <div v-else-if="walletStore.isConnected && walletStore.chainIdDec && !isUnsupportedNetwork" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <TokenBalanceCard
        token-symbol="USDC"
        :balance="tokenBalancesStore.balances.USDC"
        :is-loading="tokenBalancesStore.loading"
      />
      <TokenBalanceCard
        token-symbol="USDT"
        :balance="tokenBalancesStore.balances.USDT"
        :is-loading="tokenBalancesStore.loading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useWalletStore } from '@/store/wallet'
import { useTokenBalancesStore } from '@/store/tokenBalances'
import TokenBalanceCard from './TokenBalanceCard.vue'
import { SectionHeader, InlineAlert } from '@/components/ui'
import { getChainName, getChainConfig } from '@/config/chains'
import { ERROR_MESSAGES } from '@/messages/errors'
import { SUCCESS_MESSAGES } from '@/messages/success'

const walletStore = useWalletStore()
const tokenBalancesStore = useTokenBalancesStore()

/**
 * Get network name for display
 */
const networkName = computed(() => {
  return getChainName(walletStore.chainIdDec)
})

/**
 * Check if current network is unsupported
 */
const isUnsupportedNetwork = computed(() => {
  if (!walletStore.chainIdDec) return false
  return getChainConfig(walletStore.chainIdDec) === null
})

/**
 * Handle switch network (placeholder - would trigger wallet switch in real app)
 */
function handleSwitchNetwork() {
  // In a real app, this would trigger:
  // wallet.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x...' }] })
  // Left as a no-op in this coding test implementation.
}

/**
 * Handle manual refresh
 */
async function handleRefresh() {
  if (!walletStore.account || !walletStore.chainIdDec) {
    return
  }

  // Clear error before refresh
  if (tokenBalancesStore.errorKey) {
    tokenBalancesStore.clearError()
  }

  await tokenBalancesStore.fetchBalances(
    walletStore.account,
    walletStore.chainIdDec,
    tokenBalancesStore.fetchEpoch,
    true // Manual refresh
  )
}

/**
 * Fetch balances when account or chain changes
 */
async function fetchBalancesIfNeeded() {
  if (!walletStore.isConnected || !walletStore.account || !walletStore.chainIdDec) {
    tokenBalancesStore.clearBalances()
    return
  }

  // Fetch balances for any chain (config will determine which tokens are available)
  await tokenBalancesStore.fetchBalances(
    walletStore.account,
    walletStore.chainIdDec,
    tokenBalancesStore.fetchEpoch,
    false // Auto-fetch, not manual
  )
}

// Track if this is the first mount
let isFirstMount = true

// Watch for account or chain changes (only when they actually change, not on mount)
watch(
  [() => walletStore.account, () => walletStore.chainIdDec],
  (newValues, oldValues) => {
    // Skip fetch on initial mount
    if (isFirstMount) {
      isFirstMount = false
      return
    }
    
    // Only fetch if values actually changed
    if (oldValues && (oldValues[0] !== newValues[0] || oldValues[1] !== newValues[1])) {
      fetchBalancesIfNeeded()
    }
  }
)
</script>
