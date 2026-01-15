/**
 * Web3 error mapper
 * Maps technical Web3/provider errors to ErrorKey for centralized error messages
 */

import type { ErrorKey } from '@/messages/errors'
import { isUserRejection } from './wallet'

/**
 * Check if error is related to ERC-20 contract issues
 */
function isErc20ContractError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  const errorString = String(error).toLowerCase()

  const contractErrorPatterns = [
    'parameter decoding error',
    'abi',
    'execution reverted',
    'invalid contract',
    'contract',
    'not a valid erc-20',
    'invalid address',
    'invalid opcode',
    'revert',
    'invalid jump destination',
    'out of gas',
    'invalid token',
    'token not found',
    'not deployed',
    'network',
    'chain',
    'unsupported network'
  ]

  return contractErrorPatterns.some(pattern => 
    message.includes(pattern) || errorString.includes(pattern)
  )
}

/**
 * Map Web3/provider errors to ErrorKey
 * @param error - The caught error (unknown type)
 * @returns ErrorKey for centralized error messages
 */
export function mapWeb3ErrorToKey(error: unknown): ErrorKey {
  // Log technical error details to console for debugging (development mode)
  if (import.meta.env.DEV) {
    console.error('[Web3ErrorMapper] Technical error details:', error)
  }

  if (!(error instanceof Error)) {
    return 'UNKNOWN_ERROR'
  }

  const message = error.message.toLowerCase()

  // User rejection (4001)
  if (isUserRejection(error)) {
    return 'WALLET_CONNECT_REJECTED'
  }

  // Wallet not installed
  if (message.includes('not installed') || message.includes('not available')) {
    if (message.includes('metamask')) {
      return 'WALLET_METAMASK_NOT_INSTALLED'
    }
    return 'WALLET_NOT_INSTALLED'
  }

  // Method not found / unsupported
  if (message.includes('method not found') || message.includes('unsupported method')) {
    return 'WALLET_CONNECT_FAILED'
  }

  // Invalid address
  if (message.includes('invalid address') || message.includes('invalid ethereum address')) {
    return 'TOKEN_ADDRESS_INVALID'
  }

  // ERC-20 contract errors
  if (isErc20ContractError(error)) {
    return 'TOKEN_NOT_SUPPORTED'
  }

  // Network/chain errors
  if (message.includes('network') || message.includes('chain') || message.includes('unsupported network')) {
    return 'NETWORK_UNSUPPORTED'
  }

  // Chain ID missing
  if (message.includes('chain id') && (message.includes('missing') || message.includes('required'))) {
    return 'CHAIN_ID_REQUIRED'
  }

  // Connection failures
  if (message.includes('connect') || message.includes('connection')) {
    if (message.includes('metamask')) {
      return 'WALLET_METAMASK_CONNECT_FAILED'
    }
    return 'WALLET_CONNECT_FAILED'
  }

  // Chain ID fetch failures
  if (message.includes('chain id') || message.includes('get chain')) {
    return 'WALLET_CHAIN_ID_FAILED'
  }

  // Generic fallback
  return 'UNKNOWN_ERROR'
}
