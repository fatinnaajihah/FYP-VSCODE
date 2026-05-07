import { useState, useEffect } from 'react'
import { executeRun, compareRuns, getRuns, getMetrics } from '../api/api'
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

export default function GAOptimization() {
  const [params, setParams] = useState(DEFAULT_PARAMS)
  const [running, setRunning]       = useState(false)
  const [comparing, setComparing]   = useState(false)
  const [error, setError]           = useState('')
  const [result, setResult]         = useState(null)
  const [compareResult, setCompareResult] = useState(null)
  const [history, setHistory]       = useState([])

  useEffect(() => {
    getRuns().then(r => setHistory(r.data.results ?? r.data)).catch(() => {})
  }, [])

  const set = (field) => (e) => setParams(p => ({ ...p, [field]: Number(e.target.value) }))

  async function handleRun(e) {
    e.preventDefault()
    setRunning(true)
    setError('')
    setResult(null)
    setCompareResult(null)
    try {
      const res = await executeRun(params)
      const runData = res.data
      // Fetch per-generation metrics for the convergence chart
      const mRes = await getMetrics(runData.id)
      runData.metrics = mRes.data.results ?? mRes.data
      setResult(runData)
      const runs = await getRuns()
      setHistory(runs.data.results ?? runs.data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'GA run failed.')
    } finally {
      setRunning(false)
    }
  }

  async function handleCompare() {
    setComparing(true)
    setError('')
    setResult(null)
    setCompareResult(null)
    try {
      const res = await compareRuns({
        total_food_packages: params.total_food_packages,
        population_size: params.population_size,
      })
      setCompareResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Comparison failed.')
    } finally {
      setComparing(false)
    }
  }

  // Prepare chart data for a single run
  const chartData = result?.metrics?.map(m => ({
    gen: m.generation,
    bestFitness: m.best_fitness,
    avgFitness: m.avg_fitness,
    gini: m.gini_coefficient,
    coverage: m.coverage_rate,
  })) ?? []

  // For compare chart: overlay 100 and 500 gen lines
  const compareChartData = (() => {
    if (!compareResult) return []
    const m100 = compareResult['100']?.generation_metrics ?? []
    const m500 = compareResult['500']?.generation_metrics ?? []
    const maxLen = Math.max(m100.length, m500.length)
    return Array.from({ length: maxLen }, (_, i) => ({
      gen: i + 1,
      fit100: m100[i]?.best_fitness ?? null,
      fit500: m500[i]?.best_fitness ?? null,
    })).filter(d => d.fit100 !== null || d.fit500 !== null)
  })()

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">GA Optimization</h1>
        <p className="page-subtitle">Configure and run the Genetic Algorithm to generate optimised food aid allocation plans</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Config panel */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <div className="card-title">GA Parameters</div>
              <form onSubmit={handleRun}>
                <div className="form-group">
                  <label>Total Food Packages</label>
                  <input type="number" min="1" value={params.total_food_packages} onChange={set('total_food_packages')} />
                </div>
                <div className="form-group">
                  <label>Max Packages per Household</label>
                  <input type="number" min="1" max="20" value={params.max_per_household} onChange={set('max_per_household')} />
                </div>
                <div className="form-group">
                  <label>Number of Generations</label>
                  <input type="number" min="10" max="1000" value={params.num_generations} onChange={set('num_generations')} />
                </div>
                <div className="form-group">
                  <label>Population Size</label>
                  <input type="number" min="10" max="200" value={params.population_size} onChange={set('population_size')} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Crossover Rate</label>
                    <input type="number" step="0.01" min="0" max="1" value={params.crossover_rate} onChange={set('crossover_rate')} />
                  </div>
                  <div className="form-group">
                    <label>Mutation Rate</label>
                    <input type="number" step="0.01" min="0" max="1" value={params.mutation_rate} onChange={set('mutation_rate')} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Elitism Count</label>
                  <input type="number" min="0" max="10" value={params.elitism_count} onChange={set('elitism_count')} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={running} style={{ width: '100%', marginBottom: 10 }}>
                  {running ? '⏳ Running GA…' : '▶ Run GA'}
                </button>
                <button type="button" className="btn btn-warning" onClick={handleCompare} disabled={comparing} style={{ width: '100%' }}>
                  {comparing ? '⏳ Comparing…' : '⚖ Compare 100 vs 500 Generations'}
                </button>
              </form>
            </div>
          </div>

          {/* Run history */}
          {history.length > 0 && (
            <div className="card">
              <div className="card-body" style={{ padding: '16px 0 0' }}>
                <div style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Recent Runs</div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Gen</th><th>Packages</th><th>Fitness</th><th>Gini</th><th>Coverage</th></tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 8).map(r => (
                        <tr key={r.id}>
                          <td>{r.num_generations}</td>
                          <td>{r.total_food_packages}</td>
                          <td>{r.best_fitness?.toFixed(4) ?? '–'}</td>
                          <td>{r.gini_coefficient?.toFixed(4) ?? '–'}</td>
                          <td>{r.coverage_rate ? (r.coverage_rate * 100).toFixed(1) + '%' : '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results panel */}
        <div>
          {error && <div className="alert alert-error">{error}</div>}

          {running && (
            <div className="spinner-wrap">
              <div className="spinner" />
              <span>Running GA for {params.num_generations} generations…</span>
            </div>
          )}

          {comparing && (
            <div className="spinner-wrap">
              <div className="spinner" />
              <span>Running GA for 100 generations, then 500 generations…</span>
            </div>
          )}

          {/* Single run result */}
          {result && !compareResult && (
            <>
              <div className="metrics-row" style={{ marginBottom: 20 }}>
                <MetricBox label="Best Fitness" value={result.best_fitness} />
                <MetricBox label="Gini Coefficient" value={result.gini_coefficient} />
                <MetricBox label="Coverage Rate" value={result.coverage_rate} unit="%" />
                <MetricBox label="Priority Satisfaction" value={result.priority_satisfaction_rate} unit="%" />
              </div>

              {/* Convergence chart */}
              <div className="chart-card" style={{ marginBottom: 20 }}>
                <div className="chart-title">Convergence — Best & Average Fitness over Generations</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="gen" label={{ value: 'Generation', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
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
                  <div className="chart-title">Gini Coefficient over Generations (lower = fairer)</div>
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
                  <div className="chart-title">Coverage Rate over Generations</div>
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

          {/* 100 vs 500 comparison */}
          {compareResult && (
            <>
              <div className="alert alert-info">
                Comparison complete. Both runs used {params.population_size} population size and {params.total_food_packages} food packages.
              </div>

              {/* Metrics side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {['100', '500'].map(k => (
                  <div key={k} className="card">
                    <div className="card-body">
                      <div className="card-title" style={{ color: k === '100' ? '#1e40af' : '#7c3aed' }}>
                        {k} Generations
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[
                          ['Fitness',     compareResult[k].final_metrics.fitness,              ''],
                          ['Gini',        compareResult[k].final_metrics.gini,                 ''],
                          ['Coverage',    compareResult[k].final_metrics.coverage,             '%'],
                          ['Priority Sat',compareResult[k].final_metrics.priority_satisfaction,'%'],
                        ].map(([l, v, u]) => (
                          <div key={l} style={{ background: '#f8fafc', borderRadius: 6, padding: 12 }}>
                            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.4px' }}>{l}</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: k === '100' ? '#1e40af' : '#7c3aed' }}>
                              {u === '%' ? (v * 100).toFixed(1) + '%' : v.toFixed(4)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overlay fitness chart */}
              <div className="chart-card">
                <div className="chart-title">Best Fitness Convergence: 100 vs 500 Generations</div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={compareChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="gen" label={{ value: 'Generation', position: 'insideBottom', offset: -2 }} tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => v?.toFixed(6) ?? 'N/A'} />
                    <Legend />
                    <Line type="monotone" dataKey="fit100" name="100 Generations" stroke="#1e40af" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="fit500" name="500 Generations" stroke="#7c3aed" dot={false} strokeWidth={2} strokeDasharray="5 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {!result && !compareResult && !running && !comparing && !error && (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧬</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Configure parameters and click <strong>Run GA</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
