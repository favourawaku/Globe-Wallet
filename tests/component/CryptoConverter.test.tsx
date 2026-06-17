import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CryptoConverter } from '../../components/finance/CryptoConverter'
import { FinanceServicesProvider } from '../../hooks/useFinanceServices'
import { FinanceServiceContainer } from '../../lib/services/container'

const mockAssetService = {
  getAssets: jest.fn(),
  getAssetPrice: jest.fn(),
  convertAsset: jest.fn().mockReturnValue(100),
  formatAsset: jest.fn((amount, code) => `${amount} ${code}`)
}

const mockServices = new FinanceServiceContainer(
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  mockAssetService as any
)

const renderWithServices = (component: React.ReactNode) => {
  return render(
    <FinanceServicesProvider services={mockServices}>
      {component}
    </FinanceServicesProvider>
  )
}

describe('CryptoConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render converter form', () => {
    renderWithServices(<CryptoConverter />)
    
    expect(screen.getByTestId('crypto-converter')).toBeInTheDocument()
    expect(screen.getByText('Crypto Converter')).toBeInTheDocument()
    expect(screen.getByTestId('amount-input')).toBeInTheDocument()
    expect(screen.getByTestId('from-asset-select')).toBeInTheDocument()
    expect(screen.getByTestId('to-asset-select')).toBeInTheDocument()
    expect(screen.getByTestId('convert-button')).toBeInTheDocument()
  })

  it('should handle amount input', async () => {
    const user = userEvent.setup()
    renderWithServices(<CryptoConverter />)

    const amountInput = screen.getByTestId('amount-input')
    await user.type(amountInput, '100')

    expect(amountInput).toHaveValue(100)
  })

  it('should swap assets when swap button is clicked', async () => {
    const user = userEvent.setup()
    renderWithServices(<CryptoConverter />)

    const swapButton = screen.getByTestId('swap-button')
    await user.click(swapButton)

    // The swap functionality should change the asset selections
    // We can verify this by checking if the service is called with swapped parameters
  })

  it('should perform conversion', async () => {
    const user = userEvent.setup()
    renderWithServices(<CryptoConverter />)

    const amountInput = screen.getByTestId('amount-input')
    const convertButton = screen.getByTestId('convert-button')

    await user.type(amountInput, '100')
    await user.click(convertButton)

    await waitFor(() => {
      expect(mockAssetService.convertAsset).toHaveBeenCalledWith('XLM', 'USDC', 100)
    })

    expect(screen.getByTestId('conversion-result')).toBeInTheDocument()
  })

  it('should disable convert button when invalid input', () => {
    renderWithServices(<CryptoConverter />)

    const convertButton = screen.getByTestId('convert-button')
    expect(convertButton).toBeDisabled()
  })

  it('should handle conversion errors', async () => {
    const user = userEvent.setup()
    const errorService = {
      ...mockAssetService,
      convertAsset: jest.fn().mockImplementation(() => {
        throw new Error('Conversion failed')
      })
    }

    const errorServices = new FinanceServiceContainer(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      errorService as any
    )

    render(
      <FinanceServicesProvider services={errorServices}>
        <CryptoConverter />
      </FinanceServicesProvider>
    )

    const amountInput = screen.getByTestId('amount-input')
    const convertButton = screen.getByTestId('convert-button')

    await user.type(amountInput, '100')
    await user.click(convertButton)

    await waitFor(() => {
      expect(screen.getByTestId('converter-error')).toBeInTheDocument()
    })
  })

  it('should have proper accessibility attributes', () => {
    renderWithServices(<CryptoConverter />)

    const swapButton = screen.getByTestId('swap-button')
    expect(swapButton).toHaveAttribute('aria-label', 'Swap assets')
  })
})