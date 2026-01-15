<template>
  <div class="space-y-4">
    <SectionHeader
      title="Custom Token Balance"
      description="Check balance for any ERC-20 token by entering its contract address"
    />

    <!-- Not Connected -->
    <InlineAlert v-if="!walletStore.isConnected" variant="warning">
      <p>{{ SUCCESS_MESSAGES.CUSTOM_TOKEN_NOT_CONNECTED_INFO }}</p>
    </InlineAlert>

    <!-- Connected State -->
    <div v-else class="space-y-4">
      <!-- Input Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <label for="contract-address" class="block text-sm font-medium text-gray-900 dark:text-gray-100">
          ERC-20 Contract Address
        </label>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <input
              id="contract-address"
              v-model="inputValue"
              type="text"
              placeholder="0x..."
              :disabled="customTokenBalanceStore.loading"
              :aria-invalid="!!validationError"
              :aria-describedby="validationError ? 'contract-address-error' : 'contract-address-helper'"
              @keyup.enter="handleCheckBalance"
              :class="[
                'w-full px-4 py-3 min-h-[44px] border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors font-mono',
                validationError
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
              ]"
            />
          </div>
          <div class="flex gap-2 sm:flex-shrink-0">
            <button
              @click="handleCheckBalance"
              :disabled="!canCheck || customTokenBalanceStore.loading"
              class="px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium text-sm flex items-center gap-2"
            >
              <svg v-if="customTokenBalanceStore.loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{
                customTokenBalanceStore.loading
                  ? SUCCESS_MESSAGES.CUSTOM_TOKEN_LOADING_LABEL
                  : SUCCESS_MESSAGES.CUSTOM_TOKEN_CHECK_BALANCE_LABEL
              }}
            </button>
            <button
              v-if="customTokenBalanceStore.balance || customTokenBalanceStore.errorKey"
              @click="handleClear"
              class="px-4 py-3 min-h-[44px] bg-gray-600 text-white rounded-lg hover:bg-gray-700 whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium text-sm"
            >
              Clear
            </button>
          </div>
        </div>
        <!-- Helper Text -->
        <p
          v-if="!validationError && trimmedInput === ''"
          id="contract-address-helper"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          {{ SUCCESS_MESSAGES.CUSTOM_TOKEN_INPUT_HELPER }}
        </p>
        <!-- Validation Error -->
        <p
          v-if="validationError"
          id="contract-address-error"
          class="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {{ validationError }}
        </p>
      </div>

      <!-- Loading State (Skeleton) -->
      <div v-if="customTokenBalanceStore.loading" class="space-y-4" role="status" aria-live="polite">
        <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p class="text-blue-800 dark:text-blue-200 text-sm">
            {{ SUCCESS_MESSAGES.CUSTOM_TOKEN_FETCHING_INFO }}
          </p>
        </div>
        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <Skeleton custom-class="h-10 w-40" />
          <Skeleton custom-class="h-4 w-32" />
        </div>
        <span class="sr-only">Loading token balance</span>
      </div>

      <!-- Error State -->
      <InlineAlert v-else-if="customTokenBalanceStore.errorKey" variant="error">
        <p>{{ ERROR_MESSAGES[customTokenBalanceStore.errorKey] }}</p>
        <template #action>
          <button
            v-if="canCheck"
            @click="handleCheckBalance"
            class="ml-2 px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
            aria-label="Retry checking token balance"
          >
            Retry
          </button>
        </template>
      </InlineAlert>

      <!-- Result State -->
      <div
        v-else-if="customTokenBalanceStore.balance !== null"
        class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
      >
        <div class="pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Balance</h3>
          <p class="text-3xl font-semibold text-gray-900 dark:text-gray-100">{{ customTokenBalanceStore.balance }}</p>
        </div>
        <div v-if="customTokenBalanceStore.decimals !== null" class="flex items-center justify-between py-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Decimals</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ customTokenBalanceStore.decimals }}</span>
        </div>
        <div class="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400">Contract:</span>
          <span class="text-xs font-mono text-gray-700 dark:text-gray-300">{{ shortAddress(customTokenBalanceStore.contractAddress) }}</span>
          <CopyButton
            :address="customTokenBalanceStore.contractAddress"
            ariaLabel="Copy contract address to clipboard"
            title="Copy contract address"
            :successMessage="SUCCESS_MESSAGES.COPY_CONTRACT_ADDRESS_SUCCESS"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWalletStore } from '@/store/wallet'
import { useCustomTokenBalanceStore } from '@/store/customTokenBalance'
import { shortAddress, isValidEthereumAddress } from '@/shared/utils'
import { SectionHeader, InlineAlert, Skeleton, CopyButton } from '@/components/ui'
import { ERROR_MESSAGES } from '@/messages/errors'
import { SUCCESS_MESSAGES } from '@/messages/success'

const walletStore = useWalletStore()
const customTokenBalanceStore = useCustomTokenBalanceStore()

// Local input value (not synced to store until user action)
const inputValue = ref('')

/**
 * Validation error message
 * Memoize trimmed value to avoid multiple trim() calls
 */
const trimmedInput = computed(() => inputValue.value.trim())

const validationError = computed(() => {
  if (!trimmedInput.value) {
    return null // No error for empty input until user tries to check
  }
  if (!isValidEthereumAddress(trimmedInput.value)) {
    return ERROR_MESSAGES.TOKEN_ADDRESS_INVALID
  }
  return null
})

/**
 * Check if balance can be checked
 */
const canCheck = computed(() => {
  return walletStore.isConnected && 
         trimmedInput.value !== '' && 
         isValidEthereumAddress(trimmedInput.value) &&
         !customTokenBalanceStore.loading
})

/**
 * Handle check balance action
 */
async function handleCheckBalance() {
  if (!canCheck.value || !walletStore.account || !walletStore.chainIdDec) {
    return
  }

  // Clear previous error before checking
  if (customTokenBalanceStore.errorKey) {
    customTokenBalanceStore.clearError()
  }

  // Update store with input value
  customTokenBalanceStore.setContractAddress(trimmedInput.value)

  // Check balance with stale protection
  await customTokenBalanceStore.checkBalance({
    account: walletStore.account,
    chainId: walletStore.chainIdDec
  })
}

/**
 * Handle clear action
 */
function handleClear() {
  inputValue.value = ''
  customTokenBalanceStore.reset()
}


// Watch for account/chain changes and wallet disconnect, clear state
watch(
  [() => walletStore.account, () => walletStore.chainIdDec, () => walletStore.isConnected],
  ([newAccount, newChainId, isConnected], [oldAccount, oldChainId, wasConnected]) => {
    // Clear state if account/chain changed or wallet disconnected (skip initial mount)
    if (
      (oldAccount !== undefined && newAccount !== oldAccount) ||
      (oldChainId !== undefined && newChainId !== oldChainId) ||
      (wasConnected !== undefined && wasConnected && !isConnected)
    ) {
      customTokenBalanceStore.reset()
      inputValue.value = ''
    }
  }
)
</script>
