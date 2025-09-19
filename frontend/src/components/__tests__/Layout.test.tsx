import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { expect, test, describe } from 'vitest'
import Layout from '../Layout'

// Wrapper para incluir Router en los tests
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Layout', () => {
  test('renders navigation items', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div>Test content</div>
        </Layout>
      </RouterWrapper>
    )

    expect(screen.getByText('CV Screener')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Subir CVs')).toBeInTheDocument()
    expect(screen.getByText('Chat IA')).toBeInTheDocument()
  })

  test('renders children content', () => {
    render(
      <RouterWrapper>
        <Layout>
          <div data-testid="test-content">Test content</div>
        </Layout>
      </RouterWrapper>
    )

    expect(screen.getByTestId('test-content')).toBeInTheDocument()
  })
})
