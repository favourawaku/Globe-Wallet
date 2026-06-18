import {
  formatCurrency,
  formatCryptoAmount,
  formatAddress,
  parseStellarAmount,
  calculateFee,
  isValidStellarAddress,
} from '../../../lib/helpers/format'

describe('Format Helpers', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly with symbol', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
      expect(formatCurrency(1284500.75, 'NGN')).toBe('₦1,284,500.75')
    })

    it('should hide value when privacy/hidden is enabled', () => {
      expect(formatCurrency(1234.56, 'USD', true)).toBe('$••••••')
    })

    it('should handle zero, negative, and NaN/Infinity values gracefully', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00')
      expect(formatCurrency(-50, 'USD')).toBe('$-50.00')
      expect(formatCurrency(NaN, 'USD')).toBe('$0.00')
    })
  })

  describe('formatCryptoAmount', () => {
    it('should format XLM with 4 decimal places', () => {
      expect(formatCryptoAmount(4250.5, 'XLM')).toBe('4,250.5000 XLM')
    })

    it('should format USDC/other assets with 2 decimal places', () => {
      expect(formatCryptoAmount(1820, 'USDC')).toBe('1,820.00 USDC')
    })

    it('should hide value when privacy/hidden is enabled', () => {
      expect(formatCryptoAmount(1820, 'USDC', true)).toBe('•••• USDC')
    })

    it('should handle NaN gracefully', () => {
      expect(formatCryptoAmount(NaN, 'XLM')).toBe('0 XLM')
    })
  })

  describe('formatAddress', () => {
    it('should shorten a public key correctly', () => {
      const addr = 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX'
      expect(formatAddress(addr, 6, 6)).toBe('GDXSPA…T6BNRX')
    })

    it('should return empty string or same address if invalid or too short', () => {
      expect(formatAddress('', 6, 6)).toBe('')
      expect(formatAddress('abc', 6, 6)).toBe('abc')
    })
  })

  describe('parseStellarAmount', () => {
    it('should parse valid amount strings', () => {
      expect(parseStellarAmount('100.5')).toBe(100.5)
      expect(parseStellarAmount('  50   ')).toBe(50)
    })

    it('should throw error for required, non-numeric, negative, or zero amounts', () => {
      expect(() => parseStellarAmount('')).toThrow('Amount is required')
      expect(() => parseStellarAmount('invalid')).toThrow('Amount must be a valid number')
      expect(() => parseStellarAmount('0')).toThrow('Amount must be greater than zero')
      expect(() => parseStellarAmount('-5')).toThrow('Amount must be greater than zero')
    })

    it('should round to 7 decimal places', () => {
      expect(parseStellarAmount('10.123456789')).toBe(10.1234568)
    })
  })

  describe('calculateFee', () => {
    it('should calculate fractional fee', () => {
      expect(calculateFee(100, 0.001)).toBe(0.1)
    })

    it('should clamp to Stellar base fee', () => {
      expect(calculateFee(0, 0.001)).toBe(0.00001)
      expect(calculateFee(-50, 0.001)).toBe(0.00001)
    })
  })

  describe('isValidStellarAddress', () => {
    it('should validate correct Stellar address format', () => {
      const valid = 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX'
      expect(isValidStellarAddress(valid)).toBe(true)
    })

    it('should reject incorrect formats', () => {
      expect(isValidStellarAddress('invalid')).toBe(false)
      expect(isValidStellarAddress('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNR')).toBe(false) // too short
      expect(isValidStellarAddress('MDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')).toBe(false) // wrong prefix
    })
  })
})
