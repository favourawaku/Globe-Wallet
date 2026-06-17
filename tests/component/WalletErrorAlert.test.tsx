import * as React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { WalletErrorAlert } from '../../components/ui/wallet-error-alert'

describe('WalletErrorAlert Component', () => {
    it('should render error message with role alert and assertive aria live', () => {
        render(<WalletErrorAlert message="Something went wrong" data-testid="error-alert" />)

        const alertEl = screen.getByTestId('error-alert')
        expect(alertEl).toBeInTheDocument()
        expect(alertEl).toHaveAttribute('role', 'alert')
        expect(alertEl).toHaveAttribute('aria-live', 'assertive')
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should show retry button when onRetry callback is provided', () => {
        const handleRetry = jest.fn()
        render(<WalletErrorAlert message="Network timeout" onRetry={handleRetry} />)

        const retryBtn = screen.getByTestId('error-retry-btn')
        expect(retryBtn).toBeInTheDocument()

        fireEvent.click(retryBtn)
        expect(handleRetry).toHaveBeenCalledTimes(1)
    })

    it('should not render retry button when onRetry is not provided', () => {
        render(<WalletErrorAlert message="Fatal error" />)
        expect(screen.queryByTestId('error-retry-btn')).not.toBeInTheDocument()
    })
})
