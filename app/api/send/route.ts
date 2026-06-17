import { NextRequest, NextResponse } from 'next/server'
import { financeServices } from '../../../lib/services/container'
import { SendRequest, SendResponse } from '../../../lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json()
    const { destination, amount, asset, memo } = body

    if (!destination || !amount || !asset) {
      return NextResponse.json<SendResponse>(
        { success: false, error: 'Missing required fields: destination, amount, asset' },
        { status: 400 }
      )
    }

    if (!financeServices.wallet.validateAddress(destination)) {
      return NextResponse.json<SendResponse>(
        { success: false, error: 'Invalid Stellar destination address' },
        { status: 422 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json<SendResponse>(
        { success: false, error: 'Amount must be greater than zero' },
        { status: 422 }
      )
    }

    const result = await financeServices.wallet.sendPayment(destination, amount, asset, memo)
    return NextResponse.json<SendResponse>({
      success: result.success,
      hash: result.hash,
      status: result.status,
    })
  } catch (error) {
    return NextResponse.json<SendResponse>(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
