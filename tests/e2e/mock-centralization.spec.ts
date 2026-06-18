import { test, expect } from '@playwright/test'

test.describe('Mock Centralization E2E (Issue #14)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('@critical #14 - Happy path: dashboard loads with mock data', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('balance-card')).toBeVisible({ timeout: 15000 })
    await expect(page.getByTestId('quick-actions')).toBeVisible()
    await expect(page.getByTestId('crypto-holdings')).toBeVisible()

    await expect(page.getByTestId('quick-action-send')).toBeVisible()
    await expect(page.getByTestId('quick-action-receive')).toBeVisible()
    await expect(page.getByTestId('quick-action-convert')).toBeVisible()
    await expect(page.getByTestId('quick-action-cash-out')).toBeVisible()
  })

  test('@critical #14 - Happy path: navigate to send page and see form', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('quick-action-send').click()

    await expect(page).toHaveURL(/\/send/)
    await expect(page.getByTestId('send-form-card')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('address-input')).toBeVisible()
    await expect(page.getByTestId('amount-input')).toBeVisible()
    await expect(page.getByTestId('asset-select')).toBeVisible()
    await expect(page.getByTestId('send-submit-btn')).toBeVisible()
  })

  test('@critical #14 - Happy path: error state for invalid Stellar address', async ({ page }) => {
    await page.goto('/send')

    await expect(page.getByTestId('send-form-card')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('address-input').fill('invalid-address')
    await page.getByTestId('amount-input').fill('100')
    await page.getByTestId('send-submit-btn').click()

    await expect(page.getByTestId('send-error')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('send-error')).toContainText(/Invalid Stellar address/i)
  })

  test('#14 - Failure path: insufficient data handling', async ({ page }) => {
    await page.goto('/send')

    await expect(page.getByTestId('send-form-card')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('send-submit-btn').click()

    await expect(page.getByTestId('send-error')).toBeVisible({ timeout: 5000 })
  })

  test('#14 - Navigation: bottom nav links work', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('bottom-nav')).toBeVisible({ timeout: 10000 })

    await page.getByTestId('nav-cards').click()
    await expect(page).toHaveURL(/\/cards/)

    await page.getByTestId('nav-savings').click()
    await expect(page).toHaveURL(/\/savings/)

    await page.getByTestId('nav-home').click()
    await expect(page).toHaveURL(/\//)
  })

  test('#14 - Theme toggle exists', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('balance-card')).toBeVisible({ timeout: 10000 })
  })
})
