import type { StellarAccount } from '../types'

export const TEST_STELLAR_ADDRESS = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

export const MOCK_STELLAR_ACCOUNT: StellarAccount = {
  publicKey: TEST_STELLAR_ADDRESS,
  name: 'Primary Wallet',
  network: 'Stellar Public Network',
  isFunded: true,
}

export const MOCK_MEMO = 'STLP-2048'
