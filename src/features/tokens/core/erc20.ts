/**
 * ERC-20 token read functions using web3.js
 */

import Web3 from 'web3'

/**
 * Format number string with locale formatting
 * Avoids precision loss from Number conversion for large numbers
 */
function formatNumberString(value: string, maxDecimals: number): string {
  // Split into whole and fractional parts
  const [wholePart, fractionalPart = ''] = value.split('.')
  
  // Format whole part with locale
  const formattedWhole = Number(wholePart).toLocaleString('en-US')
  
  // Handle fractional part
  if (!fractionalPart || maxDecimals === 0) {
    return formattedWhole
  }
  
  // Trim fractional part to maxDecimals and remove trailing zeros
  const trimmedFractional = fractionalPart.slice(0, maxDecimals).replace(/0+$/, '')
  
  return trimmedFractional ? `${formattedWhole}.${trimmedFractional}` : formattedWhole
}

// Minimal ERC-20 ABI for read operations (web3.js v4 compatible)
const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: 'balance', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const

export interface Erc20BalanceResult {
  value: string // Human-readable balance string
  rawValue: string // Raw balance from contract (wei)
  decimals: number
  symbol?: string
}

/**
 * Get ERC-20 token balance
 * @param web3 - Web3 instance
 * @param tokenAddress - Token contract address
 * @param account - Account address to check balance for
 * @returns Balance result with formatted value
 */
export async function getErc20Balance(
  web3: Web3,
  tokenAddress: string,
  account: string
): Promise<Erc20BalanceResult> {
  try {
    const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress)

    // Fetch decimals (fallback to 6 if fails)
    let decimals = 6
    try {
      const decimalsResult = await contract.methods.decimals().call()
      // web3.js v4 may return BigInt, convert to number
      decimals = typeof decimalsResult === 'bigint' 
        ? Number(decimalsResult) 
        : Number(decimalsResult)
    } catch (err) {
      console.warn(`Failed to fetch decimals for ${tokenAddress}, using fallback 6:`, err)
    }

    // Fetch balance
    const rawBalance = await contract.methods.balanceOf(account).call()
    // web3.js v4 may return BigInt, convert to string
    const rawValue = typeof rawBalance === 'bigint' 
      ? rawBalance.toString() 
      : String(rawBalance)

    // Format to human-readable string
    // web3.js fromWei only works with 18 decimals, so we need manual conversion for other decimals
    let formattedValue: string
    if (decimals === 18) {
      formattedValue = web3.utils.fromWei(rawValue, 'ether')
    } else {
      // Manual conversion for non-18 decimals
      const divisor = BigInt(10 ** decimals)
      const balance = BigInt(rawValue)
      const wholePart = balance / divisor
      const fractionalPart = balance % divisor
      
      if (fractionalPart === BigInt(0)) {
        formattedValue = wholePart.toString()
      } else {
        const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
        // Remove trailing zeros
        const trimmedFractional = fractionalStr.replace(/0+$/, '')
        formattedValue = trimmedFractional ? `${wholePart}.${trimmedFractional}` : wholePart.toString()
      }
    }
    
    // Format with proper decimal places for display
    // Avoid Number conversion for very large numbers to prevent precision loss
    // Use string manipulation for better precision
    const displayValue = formatNumberString(formattedValue, decimals)

    // Optional: Fetch symbol
    let symbol: string | undefined
    try {
      const symbolResult = await contract.methods.symbol().call()
      // web3.js v4 may return different types
      symbol = typeof symbolResult === 'string' ? symbolResult : String(symbolResult)
    } catch (err) {
      // Symbol fetch is optional, ignore errors
    }

    return {
      value: displayValue,
      rawValue,
      decimals,
      symbol
    }
    } catch (error: unknown) {
      // Re-throw as generic Error; stores will map to a user-friendly message
      const message = error instanceof Error ? error.message : 'Failed to fetch ERC-20 balance'
      throw new Error(message)
    }
}
