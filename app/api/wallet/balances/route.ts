/**
 * GET /api/wallet/balances
 * Issue #18 — Returns mock multi-asset balances for integration testing.
 */

import { NextResponse } from 'next/server'
import type { Balance } from '@/lib/types'

const MOCK_BALANCES: Balance[] = [
  { asset: 'XLM', amount: 4250.5, priceUsd: 0.1185 },
  { asset: 'USDC', amount: 1820.0, priceUsd: 1.0 },
  { asset: 'USDT', amount: 540.25, priceUsd: 1.0 },
]

export async function GET() {
  return NextResponse.json(MOCK_BALANCES, { status: 200 })
}
