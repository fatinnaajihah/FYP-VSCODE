import { useState, useEffect } from 'react'
import { getSummary, getMetrics, getRun } from '../api/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const RUN_MODES = [
  { mode: 'crossover_only',     label: 'Crossover Only',       color: '#1e40af', bg: '#eff6ff' },
  { mode: 'crossover_mutation', label: 'Crossover + Mutation', color: '#0f766e', bg: '#f0fdf4' },
  { mode: 'sa',                 label: 'SA + Mutation',         color: '#7c3aed', bg: '#f5f3ff' },
]

const getModeInfo = (mode) => RUN_MODES.find(m => m.mode === mode) ?? { label: mode ?? '–', color: '#64748b', bg: '#f8fafc' }

function priorityColor(score) {
  if (score >= 70) return '#ef4444'
  if (score >= 45) return '#f59e0b'
  return '#10b981'
}

function MetricBox({ label, value, unit = '', color = '#1e40af' }) {
  const display = value !== null && value !== undefined
    ? (unit === '%' ? (Number(value) * 100).toFixed(1) + '%' : Number(value).toFixed(4))
    : '–'
  return (
    <div className="metric-box">
      <div className="label">{label}</div>
      <div className="value" style={{ color }}>{display}</div>
    </div>
  )
}

export default function ResultsAnalysis() {
  const [summary, setSummary]       = useState([])
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [run, setRun]               = useState(null)
  const [metrics, setMetrics]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [loadingRun, setLoadingRun] = useState(false)
  const [error, setError]           = useState('')


  useEffect(() => {
    getSummary()
      .then(r => {
        setSummary(r.data)
        if (r.data.length > 0) setSelectedRunId(r.data[0].run_id)
      })
      .catch(() => setError('Failed to load summary.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedRunId) return
    setLoadingRun(true)
    Promise.all([getRun(selectedRunId), getMetrics(selectedRunId)])
      .then(([rRes, mRes]) => {
        setRun(rRes.data)
        setMetrics(mRes.data.results ?? mRes.data)
      })
      .catch(() => setError('Failed to load run details.'))
      .finally(() => setLoadingRun(false))
  }, [selectedRunId])

  // Chart data
  const convergenceData = metrics.map(m => ({
    gen: m.generation,
    fitness: m.best_fitness,
    gini: m.gini_coefficient,
    coverage: m.coverage_rate,
  }))

  // Allocation bar chart (top 20 households sorted by priority)
  const allocationData = run?.results
    ? [...run.results]
        .sort((a, b) => b.beneficiary_detail.priority_score - a.beneficiary_detail.priority_score)
        .slice(0, 20)
        .map(r => ({
          name: r.beneficiary_detail.name.split(' ')[0],
          allocated: r.allocated_quantity,
          priority: r.beneficiary_detail.priority_score,
        }))
    : []

  // Comparison rows for the summary table
  const comparisonRows = summary.map(s => ({
    run_id: s.run_id,
    run_mode: s.run_mode,
    num_generations: s.num_generations,
    packages: s.total_food_packages,
    fitness: s.best_fitness,
    gini: s.gini_coefficient,
    coverage: s.coverage_rate,
    priority_satisfaction: s.priority_satisfaction_rate,
    created_at: new Date(s.created_at).toLocaleString(),
  }))

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /><span>Loading…</span></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Results & Analysis</h1>
        <p className="page-subtitle">View allocation outcomes, convergence charts, and compare run configurations</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {summary.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>No completed runs yet.</div>
          <div>Go to <strong>GA Optimization</strong> and run the algorithm first.</div>
        </div>
      ) : (
        <>
          {/* Run selector */}
          <div className="toolbar" style={{ marginBottom: 20 }}>
            <label style={{ fontWeight: 600, marginBottom: 0, marginRight: 8 }}>Select Run:</label>
            <select value={selectedRunId ?? ''} onChange={e => setSelectedRunId(Number(e.target.value))} style={{ width: 340 }}>
              {summary.map(s => (
                <option key={s.run_id} value={s.run_id}>
                  Run #{s.run_id} — {getModeInfo(s.run_mode).label} | {s.num_generations} gen | {s.total_food_packages} pkg | Gini {s.gini_coefficient?.toFixed(3)}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 10 }}>Most recent first</span>
          </div>

          {loadingRun ? (
            <div className="spinner-wrap"><div className="spinner" /><span>Loading run…</span></div>
          ) : run && (
            <>
              {/* Algorithm badge + key metrics */}
              {(() => {
                const m = getModeInfo(run.run_mode)
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.color}` }}>
                    {m.label}
                  </div>
                )
              })()}
              <div className="metrics-row" style={{ marginBottom: 24 }}>
                <MetricBox label="Best Fitness"           value={run.best_fitness} />
                <MetricBox label="Gini Coefficient"       value={run.gini_coefficient} color="#ef4444" />
                <MetricBox label="Coverage Rate"          value={run.coverage_rate} unit="%" color="#10b981" />
                <MetricBox label="Priority Satisfaction"  value={run.priority_satisfaction_rate} unit="%" color="#f59e0b" />
                <MetricBox label={run.run_mode === 'sa' ? 'Iterations' : 'Generations'} value={run.num_generations} color="#7c3aed" />
                <MetricBox label="Food Packages"          value={run.total_food_packages} color="#0891b2" />
              </div>

              {/* Convergence + Allocation charts */}
              <div className="charts-grid" style={{ marginBottom: 24 }}>
                <div className="chart-card">
                  <div className="chart-title">Fitness Convergence over {run.run_mode === 'sa' ? 'Iterations' : 'Generations'}</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={convergenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="gen" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => v.toFixed(6)} />
                      <Line type="monotone" dataKey="fitness" name="Best Fitness" stroke="#1e40af" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <div className="chart-title">Gini Coefficient over {run.run_mode === 'sa' ? 'Iterations' : 'Generations'}</div>
                  <ResponsiveContainer width="100%" height={230}>
                    <LineChart data={convergenceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="gen" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={v => v.toFixed(4)} />
                      <Line type="monotone" dataKey="gini" name="Gini" stroke="#ef4444" dot={false} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Allocation bar chart (top 20) */}
              {allocationData.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 24 }}>
                  <div className="chart-title">Food Packages Allocated — Top 20 Households by Priority</div>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={allocationData} margin={{ bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="allocated" name="Packages Allocated" radius={[4, 4, 0, 0]}>
                        {allocationData.map((d, i) => (
                          <Cell key={i} fill={priorityColor(d.priority)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 12 }}>
                    <span><span style={{ color: '#ef4444' }}>■</span> High priority (score ≥ 70)</span>
                    <span><span style={{ color: '#f59e0b' }}>■</span> Medium (45–70)</span>
                    <span><span style={{ color: '#10b981' }}>■</span> Lower priority (&lt; 45)</span>
                  </div>
                </div>
              )}

              {/* Leaflet map */}
              {run.results?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div className="chart-card">
                    <div className="chart-title">Household Locations — Penang (pin colour = priority level)</div>
                    <div className="map-container" style={{ marginTop: 12 }}>
                      <MapContainer
                        center={[5.41, 100.33]}
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; OpenStreetMap contributors'
                        />
                        {run.results.map(r => {
                          const b = r.beneficiary_detail
                          if (!b?.latitude || !b?.longitude) return null
                          return (
                            <CircleMarker
                              key={r.id}
                              center={[b.latitude, b.longitude]}
                              radius={r.is_served ? 9 : 6}
                              pathOptions={{
                                color: priorityColor(b.priority_score),
                                fillColor: priorityColor(b.priority_score),
                                fillOpacity: r.is_served ? 0.8 : 0.3,
                                weight: 2,
                              }}
                            >
                              <Popup>
                                <strong>{b.name}</strong><br />
                                District: {b.district_display}<br />
                                Priority Score: {b.priority_score}<br />
                                Allocated: <strong>{r.allocated_quantity} packages</strong><br />
                                Status: {r.is_served ? '✅ Served' : '❌ Not served'}
                              </Popup>
                            </CircleMarker>
                          )
                        })}
                      </MapContainer>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                      <span><span style={{ color: '#ef4444' }}>●</span> High priority (score ≥ 70) — brighter = served</span>
                      <span><span style={{ color: '#f59e0b' }}>●</span> Medium priority</span>
                      <span><span style={{ color: '#10b981' }}>●</span> Lower priority</span>
                      <span style={{ opacity: .5 }}>Faded = not served</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Allocation results table */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-body" style={{ padding: '16px 0 0' }}>
                  <div style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                    Per-Household Allocation Results
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>District</th>
                          <th>Priority Score</th>
                          <th>Allocated Qty</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...run.results]
                          .sort((a, b) => b.beneficiary_detail.priority_score - a.beneficiary_detail.priority_score)
                          .map((r, i) => (
                            <tr key={r.id}>
                              <td>{i + 1}</td>
                              <td><strong>{r.beneficiary_detail.name}</strong></td>
                              <td>{r.beneficiary_detail.district_display}</td>
                              <td>
                                <div className="score-bar-wrap">
                                  <div className="score-bar">
                                    <div className="score-fill" style={{ width: `${r.beneficiary_detail.priority_score}%`, background: priorityColor(r.beneficiary_detail.priority_score) }} />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32 }}>{r.beneficiary_detail.priority_score}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 15 }}>{r.allocated_quantity}</td>
                              <td>
                                {r.is_served
                                  ? <span className="badge badge-green">Served</span>
                                  : <span className="badge badge-red">Not Served</span>}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* All runs comparison table */}
          <div className="card">
            <div className="card-body" style={{ padding: '16px 0 0' }}>
              <div style={{ padding: '0 16px', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                All Completed Runs — Comparison Table
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Run</th>
                      <th>Algorithm</th>
                      <th>Generations</th>
                      <th>Packages</th>
                      <th>Best Fitness</th>
                      <th>Gini</th>
                      <th>Coverage</th>
                      <th>Priority Sat.</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map(r => (
                      <tr key={r.run_id} style={{ cursor: 'pointer', background: r.run_id === selectedRunId ? '#eff6ff' : '' }}
                          onClick={() => setSelectedRunId(r.run_id)}>
                        <td>#{r.run_id}</td>
                        <td>{(() => { const m = getModeInfo(r.run_mode); return <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.color}`, whiteSpace: 'nowrap' }}>{m.label}</span> })()}</td>
                        <td style={{ fontWeight: 700 }}>{r.num_generations}</td>
                        <td>{r.packages}</td>
                        <td>{r.fitness?.toFixed(4)}</td>
                        <td style={{ color: '#ef4444', fontWeight: 600 }}>{r.gini?.toFixed(4)}</td>
                        <td>{r.coverage ? (r.coverage * 100).toFixed(1) + '%' : '–'}</td>
                        <td>{r.priority_satisfaction ? (r.priority_satisfaction * 100).toFixed(1) + '%' : '–'}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{r.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </>
      )}
    </div>
  )
}
