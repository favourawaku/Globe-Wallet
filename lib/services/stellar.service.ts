import { IStellarService, StellarAccount, OffRampMethod, CurrencyCode, StellarServiceError } from '../types'
import { stellarAccount, offRampMethods, offRampRates, shortenKey } from '../finance-data'

export class StellarService implements IStellarService {
  getAccountInfo(): StellarAccount {
    return { 
      ...stellarAccount,
      name: 'Primary Wallet',
      network: stellarAccount.network || 'Stellar Public Network',
      isFunded: true
    }
  }

  generateReceiveAddress(): string {
    // In production, this would generate a new receive address
    // For now, return the mock testnet address
    return stellarAccount.publicKey
  }

  validateAddress(address: string): boolean {
    // Basic Stellar address validation
    if (!address || typeof address !== 'string') return false
    if (address.length !== 56) return false
    if (!address.startsWith('G')) return false
    
    // Simple regex check for valid characters
    const stellarRegex = /^G[A-Z2-7]{55}$/
    return stellarRegex.test(address)
  }

  shortenKey(key: string, lead = 6, tail = 6): string {
    return shortenKey(key, lead, tail)
  }

  getOffRampMethods(): OffRampMethod[] {
    return [
      {
        id: 'm1',
        name: 'Bank Transfer (NGN)',
        description: 'Withdraw to any Nigerian bank account',
        currency: 'NGN',
        minAmount: 1000,
        maxAmount: 5000000,
        processingTime: 'Instant - 1 hour',
        fee: 100
      },
      {
        id: 'm2',
        name: 'SEPA Transfer (EUR)',
        description: 'Withdraw to European bank account',
        currency: 'EUR',
        minAmount: 10,
        maxAmount: 50000,
        processingTime: '1 - 2 business days',
        fee: 1.5
      },
      {
        id: 'm3',
        name: 'ACH Transfer (USD)',
        description: 'Withdraw to US bank account',
        currency: 'USD',
        minAmount: 20,
        maxAmount: 100000,
        processingTime: '2 - 3 business days',
        fee: 2.0
      }
    ]
  }

  getOffRampRate(currency: CurrencyCode): number {
    const rate = offRampRates[currency]
    if (!rate) {
      throw new StellarServiceError(`Off-ramp rate not available for ${currency}`)
    }
    return rate
  }
}