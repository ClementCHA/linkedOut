import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@linkedout/ui/components'

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply primary variant by default', () => {
    render(<Button>Primary</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-blue-600')
  })

  it('should apply secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-gray-600')
  })

  it('should apply outline variant', () => {
    render(<Button variant="outline">Outline</Button>)

    const button = screen.getByRole('button')
    expect(button.className).toContain('border-2')
  })

  it('should apply size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button').className).toContain('px-3')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button').className).toContain('px-6')
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should merge custom className', () => {
    render(<Button className="custom-class">Custom</Button>)

    expect(screen.getByRole('button').className).toContain('custom-class')
  })
})
