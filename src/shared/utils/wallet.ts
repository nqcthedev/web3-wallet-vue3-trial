/**
 * Wallet utility functions
 */

/**
 * Check if error is a user rejection
 * @param error - Error object or message
 * @returns True if error indicates user rejection
 */
export function isUserRejection(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { code?: number; message?: string }
    if (errorObj.code === 4001) {
      return true
    }
    if (errorObj.message) {
      const message = errorObj.message.toLowerCase()
      return message.includes('user rejected') || message.includes('user denied')
    }
  }
  if (typeof error === 'string') {
    const message = error.toLowerCase()
    return message.includes('user rejected') || message.includes('user denied')
  }
  return false
}
