import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
