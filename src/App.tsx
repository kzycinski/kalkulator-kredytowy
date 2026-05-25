import { NavLink, Routes, Route } from 'react-router-dom'
import { Calculator } from './pages/Calculator'
import { Compare } from './pages/Compare'
import { Scenarios } from './pages/Scenarios'
import { BonusAnalysis } from './pages/BonusAnalysis'
import { Doradca } from './pages/Doradca'
import { Insights } from './pages/Insights'
import { useLoanStore } from './store/loanStore'

const navLink = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'text-cyan-400 font-medium' : 'text-slate-300 hover:text-white transition-colors'

function Layout({ children }: { children: React.ReactNode }) {
  const resetToDefaults = useLoanStore((s) => s.resetToDefaults)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-slate-900 px-6 py-4 shadow-md">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-white">Kalkulator Kredytowy</h1>
          <NavLink to="/" end className={navLink}>Kalkulator</NavLink>
          <NavLink to="/compare" className={navLink}>Porównanie</NavLink>
          <NavLink to="/insights" className={navLink}>Insights</NavLink>
          <NavLink to="/bonus" className={navLink}>Bonus</NavLink>
          <NavLink to="/doradca" className={navLink}>Doradca</NavLink>
          <NavLink to="/scenarios" className={navLink}>Scenariusze</NavLink>
          <button
            type="button"
            onClick={resetToDefaults}
            title="Resetuj wszystko do wartości domyślnych"
            className="ml-auto text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset
          </button>
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
        <Route path="/insights" element={<Insights />} />
        <Route path="/bonus" element={<BonusAnalysis />} />
        <Route path="/doradca" element={<Doradca />} />
        <Route path="/scenarios" element={<Scenarios />} />
      </Routes>
    </Layout>
  )
}
