import { useState, useEffect } from 'react'
import { executeRun, getMetrics } from '../api/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const DEFAULT_PARAMS = {
  num_generations: 100,
  population_size: 50,
  crossover_rate: 0.8,
  mutation_rate: 0.1,
  elitism_count: 2,
  total_food_packages: 150,
  max_per_household: 5,
}

function MetricBox({ label, value, unit = '' }) {
  return (
    <div className="metric-box">
      <div className="label">{label}</div>
      <div className="value">{value !== null && value !== undefined ? (Number(value) * (unit === '%' ? 100 : 1)).toFixed(unit === '%' ? 1 : 4) + unit : '–'}</div>
    </div>
  )
}

function loadParams() {
  try {
    const stored = localStorage.getItem('ga_params')
    return stored ? { ...DEFAULT_PARAMS, ...JSON.parse(stored) } : DEFAULT_PARAMS
  } catch {
    return DEFAULT_PARAMS
  }
}

const RUN_MODES = [
  { mode: 'crossover_only',     label: 'Crossover Only',        color: '#1e40af', bg: '#eff6ff' },
  { mode: 'crossover_mutation', label: 'Crossover + Mutation',  color: '#0f766e', bg: '#f0fdf4' },
  { mode: 'sa',                 label: 'SA + Mutation',          color: '#7c3aed', bg: '#f5f3ff' },
]

export default function GAOptimization() {
  const [params, setParams] = useState(loadParams)
  const [running, setRunning]       = useState(false)
  const [activeMode, setActiveMode] = useState(() => {
    try {
      const stored = sessionStorage.getItem('ga_last_result')
      return stored ? JSON.parse(stored)?.run_mode ?? null : null
    } catch { return null }
  })
  const [error, setError]           = useState('')
  const [result, setResult]         = useState(() => {
    try {
      const stored = sessionStorage.getItem('ga_last_result')
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  })
  useEffect(() => {
    localStorage.setItem('ga_params', JSON.stringify(params))
  }, [params])

  useEffect(() => {
    if (result) sessionStorage.setItem('ga_last_result', JSON.stringify(result))
  }, [result])

  const set = (field) => (e) => {
    const val = e.target.value
    setParams(p => ({ ...p, [field]: val === '' ? '' : Number(val) }))
  }

  async function handleRun(mode) {
    setRunning(true)
    setActiveMode(mode)
    setError('')
    setResult(null)
    try {
      const res = await executeRun({ ...params, run_mode: mode })
      const runData = res.data
      const mRes = await getMetrics(runData.id)
      runData.metrics = mRes.data.results ?? mRes.data
      setResult(runData)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Run failed.')
    } finally {
      setRunning(false)
    }
  }

  // Prepare chart data for a single run
  const iterLabel = result?.run_mode === 'sa' ? 'Iteration' : 'Generation'

  const chartData = result?.metrics?.map(m => ({
    gen: m.generation,
    bestFitness: m.best_fitness,
    avgFitness: m.avg_fitness,
    gini: m.gini_coefficient,
    coverage: m.coverage_rate,
  })) ?? []

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">GA Optimization</h1>
        <p className="page-subtitle">Compare Crossover Only, Crossover + Mutation (GA), and Simulated Annealing allocation strategies</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Config panel */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <div className="card-title">Parameters</div>
              <div>
                <div className="form-group">
                  <label>Total Food Packages</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={params.total_food_packages} onChange={set('total_food_packages')} onFocus={e => e.target.select()} />
                </div>
                <div className="form-group">
                  <label>Max Packages per Household</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={params.max_per_household} onChange={set('max_per_household')} onFocus={e => e.target.select()} />
                </div>
                <div className="form-group">
                  <label>Iterations</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {[{ label: 'Quick (100)', value: 100 }, { label: 'Deep (500)', value: 500 }].map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setParams(p => ({ ...p, num_generations: value }))}
                        style={{
                          flex: 1, padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontSize: 13,
                          border: `2px solid ${params.num_generations === value ? '#1e40af' : '#e2e8f0'}`,
                          background: params.num_generations === value ? '#eff6ff' : '#fff',
                          color: params.num_generations === value ? '#1e40af' : '#64748b',
                          fontWeight: params.num_generations === value ? 700 : 400,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 12, color: '#64748b' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: '#475569' }}>Fixed Configuration</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ background: '#eff6ff', borderRadius: 6, padding: '6px 8px' }}>
                      <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 3 }}>GA</div>
                      <div>Population: <strong>50</strong></div>
                      <div>Crossover rate: <strong>0.80</strong></div>
                      <div>Mutation rate: <strong>0.10</strong></div>
                      <div>Elitism count: <strong>2</strong></div>
                    </div>
                    <div style={{ background: '#f5f3ff', borderRadius: 6, padding: '6px 8px' }}>
                      <div style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 3 }}>SA</div>
                      <div>Initial temp: <strong>1.0</strong></div>
                      <div>Min temp: <strong>0.01</strong></div>
                      <div>Cooling: <strong>Geometric</strong></div>
                      <div>Neighbour: <strong>Swap</strong></div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Select Algorithm</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  {RUN_MODES.map(({ mode, label, color, bg }) => {
                    const isRunning = running && activeMode === mode
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleRun(mode)}
                        disabled={running}
                        style={{
                          width: '100%', padding: '10px 16px', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
                          fontSize: 13, fontWeight: 600, border: `2px solid ${color}`,
                          background: isRunning ? bg : color,
                          color: isRunning ? color : '#fff',
                          opacity: running && !isRunning ? 0.45 : 1,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {isRunning ? `Running ${label}…` : `Run ${label}`}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Results panel */}
        <div>
          {error && <div className="alert alert-error">{error}</div>}

          {running && (
            <div className="spinner-wrap">
              <div className="spinner" />
              <span>Running {RUN_MODES.find(m => m.mode === activeMode)?.label} for {params.num_generations} iterations…</span>
            </div>
          )}

          {/* Single run result */}
          {result && (
            <>
              {(() => { const m = RUN_MODES.find(x => x.mode === result.run_mode); return m ? (
                <div style={{ display: 'inline-block', marginBottom: 14, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.color}` }}>
                  {m.label}
                </div>
              ) : null })()}
              <div className="metrics-row" style={{ marginBottom: 20 }}>
                <MetricBox label="Best Fitness" value={result.best_fitness} />
                <MetricBox label="Gini Coefficient" value={result.gini_coefficient} />
                <MetricBox label="Coverage Rate" value={result.coverage_rate} unit="%" />
                <MetricBox label="Priority Satisfaction" value={result.priority_satisfaction_rate} unit="%" />
              </div>

              {/* Convergence chart */}
              <div className="chart-card" style={{ marginBottom: 20 }}>
                <div className="chart-title">Convergence — Best & Average Fitness over {iterLabel}s</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="gen" label={{ value: iterLabel, position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v.toFixed(6)} />
                    <Legend />
                    <Line type="monotone" dataKey="bestFitness" name="Best Fitness" stroke="#1e40af" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="avgFitness"  name="Avg Fitness"  stroke="#93c5fd" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Gini + coverage charts */}
              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-title">Gini Coefficient over {iterLabel}s (lower = fairer)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="gen" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => v.toFixed(4)} />
                      <Line type="monotone" dataKey="gini" name="Gini" stroke="#ef4444" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <div className="chart-title">Coverage Rate over {iterLabel}s</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="gen" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => (v * 100).toFixed(1) + '%'} />
                      <Line type="monotone" dataKey="coverage" name="Coverage" stroke="#10b981" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {!result && !running && !error && (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧬</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Configure parameters and select an algorithm to run</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
