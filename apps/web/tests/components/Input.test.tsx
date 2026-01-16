import { Input } from '@linkedout/ui/components'
import { 
  fireEvent,
  render,
  screen
} from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render label when provided', () => {
    render(<Input label="Email" />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('should generate id from label', () => {
    render(<Input label="Full Name" />)

    const input = screen.getByLabelText('Full Name')
    expect(input.id).toBe('full-name')
  })

  it('should use provided id over generated one', () => {
    render(<Input label="Email" id="custom-id" />)

    const input = screen.getByLabelText('Email')
    expect(input.id).toBe('custom-id')
  })

  it('should display error message', () => {
    render(<Input error="This field is required" />)

    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should apply error styles when error is present', () => {
    render(<Input error="Error" />)

    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-500')
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test value' }
    })

    expect(handleChange).toHaveBeenCalled()
  })

  it('should accept placeholder', () => {
    render(<Input placeholder="Enter email..." />)

    expect(screen.getByPlaceholderText('Enter email...')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<Input disabled />)

    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should support different input types', () => {
    render(<Input type="password" data-testid="password-input" />)

    const input = screen.getByTestId('password-input')
    expect(input).toHaveAttribute('type', 'password')
  })
})
