<template>
  <span
    :class="[
      'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm border',
      baseClass
    ]"
    :aria-label="statusLabel"
  >
    <span
      class="h-2 w-2 rounded-full animate-pulse"
      :class="dotClass"
      aria-hidden="true"
    />
    <span>{{ statusLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SUCCESS_MESSAGES } from '@/messages/success'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface Props {
  status: ConnectionStatus
}

const props = defineProps<Props>()

const statusLabel = computed(() => {
  switch (props.status) {
    case 'connecting':
      return SUCCESS_MESSAGES.WALLET_STATUS_CONNECTING
    case 'connected':
      return SUCCESS_MESSAGES.WALLET_STATUS_CONNECTED
    case 'error':
      return SUCCESS_MESSAGES.WALLET_STATUS_ERROR
    default:
      return SUCCESS_MESSAGES.WALLET_STATUS_DISCONNECTED
  }
})

const baseClass = computed(() => {
  switch (props.status) {
    case 'connecting':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    case 'connected':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
    case 'error':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
  }
})

const dotClass = computed(() => {
  switch (props.status) {
    case 'connecting':
      return 'bg-yellow-500 dark:bg-yellow-400'
    case 'connected':
      return 'bg-green-500 dark:bg-green-400'
    case 'error':
      return 'bg-red-500 dark:bg-red-400'
    default:
      return 'bg-gray-400 dark:bg-gray-500'
  }
})
</script>

