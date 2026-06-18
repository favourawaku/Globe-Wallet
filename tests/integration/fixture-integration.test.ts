/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET as balancesGET } from '../../app/api/wallet/balances/route'
import { GET as transactionsGET } from '../../app/api/wallet/transactions/route'
import { POST as sendPOST } from '../../app/api/wallet/send/route'
import { GET as ratesGET } from '../../app/api/rates/route'
import { FixtureFactory } from '../../lib/fixtures'
import { TEST_STELLAR_ADDRESS } from '../../lib/fixtures/stellar'

describe('API Routes - Mock Centralization (Issue #14)', () => {
  describe('GET /api/wallet/balances', () => {
    it('should return 200 with mock balances from fixtures', async () => {
      const response = await balancesGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(3)
      expect(data[0]).toHaveProperty('asset')
      expect(data[0]).toHaveProperty('amount')
      expect(data[0]).toHaveProperty('priceUsd')
    })

    it('should match fixture data', async () => {
      const response = await balancesGET()
      const data = await response.json()

      const fixtures = FixtureFactory.getBalances()
      expect(data).toEqual(fixtures)
    })

    it('should include XLM, USDC, and USDT', async () => {
      const response = await balancesGET()
      const data = await response.json()

      const assets = data.map((b: any) => b.asset)
      expect(assets).toContain('XLM')
      expect(assets).toContain('USDC')
      expect(assets).toContain('USDT')
    })
  })

  describe('GET /api/wallet/transactions', () => {
    it('should return 200 with mock transactions from fixtures', async () => {
      const response = await transactionsGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(4)
    })

    it('should match fixture data', async () => {
      const response = await transactionsGET()
      const data = await response.json()

      const fixtures = FixtureFactory.getTransactions()
      expect(data).toEqual(fixtures)
    })

    it('should include all required fields', async () => {
      const response = await transactionsGET()
      const data = await response.json()

      for (const tx of data) {
        expect(tx).toHaveProperty('id')
        expect(tx).toHaveProperty('type')
        expect(tx).toHaveProperty('amount')
        expect(tx).toHaveProperty('asset')
        expect(tx).toHaveProperty('status')
      }
    })
  })

  describe('POST /api/wallet/send', () => {
    const validBody = {
      destination: 'GC3G2N7N5LRYX6L5N2YHV3K2L9P8QW1ZC4T6BNRYX7QK3MUKXHV2RZ4D',
      amount: 100,
      asset: 'XLM',
      memo: 'test',
    }

    it('should return 200 for valid payload', async () => {
      const req = new NextRequest('http://localhost/api/wallet/send', {
        method: 'POST',
        body: JSON.stringify(validBody),
      })
      const response = await sendPOST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.hash).toBeDefined()
      expect(data.hash).toMatch(/^0x[a-f0-9]+$/)
    })

    it('should return 422 for empty destination', async () => {
      const req = new NextRequest('http://localhost/api/wallet/send', {
        method: 'POST',
        body: JSON.stringify({ ...validBody, destination: '' }),
      })
      const response = await sendPOST(req)
      expect(response.status).toBe(422)
    })

    it('should return 422 for negative amount', async () => {
      const req = new NextRequest('http://localhost/api/wallet/send', {
        method: 'POST',
        body: JSON.stringify({ ...validBody, amount: -100 }),
      })
      const response = await sendPOST(req)
      expect(response.status).toBe(422)
    })

    it('should return 400 for invalid JSON', async () => {
      const req = new NextRequest('http://localhost/api/wallet/send', {
        method: 'POST',
        body: 'not json',
      })
      const response = await sendPOST(req)
      expect(response.status).toBe(400)
    })

    it('should return 422 for invalid Stellar address', async () => {
      const req = new NextRequest('http://localhost/api/wallet/send', {
        method: 'POST',
        body: JSON.stringify({ ...validBody, destination: 'invalid' }),
      })
      const response = await sendPOST(req)
      expect(response.status).toBe(422)
    })
  })

  describe('GET /api/rates', () => {
    it('should return 200 with mock rates from fixtures', async () => {
      const response = await ratesGET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('rates')
      expect(data).toHaveProperty('updatedAt')
      expect(data.rates).toHaveProperty('XLM_USD')
      expect(data.rates.XLM_USD).toBe(0.1185)
    })

    it('should match fixture data', async () => {
      const response = await ratesGET()
      const data = await response.json()

      const fixtures = FixtureFactory.getSimpleRates()
      expect(data.rates).toEqual(fixtures)
    })

    it('should have an ISO timestamp', async () => {
      const response = await ratesGET()
      const data = await response.json()

      expect(data.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})
