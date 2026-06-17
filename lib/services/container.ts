import { IFinanceServiceContainer, IWalletService, IExchangeService, IOffRampService, IPricingService, IFiatService, ISorobanService, IAssetService, IStellarService } from '../types'
import { WalletService } from './wallet.service'
import { ExchangeService } from './exchange.service'
import { OffRampService } from './off-ramp.service'
import { PricingService } from './pricing.service'
import { FiatService } from './fiat.service'
import { SorobanService } from './soroban.service'
import { AssetService } from './asset.service'
import { StellarService } from './stellar.service'

/**
 * Level 2 Architecture Sync: Finance Service Container
 * Singleton container managing specialized enterprise services.
 */
export class FinanceServiceContainer implements IFinanceServiceContainer {
  public readonly wallet: IWalletService
  public readonly exchange: IExchangeService
  public readonly offRamp: IOffRampService
  public readonly pricing: IPricingService
  public readonly fiat: IFiatService
  public readonly soroban: ISorobanService
  public readonly asset: IAssetService
  public readonly stellar: IStellarService

  constructor(
    walletService?: IWalletService,
    exchangeService?: IExchangeService,
    offRampService?: IOffRampService,
    pricingService?: IPricingService,
    fiatService?: IFiatService,
    sorobanService?: ISorobanService,
    assetService?: IAssetService,
    stellarService?: IStellarService
  ) {
    this.wallet = walletService ?? new WalletService()
    this.exchange = exchangeService ?? new ExchangeService()
    this.offRamp = offRampService ?? new OffRampService()
    this.pricing = pricingService ?? new PricingService()
    this.fiat = fiatService ?? new FiatService()
    this.soroban = sorobanService ?? new SorobanService()
    this.asset = assetService ?? new AssetService()
    this.stellar = stellarService ?? new StellarService()
  }
}

// Default export instance for standard hook consumption
export const financeServices = new FinanceServiceContainer()