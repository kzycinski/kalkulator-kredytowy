import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'

afterEach(() => {
  cleanup()
})

function renderApp(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, enabled: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('App', () => {
  it('renders header', () => {
    renderApp('/')
    expect(screen.getByText('Kalkulator Kredytowy')).toBeInTheDocument()
  })

  it('renders Calculator (LoanParamsForm) on default route', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: 'Parametry kredytu' })).toBeInTheDocument()
  })

  it('renders Compare page (sweep heading) on /compare', () => {
    renderApp('/compare')
    expect(screen.getByRole('heading', { name: /Sweep — znajdź sweet spot/i })).toBeInTheDocument()
  })

  it('renders Scenarios page on /scenarios', () => {
    renderApp('/scenarios')
    expect(screen.getByRole('heading', { name: /Zapisane scenariusze/i })).toBeInTheDocument()
  })
})
