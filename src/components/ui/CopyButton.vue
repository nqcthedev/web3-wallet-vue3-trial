<template>
  <button
    type="button"
    @click="handleClick"
    :aria-label="ariaLabel"
    :title="title"
    class="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { useCopyAddress } from '@/shared/composables/useCopyAddress'

interface Props {
  address: string | null | undefined
  ariaLabel: string
  title?: string
  successMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  successMessage: undefined
})

const { copyAddress } = useCopyAddress(props.successMessage)

async function handleClick() {
  await copyAddress(props.address ?? '')
}
</script>

