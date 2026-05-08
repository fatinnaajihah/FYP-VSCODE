import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import BeneficiaryManagement from './pages/BeneficiaryManagement'
import PriorityScoring from './pages/PriorityScoring'
import GAOptimization from './pages/GAOptimization'
import ResultsAnalysis from './pages/ResultsAnalysis'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const isLoggedIn = !!localStorage.getItem('authToken')

  return (
    <BrowserRouter>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Navigate to="/beneficiaries" replace /></ProtectedRoute>} />
        <Route path="/beneficiaries" element={<ProtectedRoute><BeneficiaryManagement /></ProtectedRoute>} />
        <Route path="/scoring" element={<ProtectedRoute><PriorityScoring /></ProtectedRoute>} />
        <Route path="/optimization" element={<ProtectedRoute><GAOptimization /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><ResultsAnalysis /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
