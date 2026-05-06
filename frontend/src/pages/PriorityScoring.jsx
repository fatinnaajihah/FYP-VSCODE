import { useState, useEffect } from 'react'
import { getCriteria, recalculateScores, getRankedHouseholds } from '../api/api'

function incomeBadge(cat) {
  if (cat === 'extreme_poor') return <span className="badge badge-red">Extreme Poor</span>
  if (cat === 'poor')         return <span className="badge badge-amber">Poor</span>
  return <span className="badge badge-green">Vulnerable</span>
}

export default function PriorityScoring() {
  const [criteria, setCriteria]       = useState(null)
  const [weights, setWeights]         = useState({ income_weight: 33, employment_weight: 12, household_size_weight: 13, children_weight: 8, oku_weight: 14, elderly_weight: 8, infant_weight: 7, single_parent_weight: 5 })
  const [households, setHouseholds]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [recalcing, setRecalcing]     = useState(false)
  const [message, setMessage]         = useState('')
  const [error, setError]             = useState('')

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    try {
      const [cRes, hRes] = await Promise.all([getCriteria(), getRankedHouseholds()])
      const c = cRes.data.results?.[0] ?? cRes.data[0]
      if (c) {
        setCriteria(c)
        setWeights({
          income_weight:         c.income_weight         ?? 33,
          employment_weight:     c.employment_weight     ?? 12,
          household_size_weight: c.household_size_weight ?? 13,
          children_weight:       c.children_weight       ?? 8,
          oku_weight:            c.oku_weight            ?? 14,
          elderly_weight:        c.elderly_weight        ?? 8,
          infant_weight:         c.infant_weight         ?? 7,
          single_parent_weight:  c.single_parent_weight  ?? 5,
        })
      }
      setHouseholds(hRes.data)
    } catch {
      setError('Failed to load scoring data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRecalculate() {
    setRecalcing(true)
    setMessage('')
    setError('')
    try {
      const res = await recalculateScores()
      setMessage(res.data.message)
      const hRes = await getRankedHouseholds()
      setHouseholds(hRes.data)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Recalculation failed.')
    } finally {
      setRecalcing(false)
    }
  }

  const WEIGHT_FIELDS = [
    { key: 'income_weight',          label: 'Income Category',        color: '#ef4444' },
    { key: 'employment_weight',      label: 'Employment Status',      color: '#f97316' },
    { key: 'household_size_weight',  label: 'Household Size',         color: '#f59e0b' },
    { key: 'children_weight',        label: 'Children under 18',      color: '#eab308' },
    { key: 'oku_weight',             label: 'OKU Member',             color: '#8b5cf6' },
    { key: 'elderly_weight',         label: 'Elderly Dependent',      color: '#3b82f6' },
    { key: 'infant_weight',          label: 'Infant (< 5 yrs)',       color: '#10b981' },
    { key: 'single_parent_weight',   label: 'Single-Parent Household',color: '#0891b2' },
  ]

  if (loading) return <div className="page"><div className="spinner-wrap"><div className="spinner" /><span>Loading…</span></div></div>

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Priority Scoring</h1>
        <p className="page-subtitle">View vulnerability scoring weights and recalculate household priority scores</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Scoring weights — read-only */}
        <div className="card">
          <div className="card-body">
            <div className="card-title">Scoring Weights</div>
            {error   && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
              Fixed weights based on Malaysia MPI, WFP VAM, and JKM frameworks. Total: <strong style={{ color: '#10b981' }}>100</strong>
            </p>

            {WEIGHT_FIELDS.map(f => (
              <div key={f.key} className="weight-row">
                <span className="weight-label">{f.label}</span>
                <div style={{ flex: 1, background: '#e2e8f0', borderRadius: 4, height: 8 }}>
                  <div style={{ width: `${weights[f.key]}%`, background: f.color, height: 8, borderRadius: 4 }} />
                </div>
                <span style={{ width: 36, textAlign: 'right', fontWeight: 700, color: f.color, fontSize: 13 }}>
                  {weights[f.key]}
                </span>
              </div>
            ))}

            <button type="button" className="btn btn-success" onClick={handleRecalculate} disabled={recalcing} style={{ width: '100%', marginTop: 20 }}>
              {recalcing ? 'Recalculating…' : 'Recalculate Scores'}
            </button>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 10 }}>How scores work</div>
              <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8 }}>
                Each household is assigned a vulnerability score (0–100).<br />
                <strong>Higher score = more vulnerable = higher priority for aid.</strong><br />
                Extreme poor + large family + OKU = highest score.
              </div>
            </div>
          </div>
        </div>

        {/* Ranked households */}
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ padding: '20px 20px 0' }}>
              <div className="card-title">Ranked Households (Highest Priority First)</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>District</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>OKU</th>
                    <th>Elderly</th>
                    <th>Infant</th>
                    <th>Priority Score</th>
                  </tr>
                </thead>
                <tbody>
                  {households.map((b, i) => (
                    <tr key={b.id}>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: i < 5 ? '#ef4444' : i < 15 ? '#f59e0b' : '#10b981'
                        }}>#{i + 1}</span>
                      </td>
                      <td><strong>{b.name}</strong></td>
                      <td>{b.district_display}</td>
                      <td>{incomeBadge(b.income_category)}</td>
                      <td style={{ textAlign: 'center' }}>{b.household_size}</td>
                      <td style={{ textAlign: 'center' }}>{b.has_oku ? '✔' : '–'}</td>
                      <td style={{ textAlign: 'center' }}>{b.has_elderly ? '✔' : '–'}</td>
                      <td style={{ textAlign: 'center' }}>{b.has_infant ? '✔' : '–'}</td>
                      <td>
                        <div className="score-bar-wrap">
                          <div className="score-bar">
                            <div className="score-fill" style={{ width: `${b.priority_score}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', minWidth: 32 }}>
                            {b.priority_score}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
