<template>
  <div class="space-y-6">
    <!-- Header with Status Badge -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Wallet Connection</h2>
      <StatusBadge :status="connectionStatus" />
    </div>
    
    <!-- Installed Wallets Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 class="text-base font-semibold mb-4 text-gray-900 dark:text-gray-100">Installed Wallets</h3>
      <div
        v-if="walletStore.installedWallets.length === 0"
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
      >
        <p class="text-sm text-gray-700 dark:text-gray-300">
          No wallets detected. Please install MetaMask to start using the dApp.
        </p>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Install MetaMask
        </a>
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="walletId in walletStore.installedWallets"
          :key="walletId"
          class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <span class="font-medium capitalize text-gray-900 dark:text-gray-100">{{ walletId }}</span>
          </div>
          <button
            v-if="walletStore.activeWalletId !== walletId"
            @click="handleConnect(walletId)"
            :disabled="walletStore.status === 'connecting'"
            class="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium text-sm"
          >
            Connect
          </button>
          <span
            v-else
            class="px-4 py-2 min-h-[44px] bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Connected
          </span>
        </li>
      </ul>
    </div>

    <!-- Connection Status -->
    <div
      v-if="walletStore.status === 'connecting'"
      class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-900 dark:text-yellow-100 flex items-center gap-2"
    >
      <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ SUCCESS_MESSAGES.WALLET_STATUS_CONNECTING }}
    </div>

    <!-- Error -->
    <div v-if="walletStore.errorKey" class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800" role="alert">
      <div class="flex items-center justify-between">
        <span class="text-red-800 dark:text-red-200 text-sm">{{ ERROR_MESSAGES[walletStore.errorKey] }}</span>
        <button
          @click="walletStore.clearError()"
          :aria-label="`Dismiss error message`"
          class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Connected State -->
    <div v-if="walletStore.isConnected" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div class="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Connected Account</h3>
        <div class="flex items-center gap-2 flex-wrap mb-2">
          <p class="font-mono text-base break-all text-gray-900 dark:text-gray-100">{{ walletStore.account }}</p>
          <CopyButton
            :address="walletStore.account"
            ariaLabel="Copy account address to clipboard"
            title="Copy address"
          />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">
          {{ shortAddress(walletStore.account || '') }}
        </p>
      </div>

      <div v-if="walletStore.chainIdHex" class="pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Network</h3>
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-400">Chain ID:</span>
            <span class="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">{{ walletStore.chainIdDec }}</span>
          </div>
          <p class="font-mono text-xs text-gray-500 dark:text-gray-400">
            {{ walletStore.chainIdHex }}
          </p>
        </div>
      </div>

      <div>
        <button
          @click="handleDisconnect"
          class="w-full sm:w-auto px-4 py-2 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-medium text-sm"
        >
          Disconnect Wallet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useWalletStore } from '@/store/wallet'
import { shortAddress } from '@/shared/utils'
import { ERROR_MESSAGES } from '@/messages/errors'
import { SUCCESS_MESSAGES } from '@/messages/success'
import type { WalletId } from '@/shared/types'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import CopyButton from '@/components/ui/CopyButton.vue'

const walletStore = useWalletStore()

const connectionStatus = computed<'disconnected' | 'connecting' | 'connected' | 'error'>(() => {
  if (walletStore.status === 'connecting') return 'connecting'
  if (walletStore.errorKey) return 'error'
  if (walletStore.isConnected) return 'connected'
  return 'disconnected'
})

const handleConnect = async (walletId: WalletId) => {
  await walletStore.connect(walletId)
}

const handleDisconnect = () => {
  walletStore.disconnectLocal()
}

onMounted(() => {
  // Initialize wallet store on mount
  walletStore.init()
})
</script>
