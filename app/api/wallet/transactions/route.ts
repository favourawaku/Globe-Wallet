/**
 * GET /api/wallet/transactions
 * Issue #18 — Returns mock transaction history for integration testing.
 */

import { NextResponse } from 'next/server'
import type { Transaction } from '@/lib/types'

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'receive',
    amount: 75000,
    asset: 'XLM',
    address: 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX',
    date: 'Today, 09:42',
    status: 'completed',
    category: 'deposit',
    name: 'XLM Received',
    detail: 'From external wallet',
    stellarHash: '0xabc123def456',
  },
  {
    id: 't2',
    type: 'send',
    amount: 2000,
    asset: 'XLM',
    address: 'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D',
    date: 'Today, 08:15',
    status: 'completed',
    category: 'payment',
    name: 'XLM Sent',
    detail: 'To friend',
    stellarHash: '0xdef789ghi012',
  },
  {
    id: 't3',
    type: 'convert',
    amount: 500,
    asset: 'USDC',
    address: 'internal',
    date: 'Yesterday, 14:30',
    status: 'completed',
    category: 'exchange',
    name: 'XLM → USDC',
    detail: 'Converted via Stellar DEX',
  },
  {
    id: 't4',
    type: 'withdraw',
    amount: 200,
    asset: 'USDC',
    address: 'bank-transfer',
    date: 'Yesterday, 10:00',
    status: 'pending',
    category: 'withdrawal',
    name: 'Off-Ramp to NGN',
    detail: 'Bank withdrawal processing',
  },
]

export async function GET() {
  return NextResponse.json(MOCK_TRANSACTIONS, { status: 200 })
}
