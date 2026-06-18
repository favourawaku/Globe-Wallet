import { useState, useCallback } from 'react'
import { useFinanceServices } from './useFinanceServices'
import { useErrorBoundary } from './useErrorBoundary'
import { Transaction, CurrencyCode, AssetCode, TransactionCategory } from '../lib/types'

interface TransactionFilters {
  /** 'in' maps to 'receive'/'deposit', 'out' maps to 'send'/'withdraw'/'convert' */
  type?: 'in' | 'out'
  category?: TransactionCategory
  asset?: AssetCode
}

export function useTransactions() {
  const { wallet, fiat } = useFinanceServices()
  const { withErrorBoundary, hasError, error, captureError } = useErrorBoundary()

  const [loading, setLoading] = useState(false)

  const getTransactions = useCallback(
    async (filters?: TransactionFilters): Promise<Transaction[]> => {
      setLoading(true)

      try {
        let filtered = await wallet.getTransactionHistory()

        if (filters) {
          if (filters.type) {
            const inTypes = ['receive', 'deposit', 'in']
            const outTypes = ['send', 'withdraw', 'convert', 'out']
            filtered = filtered.filter((t) =>
              filters.type === 'in'
                ? inTypes.includes(t.type)
                : outTypes.includes(t.type),
            )
          }
          if (filters.category) {
            filtered = filtered.filter((t) => t.category === filters.category)
          }
          if (filters.asset) {
            filtered = filtered.filter((t) => t.asset === filters.asset)
          }
        }

        setLoading(false)
        return filtered
      } catch (err) {
        setLoading(false)
        throw err
      }
    },
    [wallet],
  )

  /**
   * Format a transaction amount in the given currency.
   * Falls back to the raw asset amount string if fiat conversion fails.
   */
  const formatTransactionAmount = useCallback(
    (transaction: Transaction, targetCurrency: CurrencyCode = 'USD'): string => {
      const fallback = `${transaction.amount} ${transaction.asset}`
      try {
        // Only attempt fiat format if a fiat currency field exists
        if (transaction.currency) {
          return fiat.formatMoney(transaction.amount, transaction.currency)
        }
        // Otherwise return USD-denominated estimate if priceUsd is known
        return fallback
      } catch (err) {
        captureError(err as any)
        return fallback
      }
    },
    [fiat, captureError],
  )

  const getTransactionsByCategory = useCallback(
    async (category: TransactionCategory) => getTransactions({ category }),
    [getTransactions],
  )

  const getTransactionsByType = useCallback(
    async (type: 'in' | 'out') => getTransactions({ type }),
    [getTransactions],
  )

  const getTransactionsByAsset = useCallback(
    async (asset: AssetCode) => getTransactions({ asset }),
    [getTransactions],
  )

  const calculateCategoryTotal = useCallback(
    async (category: TransactionCategory, currency: CurrencyCode): Promise<number> => {
      const txs = await getTransactions({ category })
      const inTypes = ['receive', 'deposit', 'in']
      return txs.reduce((sum, tx) => {
        const isIncoming = inTypes.includes(tx.type)
        const multiplier = isIncoming ? 1 : -1
        return sum + (tx.amount * multiplier)
      }, 0)
    },
    [getTransactions],
  )

  return {
    loading,
    hasError,
    error,
    getTransactions,
    formatTransactionAmount,
    getTransactionsByCategory,
    getTransactionsByType,
    getTransactionsByAsset,
    calculateCategoryTotal,
  }
}
