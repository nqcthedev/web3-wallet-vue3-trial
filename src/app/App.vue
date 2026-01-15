<template>
  <MainLayout>
    <div class="space-y-6 sm:space-y-8">
      <WalletConnect />
      <TokenBalancesCard />
      <CustomTokenBalanceCard />
    </div>
  </MainLayout>
  <Toaster position="top-right" />
</template>

<script setup lang="ts">
import MainLayout from './main-layout.vue'
import WalletConnect from '@/components/wallet/WalletConnect.vue'
import TokenBalancesCard from '@/components/token-balance-card/TokenBalancesCard.vue'
import CustomTokenBalanceCard from '@/components/custom-token-balance/CustomTokenBalanceCard.vue'
import { Toaster } from 'vue-sonner'
</script>
