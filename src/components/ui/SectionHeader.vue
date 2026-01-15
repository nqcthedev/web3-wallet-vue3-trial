<template>
  <div class="mb-6">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {{ title }}
      </h2>
      <slot name="badge" />
    </div>
    <p v-if="description" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

