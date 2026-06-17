'use client'

import { useState, useCallback } from 'react'
import { useFinanceServices } from './useFinanceServices'
import { isValidStellarAddress, parseStellarAmount } from '../lib/helpers/format'
import { AssetCode, TransactionResult } from '../lib/types'

type SendStatus = 'idle' | 'processing' | 'success' | 'error'

export interface UseWalletSendReturn {
  /** Current status of the send operation */
  status: SendStatus
  /** True while the payment is in flight */
  isProcessing: boolean
  /** Error message if status === 'error' */
  error: string | null
  /** Transaction result if status === 'success' */
  result: TransactionResult | null
  /** Initiate the send-payment flow */
  send: (destination: string, rawAmount: string, asset: AssetCode, memo?: string) => Promise<void>
  /** Reset state back to idle */
  reset: () => void
}

/**
 * useWalletSend
 *
 * Dedicated hook encapsulating the full send-payment flow:
 *  1. Validates Stellar address format
 *  2. Parses and validates the amount
 *  3. Calls the wallet service
 *  4. Manages status transitions: idle → processing → success | error
 *
 * isProcessing is tracked here (not in the service) so the service stays
 * stateless and easily testable in isolation.
 */
export function useWalletSend(): UseWalletSendReturn {
  const { wallet } = useFinanceServices()

  const [status, setStatus] = useState<SendStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TransactionResult | null>(null)

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  const send = useCallback(
    async (
      destination: string,
      rawAmount: string,
      asset: AssetCode,
      memo?: string,
    ): Promise<void> => {
      // Client-side validation before hitting the service
      if (!isValidStellarAddress(destination)) {
        setError('Invalid Stellar address. Must be 56 characters starting with G.')
        setStatus('error')
        return
      }

      let amount: number
      try {
        amount = parseStellarAmount(rawAmount)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Invalid amount')
        setStatus('error')
        return
      }

      setStatus('processing')
      setError(null)
      setResult(null)

      try {
        const txResult = await wallet.sendPayment(destination, amount, asset, memo)
        setResult(txResult)
        setStatus(txResult.success ? 'success' : 'error')
        if (!txResult.success) {
          setError(txResult.error ?? 'Payment failed')
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'An unexpected error occurred')
        setStatus('error')
      }
    },
    [wallet],
  )

  return {
    status,
    isProcessing: status === 'processing',
    error,
    result,
    send,
    reset,
  }
}
