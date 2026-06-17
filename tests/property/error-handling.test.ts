import fc from 'fast-check'
import { AssetService } from '../../lib/services/asset.service'
import { FiatService } from '../../lib/services/fiat.service'
import { StellarService } from '../../lib/services/stellar.service'
import { AssetServiceError, FiatServiceError, StellarServiceError } from '../../lib/types'

describe('Error Handling Properties', () => {
  const assetService = new AssetService()
  const fiatService = new FiatService()
  const stellarService = new StellarService()

  // Property 4: Error Handling Consistency
  it('Property 4: Services should handle invalid inputs gracefully', () => {
    fc.assert(fc.property(
      fc.string({ maxLength: 10 }).filter(s => !['XLM', 'USDC', 'USDT'].includes(s)),
      fc.float({ min: 0.01, max: 1000 }),
      (invalidAsset, amount) => {
        // AssetService should throw proper errors
        expect(() => {
          assetService.convertAsset(invalidAsset as any, 'XLM', amount)
        }).toThrow(AssetServiceError)
      }
    ), { numRuns: 100 })
  })

  it('Property 4: FiatService should handle invalid currencies', () => {
    fc.assert(fc.property(
      fc.string({ maxLength: 5 }).filter(s => !['NGN', 'USD', 'GBP'].includes(s)),
      fc.float({ min: 0.01, max: 1000 }),
      (invalidCurrency, amount) => {
        // FiatService should throw proper errors
        expect(() => {
          fiatService.convertCurrency(invalidCurrency as any, 'USD', amount)
        }).toThrow(FiatServiceError)
      }
    ), { numRuns: 100 })
  })

  it('Property 4: StellarService should handle invalid currencies', () => {
    fc.assert(fc.property(
      fc.string({ maxLength: 5 }).filter(s => !['NGN', 'USD', 'GBP'].includes(s)),
      (invalidCurrency) => {
        // StellarService should throw proper errors
        expect(() => {
          stellarService.getOffRampRate(invalidCurrency as any)
        }).toThrow(StellarServiceError)
      }
    ), { numRuns: 100 })
  })
})