<template>
  <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
          <span class="text-white font-semibold text-sm">{{ tokenSymbol.charAt(0) }}</span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ tokenSymbol }}</h3>
      </div>
      <span
        :class="{
          'px-2.5 py-1 rounded-full text-xs font-medium': true,
          'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300': status === 'ok',
          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400': status === 'na',
          'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300': status === 'error',
          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300': status === 'loading'
        }"
        :aria-label="`Token status: ${getStatusLabel(status)}`"
      >
        {{ getStatusLabel(status) }}
      </span>
    </div>

    <!-- Loading State (Skeleton) -->
    <div v-if="isLoading" class="space-y-2" role="status" aria-live="polite">
      <Skeleton custom-class="h-8 w-32" />
      <Skeleton custom-class="h-4 w-24" />
      <span class="sr-only">Loading balance</span>
    </div>

    <!-- Success State -->
    <div v-else-if="balance && status === 'ok'" class="space-y-3">
      <div>
        <p class="text-3xl font-semibold text-gray-900 dark:text-gray-100">{{ balance.value }}</p>
        <div v-if="balance.address" class="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {{ shortAddress(balance.address) }}
          </p>
          <CopyButton
            :address="balance.address"
            :ariaLabel="`Copy ${tokenSymbol} contract address to clipboard`"
            :title="`Copy ${tokenSymbol} address`"
            :successMessage="SUCCESS_MESSAGES.COPY_CONTRACT_ADDRESS_SUCCESS"
          />
        </div>
      </div>
    </div>

    <!-- N/A State -->
    <div v-else-if="status === 'na'" class="space-y-2 py-2">
      <p class="text-2xl font-bold text-gray-300 dark:text-gray-600">—</p>
      <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">
        {{ SUCCESS_MESSAGES.TOKEN_NA_ON_NETWORK }}
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="status === 'error'" class="space-y-2 py-2">
      <p class="text-lg font-bold text-red-600 dark:text-red-400">Error</p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ SUCCESS_MESSAGES.TOKEN_STATUS_ERROR }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { shortAddress } from '@/shared/utils'
import { CopyButton, Skeleton } from '@/components/ui'
import { SUCCESS_MESSAGES } from '@/messages/success'
import type { TokenStatus } from '@/store/tokenBalances'

interface TokenBalance {
  value: string
  address?: string
  status: TokenStatus
}

interface Props {
  tokenSymbol: string
  balance: TokenBalance | null
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false
})

const status = computed(() => props.balance?.status || 'na')

/**
 * Get status label for badge using centralized messages
 */
function getStatusLabel(status: TokenStatus | undefined): string {
  if (!status) return SUCCESS_MESSAGES.TOKEN_STATUS_NA
  switch (status) {
    case 'ok':
      return SUCCESS_MESSAGES.TOKEN_STATUS_OK
    case 'na':
      return SUCCESS_MESSAGES.TOKEN_STATUS_NA
    case 'error':
      return SUCCESS_MESSAGES.TOKEN_STATUS_ERROR
    case 'loading':
      return SUCCESS_MESSAGES.TOKEN_STATUS_LOADING
    default:
      return SUCCESS_MESSAGES.TOKEN_STATUS_NA
  }
}
</script>
