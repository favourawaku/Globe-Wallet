import { NextRequest, NextResponse } from 'next/server'
import { financeServices } from '../../../lib/services/container'

export async function GET() {
  try {
    const wallets = financeServices.fiat.getWallets()
    return NextResponse.json({ success: true, data: wallets })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { from, to, amount } = await request.json()
    const converted = financeServices.fiat.convertCurrency(from, to, amount)
    const rate = amount > 0 ? converted / amount : financeServices.fiat.convertCurrency(from, to, 1)
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        from, 
        to, 
        originalAmount: amount, 
        convertedAmount: converted, 
        rate 
      } 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Invalid conversion' },
      { status: 400 }
    )
  }
}