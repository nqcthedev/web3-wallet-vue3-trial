/**
 * Epoch utility functions for stale-request protection
 */

/**
 * Check if epoch value matches (for stale guard)
 * @param currentEpoch - Current epoch value
 * @param expectedEpoch - Expected epoch value
 * @returns True if epoch matches (not stale)
 */
export function isEpochValid(currentEpoch: number, expectedEpoch: number): boolean {
  return currentEpoch === expectedEpoch
}

/**
 * Check if request is stale based on epoch comparison
 * @param currentEpoch - Current epoch value
 * @param expectedEpoch - Expected epoch value
 * @returns True if request is stale (should be ignored)
 */
export function isStaleRequest(currentEpoch: number, expectedEpoch: number): boolean {
  return !isEpochValid(currentEpoch, expectedEpoch)
}
