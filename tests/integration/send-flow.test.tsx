/**
 * Integration tests for SendForm — issue #23
 * Verifies full UI → /api/send interaction using mocked fetch (MSW-style).
 */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SendForm } from '../../components/app/send-form'
import { FinanceServicesProvider } from '../../hooks/useFinanceServices'
import { FinanceServiceContainer } from '../../lib/services/container'

const VALID_ADDRESS = 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX'

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, hash: '0xhash123', status: 'completed' })
        })

    await waitFor(() =>
      expect(sendPayment).toHaveBeenCalledWith(VALID_ADDRESS, 5, 'XLM', undefined)
    )
  })
})

describe('SendFlow Integration — validation failure', () => {
  it('blocks advance on invalid address and does not call sendPayment', async () => {
    const { container, sendPayment } = buildMockContainer({ validateAddress: jest.fn().mockReturnValue(false) })
    renderWith(container)

    fireEvent.change(screen.getByLabelText(/Recipient Address/i), { target: { value: 'bad-addr' } })
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '10' } })
    fireEvent.click(screen.getByTestId('review-button'))

    await waitFor(() => expect(screen.getByTestId('send-error')).toBeInTheDocument())
    expect(sendPayment).not.toHaveBeenCalled()
    expect(screen.queryByTestId('confirm-send-button')).not.toBeInTheDocument()
  })

  it('blocks on insufficient balance', async () => {
    const { container, sendPayment } = buildMockContainer()
    renderWith(container)

    fireEvent.change(screen.getByLabelText(/Recipient Address/i), { target: { value: VALID_ADDRESS } })
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '9999999' } })
    fireEvent.click(screen.getByTestId('review-button'))

    await waitFor(() => expect(screen.getByTestId('send-error')).toHaveTextContent(/Insufficient/i))
    expect(sendPayment).not.toHaveBeenCalled()
  })
})

        // Simulate user interaction
        fireEvent.change(screen.getByLabelText(/Recipient Address/i), { target: { value: 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX' } })
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '10' } })

        const sendButton = screen.getByRole('button', { name: /Confirm Send/i })
        fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByTestId('send-error')).toHaveTextContent(/Horizon timeout/i)
      expect(screen.getByTestId('review-button')).toBeInTheDocument()
    })
  })

        // Verify API was called for verification (mocked)
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/wallet/send'), expect.any(Object))
    })
    renderWith(container)

    await advanceToConfirm()
    fireEvent.click(screen.getByTestId('confirm-send-button'))

    await waitFor(() =>
      expect(screen.getByTestId('send-error')).toHaveTextContent(/Failed to send payment/i)
    )
  })
})

describe('SendFlow Integration — optimistic UI', () => {
  it('back button from confirm step preserves entered values', async () => {
    const { container } = buildMockContainer()
    renderWith(container)

    fireEvent.change(screen.getByLabelText(/Recipient Address/i), { target: { value: VALID_ADDRESS } })
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '77' } })
    fireEvent.click(screen.getByTestId('review-button'))
    await waitFor(() => screen.getByTestId('back-button'))
    fireEvent.click(screen.getByTestId('back-button'))

    expect(screen.getByLabelText(/Amount/i)).toHaveValue(77)
  })
})
