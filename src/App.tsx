import { Routes, Route, Link } from 'react-router-dom'
import { Calculator } from './pages/Calculator'
import { Compare } from './pages/Compare'
import { Scenarios } from './pages/Scenarios'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold">Kalkulator Kredytowy</h1>
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Kalkulator
          </Link>
          <Link to="/compare" className="text-slate-600 hover:text-slate-900">
            Porównanie
          </Link>
          <Link to="/scenarios" className="text-slate-600 hover:text-slate-900">
            Scenariusze
          </Link>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Calculator />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/scenarios" element={<Scenarios />} />
      </Routes>
    </Layout>
  )
}
