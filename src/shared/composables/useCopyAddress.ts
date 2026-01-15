/**
 * Composable for copying addresses to clipboard
 * Provides reusable copy address functionality with toast notifications
 */

import { toast } from 'vue-sonner'
import { copyToClipboard, shortAddress } from '@/shared/utils'
import { ERROR_MESSAGES } from '@/messages/errors'
import { SUCCESS_MESSAGES } from '@/messages/success'

/**
 * Composable for copying addresses
 * @param successMessage - Custom success message (default: 'Address copied!')
 * @param errorMessage - Custom error message (default: 'Failed to copy address')
 */
export function useCopyAddress(
  successMessage: string = SUCCESS_MESSAGES.COPY_ADDRESS_SUCCESS,
  errorMessage: string = ERROR_MESSAGES.COPY_ADDRESS_FAILED
) {
  /**
   * Copy address to clipboard
   * @param address - Address to copy
   * @param customSuccessMessage - Optional custom success message
   * @param customErrorMessage - Optional custom error message
   */
  async function copyAddress(
    address: string | undefined | null,
    customSuccessMessage?: string,
    customErrorMessage?: string
  ): Promise<void> {
    if (!address || address.trim() === '') {
      toast.error(ERROR_MESSAGES.NO_ADDRESS_TO_COPY)
      return
    }

    const success = await copyToClipboard(address)
    if (success) {
      toast.success(customSuccessMessage || successMessage, {
        description: shortAddress(address)
      })
    } else {
      toast.error(customErrorMessage || errorMessage, {
        description: ERROR_MESSAGES.COPY_ADDRESS_TRY_AGAIN
      })
    }
  }

  return {
    copyAddress
  }
}
