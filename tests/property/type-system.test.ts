import fc from 'fast-check'
import { AssetService } from '../../lib/services/asset.service'
import { FiatService } from '../../lib/services/fiat.service'
import { StellarService } from '../../lib/services/stellar.service'
import { AssetCode, CurrencyCode } from '../../lib/types'
import { FinanceServiceContainer } from '../../lib/services/container'

describe('Type System Correctness Properties', () => {
  const assetService = new AssetService()
  const fiatService = new FiatService()
  const stellarService = new StellarService()
  const container = new FinanceServiceContainer()

  // Property 5: Type System Correctness
  it('Property 5: All service operations should maintain type safety', () => {
    fc.assert(fc.property(
      fc.constantFrom('XLM', 'USDC', 'USDT'),
      fc.constantFrom('NGN', 'USD', 'GBP'),
      fc.float({ min: 0.01, max: 10000 }),
      (assetCode, currencyCode, amount) => {
        // Test that all operations return correct types
        const assets = assetService.getAssets()
        expect(assets).toBeInstanceOf(Array)
        expect(assets.every(a => typeof a.code === 'string')).toBe(true)
        expect(assets.every(a => typeof a.balance === 'number')).toBe(true)

        const wallets = fiatService.getWallets()
        expect(wallets).toBeInstanceOf(Array)
        expect(wallets.every(w => typeof w.code === 'string')).toBe(true)
        expect(wallets.every(w => typeof w.balance === 'number')).toBe(true)

        const account = stellarService.getAccountInfo()
        expect(typeof account.publicKey).toBe('string')
        expect(typeof account.network).toBe('string')

        // Test formatted outputs are strings
        const assetFormatted = assetService.formatAsset(amount, assetCode as AssetCode)
        const fiatFormatted = fiatService.formatMoney(amount, currencyCode as CurrencyCode)
        
        expect(typeof assetFormatted).toBe('string')
        expect(typeof fiatFormatted).toBe('string')
      }
    ), { numRuns: 100 })
  })

  it('Property 5: Service container maintains interface contracts', () => {
    fc.assert(fc.property(
      fc.constantFrom('asset', 'fiat', 'stellar'),
      (serviceType) => {
        // Test that container provides correct service interfaces
        expect(container).toHaveProperty(serviceType)
        
        const service = container[serviceType as keyof typeof container]
        expect(service).toBeDefined()
        expect(typeof service).toBe('object')

        // Each service should have expected methods
        switch (serviceType) {
          case 'asset':
            expect(typeof container.asset.getAssets).toBe('function')
            expect(typeof container.asset.formatAsset).toBe('function')
            break
          case 'fiat':
            expect(typeof container.fiat.getWallets).toBe('function')
            expect(typeof container.fiat.formatMoney).toBe('function')
            break
          case 'stellar':
            expect(typeof container.stellar.getAccountInfo).toBe('function')
            expect(typeof container.stellar.validateAddress).toBe('function')
            break
        }
      }
    ), { numRuns: 100 })
  })

  it('Property 5: Conversion operations maintain numerical integrity', () => {
    fc.assert(fc.property(
      fc.constantFrom('XLM', 'USDC', 'USDT'),
      fc.constantFrom('NGN', 'USD', 'GBP'), 
      fc.float({ min: 0.01, max: 1000, noNaN: true }),
      (fromAsset, toCurrency, amount) => {
        // Asset conversions should return valid numbers
        if (fromAsset !== 'XLM') { // Avoid same-asset conversion
          const converted = assetService.convertAsset(fromAsset as AssetCode, 'XLM', amount)
          expect(typeof converted).toBe('number')
          expect(converted).toBeGreaterThan(0)
          expect(Number.isFinite(converted)).toBe(true)
        }

        // Fiat conversions should return valid numbers
        if (toCurrency !== 'USD') { // Avoid same-currency conversion
          const converted = fiatService.convertCurrency('USD', toCurrency as CurrencyCode, amount)
          expect(typeof converted).toBe('number')
          expect(converted).toBeGreaterThan(0)
          expect(Number.isFinite(converted)).toBe(true)
        }

        // Exchange rates should be positive numbers
        const rate = fiatService.getExchangeRate('USD', toCurrency as CurrencyCode)
        expect(typeof rate).toBe('number')
        expect(rate).toBeGreaterThan(0)
        expect(Number.isFinite(rate)).toBe(true)
      }
    ), { numRuns: 100 })
  })
})