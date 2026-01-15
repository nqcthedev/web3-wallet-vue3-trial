/**
 * Wallet adapters registry
 */

import { MetaMaskAdapter } from './metamask'
import type { IWallet } from '../core/types'
import type { WalletId } from '@/shared/types'

// Cache adapter instances to avoid creating new instances
const adapterCache = new Map<WalletId, IWallet | null>()

/**
 * Get wallet adapter by ID
 * Uses cached instances to improve performance
 */
export function getWalletAdapter(walletId: WalletId): IWallet | null {
  // Return cached adapter if available
  const cached = adapterCache.get(walletId)
  if (cached !== undefined) {
    return cached
  }

  let adapter: IWallet | null = null

  switch (walletId) {
    case 'metamask':
      adapter = new MetaMaskAdapter()
      break
    case 'trust':
      // TODO: Implement Trust Wallet adapter
      adapter = null
      break
    case 'okx':
      // TODO: Implement OKX Wallet adapter
      adapter = null
      break
    case 'phantom':
      // TODO: Implement Phantom Wallet adapter
      adapter = null
      break
    default:
      adapter = null
  }

  // Cache adapter instance
  adapterCache.set(walletId, adapter)
  return adapter
}

/**
 * Get all installed wallet adapters
 * Uses cached adapters to improve performance
 */
export function getInstalledWallets(): WalletId[] {
  const wallets: WalletId[] = []
  
  // Use cached adapter if available, otherwise create new
  let metamask = adapterCache.get('metamask') as MetaMaskAdapter | undefined
  if (!metamask) {
    metamask = new MetaMaskAdapter()
    adapterCache.set('metamask', metamask)
  }
  
  if (metamask.isInstalled()) {
    wallets.push('metamask')
  }

  // TODO: Check for Trust, OKX, Phantom
  // const trust = new TrustAdapter()
  // if (trust.isInstalled()) wallets.push('trust')
  
  return wallets
}
