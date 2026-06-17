import { test, expect } from '@playwright/test'

test.describe('Wallet Send E2E Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Go directly to the send page
        await page.goto('/send')
    })

    test('should show validation error for invalid Stellar address', async ({ page }) => {
        // Find input elements by test IDs
        const addressInput = page.locator('[data-testid="address-input"]')
        const amountInput = page.locator('[data-testid="amount-input"]')
        const submitBtn = page.locator('[data-testid="send-submit-btn"]')

        // Enter invalid address and valid amount
        await addressInput.fill('invalid-address')
        await amountInput.fill('100.5')

        // Click submit
        await submitBtn.click()

        // Expect error alert to appear
        const errorAlert = page.locator('[data-testid="send-error"]')
        await expect(errorAlert).toBeVisible()
        await expect(errorAlert).toContainText('Invalid Stellar address')

        // Expect input to have aria-invalid attribute
        await expect(addressInput).toHaveAttribute('aria-invalid', 'true')
    })

    test('should show validation error for negative or zero amount', async ({ page }) => {
        const addressInput = page.locator('[data-testid="address-input"]')
        const amountInput = page.locator('[data-testid="amount-input"]')
        const submitBtn = page.locator('[data-testid="send-submit-btn"]')

        // Enter valid address and negative amount
        await addressInput.fill('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')
        await amountInput.fill('-10')

        await submitBtn.click()

        const errorAlert = page.locator('[data-testid="send-error"]')
        await expect(errorAlert).toBeVisible()
        await expect(errorAlert).toContainText('greater than zero')
    })

    test('should complete a successful payment transfer and reset form', async ({ page }) => {
        const addressInput = page.locator('[data-testid="address-input"]')
        const amountInput = page.locator('[data-testid="amount-input"]')
        const memoInput = page.locator('[data-testid="memo-input"]')
        const submitBtn = page.locator('[data-testid="send-submit-btn"]')

        // Fill in valid details
        await addressInput.fill('GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX')
        await amountInput.fill('25.5')
        await memoInput.fill('E2E Test Transfer')

        // Submit form
        await submitBtn.click()

        // Verify success alert is displayed
        const successAlert = page.locator('[data-testid="send-success"]')
        await expect(successAlert).toBeVisible()
        await expect(successAlert).toContainText('Transaction Successful')
        await expect(successAlert).toContainText('Hash:')

        // Click send another
        const sendAgainBtn = page.locator('[data-testid="send-again-btn"]')
        await sendAgainBtn.click()

        // Verify inputs are cleared
        await expect(addressInput).toHaveValue('')
        await expect(amountInput).toHaveValue('')
        await expect(memoInput).toHaveValue('')
    })
})
