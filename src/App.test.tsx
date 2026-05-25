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

  it('renders Bonus page on /bonus', () => {
    renderApp('/bonus')
    expect(screen.getByRole('heading', { name: /Bonus na start/i })).toBeInTheDocument()
  })

  it('renders Doradca page on /doradca', () => {
    renderApp('/doradca')
    expect(screen.getByRole('heading', { name: /Doradca/i })).toBeInTheDocument()
  })

  it('renders Insights page on /insights', () => {
    renderApp('/insights')
    expect(screen.getByText(/Sprawdź parametry kredytu — brak danych\./i)).toBeInTheDocument()
  })
})
