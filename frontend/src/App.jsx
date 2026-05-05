import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import BeneficiaryManagement from './pages/BeneficiaryManagement'
import PriorityScoring from './pages/PriorityScoring'
import GAOptimization from './pages/GAOptimization'
import ResultsAnalysis from './pages/ResultsAnalysis'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/beneficiaries" replace />} />
        <Route path="/beneficiaries" element={<BeneficiaryManagement />} />
        <Route path="/scoring" element={<PriorityScoring />} />
        <Route path="/optimization" element={<GAOptimization />} />
        <Route path="/analysis" element={<ResultsAnalysis />} />
      </Routes>
    </BrowserRouter>
  )
}
