import fc from 'fast-check'
import { AssetService } from '../../lib/services/asset.service'
import { FiatService } from '../../lib/services/fiat.service'
import { StellarService } from '../../lib/services/stellar.service'
import { AssetCode, CurrencyCode } from '../../lib/types'

describe('Service Interface Compliance Properties', () => {
  const assetService = new AssetService()
  const fiatService = new FiatService()
  const stellarService = new StellarService()

  // Property 1: Service Interface Compliance
  it('Property 1: AssetService should handle all operations correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('XLM', 'USDC', 'USDT'),
      fc.float({ min: 0.01, max: 10000 }),
      (assetCode, amount) => {
        // Test that service implements interface correctly
        const assets = assetService.getAssets()
        expect(Array.isArray(assets)).toBe(true)
        expect(assets.length).toBeGreaterThan(0)

        // Test formatting
        const formatted = assetService.formatAsset(amount, assetCode as AssetCode)
        expect(typeof formatted).toBe('string')
        expect(formatted).toContain(assetCode)

        // Test conversion
        if (assetCode === 'XLM') {
          const converted = assetService.convertAsset(assetCode as AssetCode, 'USDC', amount)
          expect(typeof converted).toBe('number')
          expect(converted).toBeGreaterThan(0)
        }
      }
    ), { numRuns: 100 })
  })

  it('Property 1: FiatService should handle all operations correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('NGN', 'USD', 'GBP'),
      fc.float({ min: 0.01, max: 100000 }),
      (currency, amount) => {
        // Test that service implements interface correctly
        const wallets = fiatService.getWallets()
        expect(Array.isArray(wallets)).toBe(true)
        expect(wallets.length).toBeGreaterThan(0)

        // Test formatting
        const formatted = fiatService.formatMoney(amount, currency as CurrencyCode)
        expect(typeof formatted).toBe('string')
        expect(formatted.length).toBeGreaterThan(0)

        // Test exchange rates
        const rate = fiatService.getExchangeRate(currency as CurrencyCode, 'USD')
        expect(typeof rate).toBe('number')
        expect(rate).toBeGreaterThan(0)
      }
    ), { numRuns: 100 })
  })

  it('Property 1: StellarService should handle all operations correctly', () => {
    fc.assert(fc.property(
      fc.constantFrom('NGN', 'USD', 'GBP'),
      fc.string({ minLength: 56, maxLength: 56 }),
      (currency, address) => {
        // Test account info
        const account = stellarService.getAccountInfo()
        expect(typeof account.publicKey).toBe('string')
        expect(account.publicKey.length).toBe(56)

        // Test off-ramp methods
        const methods = stellarService.getOffRampMethods()
        expect(Array.isArray(methods)).toBe(true)

        // Test key shortening
        const shortened = stellarService.shortenKey(address)
        expect(typeof shortened).toBe('string')
        expect(shortened.includes('…')).toBe(true)
      }
    ), { numRuns: 100 })
  })
})