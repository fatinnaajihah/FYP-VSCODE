import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  api.post('/auth/login/', { username, password })

// ── Beneficiaries ────────────────────────────────────────────────────────────
export const getBeneficiaries = (params) => api.get('/beneficiaries/', { params })
export const getBeneficiary = (id) => api.get(`/beneficiaries/${id}/`)
export const createBeneficiary = (data) => api.post('/beneficiaries/', data)
export const updateBeneficiary = (id, data) => api.put(`/beneficiaries/${id}/`, data)
export const deleteBeneficiary = (id) => api.delete(`/beneficiaries/${id}/`)
export const getBeneficiaryStats = () => api.get('/beneficiaries/stats/')

// ── Scoring ──────────────────────────────────────────────────────────────────
export const getCriteria = () => api.get('/scoring/criteria/')
export const createCriteria = (data) => api.post('/scoring/criteria/', data)
export const updateCriteria = (id, data) => api.put(`/scoring/criteria/${id}/`, data)
export const recalculateScores = () => api.post('/scoring/criteria/recalculate/')
export const getRankedHouseholds = () => api.get('/scoring/criteria/ranked_households/')

// ── Optimization ─────────────────────────────────────────────────────────────
export const getRuns = () => api.get('/optimization/runs/')
export const getRun = (id) => api.get(`/optimization/runs/${id}/`)
export const executeRun = (data) => api.post('/optimization/runs/execute/', data)

// ── Analysis ─────────────────────────────────────────────────────────────────
export const getMetrics = (runId) => api.get('/analysis/metrics/', { params: { run_id: runId } })
export const getSummary = () => api.get('/analysis/metrics/summary/')
