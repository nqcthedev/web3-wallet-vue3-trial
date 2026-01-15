<template>
  <MainLayout>
    <router-view v-if="false" />
    <!-- Placeholder content until router is added -->
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">Web3 Wallet</h1>
        <p class="text-gray-600 dark:text-gray-400">Ready for wallet integration</p>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from './main-layout.vue'
</script>
