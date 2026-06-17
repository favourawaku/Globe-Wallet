import * as legacyFinanceData from '../finance-data'
import { financeServices } from '../services/container'
import { CurrencyCode, AssetCode } from '../types'

/**
 * Legacy adapter that maintains backward compatibility with existing finance-data.ts exports
 * This allows existing components to continue working while migration to new services happens
 */

// Re-export all the original data structures and functions
export * from '../finance-data'

// Add new service-powered functions that maintain the same API
export function getWalletBalance(code: CurrencyCode): number {
  const wallets = financeServices.fiat.getWallets()
  const wallet = wallets.find(w => w.code === code)
  return wallet?.balance ?? 0
}

export function getAssetBalance(code: AssetCode): number {
  const assets = financeServices.asset.getAssets()
  const asset = assets.find(a => a.code === code)
  return asset?.balance ?? 0
}

export async function getAssetPriceUsd(code: AssetCode): Promise<number> {
  try {
    return await financeServices.asset.getAssetPrice(code)
  } catch {
    // Fallback to static data
    const asset = legacyFinanceData.cryptoAssets.find(a => a.code === code)
    return asset?.priceUsd ?? 0
  }
}

export function convertCurrencies(
  from: CurrencyCode, 
  to: CurrencyCode, 
  amount: number
): number {
  try {
    return financeServices.fiat.convertCurrency(from, to, amount)
  } catch {
    // Fallback to simple USD conversion
    const usdRates: Record<CurrencyCode, number> = { NGN: 1580.5, USD: 1, GBP: 0.79, EUR: 0.92 }
    const toUsd = amount / usdRates[from]
    return toUsd * usdRates[to]
  }
}

export function validateStellarAddress(address: string): boolean {
  return financeServices.stellar.validateAddress(address)
}

// Enhanced formatters with service integration
export function formatMoneyEnhanced(
  amount: number, 
  currency: CurrencyCode, 
  options: { hidden?: boolean; locale?: string } = {}
): string {
  try {
    return financeServices.fiat.formatMoney(amount, currency, options.hidden)
  } catch {
    return legacyFinanceData.formatMoney(amount, currency, options.hidden)
  }
}

export function formatAssetEnhanced(
  amount: number, 
  code: AssetCode, 
  options: { hidden?: boolean; precision?: number } = {}
): string {
  try {
    return financeServices.asset.formatAsset(amount, code, options.hidden)
  } catch {
    return legacyFinanceData.formatCrypto(amount, code, options.hidden)
  }
}

// Migration utilities
export function migrateToServices() {
  console.log('Migration to service architecture complete. Legacy adapter maintains compatibility.')
  return {
    assetsLoaded: financeServices.asset.getAssets().length,
    walletsLoaded: financeServices.fiat.getWallets().length,
    stellarServiceActive: !!financeServices.stellar.getAccountInfo()
  }
}

// Utility to check which system is being used
export function getFinanceSystemInfo() {
  return {
    legacyMode: false,
    serviceMode: true,
    version: '2.0.0',
    services: {
      asset: 'AssetService',
      fiat: 'FiatService', 
      stellar: 'StellarService'
    }
  }
}