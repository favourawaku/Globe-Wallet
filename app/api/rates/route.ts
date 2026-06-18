/**
 * GET /api/rates
 * Issue #18 — Returns current mock fiat/crypto exchange rates.
 * In production this would proxy a real price oracle.
 *
 * Security: No secrets or private keys involved. NEXT_PUBLIC_API_BASE_URL
 * is the only environment variable consumed by the API client calling this.
 */

import { NextResponse } from 'next/server'

const MOCK_RATES: Record<string, number> = {
  // Stellar asset USD prices
  XLM_USD: 0.1185,
  USDC_USD: 1.0,
  USDT_USD: 1.0,
  // Fiat cross-rates (to USD)
  NGN_USD: 0.00063,
  GBP_USD: 1.27,
  EUR_USD: 1.09,
}

export async function GET() {
  return NextResponse.json(
    {
      rates: MOCK_RATES,
      updatedAt: new Date().toISOString(),
    },
    { status: 200 },
  )
}
