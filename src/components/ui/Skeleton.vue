<template>
  <div
    :class="[
      'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
      customClass
    ]"
  />
</template>

<script setup lang="ts">
interface Props {
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  customClass: ''
})

const customClass = props.customClass
</script>

