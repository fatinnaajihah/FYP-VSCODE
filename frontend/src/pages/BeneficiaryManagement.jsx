import { useState, useEffect, useCallback } from 'react'
import {
  getBeneficiaries, getBeneficiaryStats,
  createBeneficiary, updateBeneficiary, deleteBeneficiary
} from '../api/api'

const DISTRICTS = [
  { value: 'george_town',   label: 'George Town' },
  { value: 'bayan_lepas',   label: 'Bayan Lepas' },
  { value: 'butterworth',   label: 'Butterworth' },
  { value: 'seberang_perai',label: 'Seberang Perai' },
  { value: 'balik_pulau',   label: 'Balik Pulau' },
  { value: 'air_itam',      label: 'Air Itam' },
  { value: 'jelutong',      label: 'Jelutong' },
  { value: 'tanjung_bungah',label: 'Tanjung Bungah' },
]

const INCOME_CATS = [
  { value: 'extreme_poor', label: 'Extreme Poor (< RM1,000)' },
  { value: 'poor',         label: 'Poor (RM1,000–RM2,000)' },
  { value: 'vulnerable',   label: 'Vulnerable (RM2,001–RM4,850)' },
]

const EMPTY_FORM = {
  name: '', ic_number: '', address: '', district: 'george_town',
  latitude: '', longitude: '', monthly_income: '',
  income_category: 'poor', household_size: '',
  has_oku: false, has_elderly: false, has_infant: false,
}

function incomeBadge(cat) {
  if (cat === 'extreme_poor') return <span className="badge badge-red">Extreme Poor</span>
  if (cat === 'poor')         return <span className="badge badge-amber">Poor</span>
  return <span className="badge badge-green">Vulnerable</span>
}

export default function BeneficiaryManagement() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [filterDistrict, setFilterDistrict]   = useState('')
  const [filterCategory, setFilterCategory]   = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterDistrict) params.district = filterDistrict
      if (filterCategory) params.income_category = filterCategory
      const [bRes, sRes] = await Promise.all([getBeneficiaries(params), getBeneficiaryStats()])
      setBeneficiaries(bRes.data.results ?? bRes.data)
      setStats(sRes.data)
    } catch {
      setError('Failed to load beneficiaries.')
    } finally {
      setLoading(false)
    }
  }, [filterDistrict, filterCategory])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(b) {
    setEditing(b)
    setForm({
      name: b.name, ic_number: b.ic_number, address: b.address,
      district: b.district, latitude: b.latitude, longitude: b.longitude,
      monthly_income: b.monthly_income, income_category: b.income_category,
      household_size: b.household_size,
      has_oku: b.has_oku, has_elderly: b.has_elderly, has_infant: b.has_infant,
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this beneficiary?')) return
    try {
      await deleteBeneficiary(id)
      load()
    } catch {
      setError('Failed to delete.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await updateBeneficiary(editing.id, form)
      } else {
        await createBeneficiary(form)
      }
      setShowModal(false)
      load()
    } catch (err) {
      setFormError(err.response?.data
        ? JSON.stringify(err.response.data)
        : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [field]: val }))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Beneficiary Management</h1>
        <p className="page-subtitle">Register and manage B40 household records</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card blue">
            <div className="stat-label">Total Households</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Extreme Poor</div>
            <div className="stat-value">{stats.extreme_poor}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">Poor</div>
            <div className="stat-value">{stats.poor}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Vulnerable</div>
            <div className="stat-value">{stats.vulnerable}</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-label">With OKU</div>
            <div className="stat-value">{stats.with_oku}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-label">With Elderly</div>
            <div className="stat-value">{stats.with_elderly}</div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {/* Toolbar */}
      <div className="toolbar">
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} style={{ width: 180 }}>
          <option value="">All Districts</option>
          {DISTRICTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 200 }}>
          <option value="">All Categories</option>
          {INCOME_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div className="toolbar-right">
          <button className="btn btn-primary" onClick={openAdd}>+ Add Household</button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /><span>Loading...</span></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>IC Number</th>
                    <th>District</th>
                    <th>Income (RM)</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>OKU</th>
                    <th>Elderly</th>
                    <th>Infant</th>
                    <th>Priority Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td><strong>{b.name}</strong></td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.ic_number}</td>
                      <td>{b.district_display}</td>
                      <td>RM {Number(b.monthly_income).toLocaleString()}</td>
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
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e40af', minWidth: 32 }}>
                            {b.priority_score}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)} style={{ marginRight: 6 }}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {beneficiaries.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No households found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Household' : 'Add New Household'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && <div className="alert alert-error">{formError}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="form-group">
                    <label>IC Number *</label>
                    <input value={form.ic_number} onChange={set('ic_number')} placeholder="XXXXXX-XX-XXXX" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input value={form.address} onChange={set('address')} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>District *</label>
                    <select value={form.district} onChange={set('district')}>
                      {DISTRICTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Income Category *</label>
                    <select value={form.income_category} onChange={set('income_category')}>
                      {INCOME_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monthly Income (RM) *</label>
                    <input type="number" value={form.monthly_income} onChange={set('monthly_income')} min="0" required />
                  </div>
                  <div className="form-group">
                    <label>Household Size *</label>
                    <input type="number" value={form.household_size} onChange={set('household_size')} min="1" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input type="number" step="any" value={form.latitude} onChange={set('latitude')} placeholder="e.g. 5.4141" required />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input type="number" step="any" value={form.longitude} onChange={set('longitude')} placeholder="e.g. 100.3296" required />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.has_oku} onChange={set('has_oku')} />
                    Has OKU member
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.has_elderly} onChange={set('has_elderly')} />
                    Has Elderly (60+)
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.has_infant} onChange={set('has_infant')} />
                    Has Infant (&lt;5 yrs)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Household'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
