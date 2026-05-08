import { useState } from 'react'
import { login } from '../api/api'

const css = `
  .login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #164e63 100%);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; position: relative;
  }
  .login-blob {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(80px); opacity: 0.4;
  }
  .login-card {
    width: 100%; max-width: 420px; padding: 44px 40px;
    background: rgba(255,255,255,0.08);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-radius: 22px; border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
    position: relative; z-index: 1; margin: 20px;
  }
  .login-input {
    width: 100% !important;
    padding: 11px 14px !important;
    background: rgba(255,255,255,0.08) !important;
    border: 1.5px solid rgba(255,255,255,0.15) !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    color: #fff !important;
    outline: none !important;
    transition: border-color .2s, background .2s !important;
    box-sizing: border-box !important;
  }
  .login-input:focus {
    border-color: rgba(125,211,252,0.85) !important;
    background: rgba(255,255,255,0.12) !important;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.3); }
  .login-btn {
    width: 100%; padding: 12px 0;
    background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%);
    border: none; border-radius: 11px;
    color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.3px;
    box-shadow: 0 4px 18px rgba(3,105,161,0.5);
    transition: opacity .15s, transform .12s, box-shadow .15s;
  }
  .login-btn:hover:not(:disabled) {
    opacity: 0.92; transform: translateY(-1px);
    box-shadow: 0 7px 22px rgba(3,105,161,0.6);
  }
  .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .login-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
    margin: 24px 0;
  }
`

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(username, password)
      localStorage.setItem('authToken', res.data.token)
      window.location.href = '/'
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Make sure the backend is running.')
      } else {
        setError('Invalid username or password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="login-page">

        {/* Background blobs */}
        <div className="login-blob" style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, #0369a1 0%, transparent 70%)',
          top: '-200px', left: '-150px',
        }} />
        <div className="login-blob" style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, #0891b2 0%, transparent 70%)',
          bottom: '-120px', right: '-120px',
        }} />
        <div className="login-blob" style={{
          width: 260, height: 260,
          background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
          top: '45%', right: '5%',
        }} />

        <div className="login-card">

          {/* Brand header */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 62, height: 62, borderRadius: 18, marginBottom: 16,
              background: 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)',
              boxShadow: '0 8px 28px rgba(3,105,161,0.55)',
            }}>
              {/* Bowl + Heart — food aid / NutriAid */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                {/* Heart (care/aid) */}
                <path d="M12 9.5 C12 9.5 7.5 6.5 7.5 4.2 C7.5 2.8 8.9 2.3 9.8 2.8 C10.7 3.3 12 5.2 12 5.2 C12 5.2 13.3 3.3 14.2 2.8 C15.1 2.3 16.5 2.8 16.5 4.2 C16.5 6.5 12 9.5 12 9.5Z" fill="rgba(255,255,255,0.95)"/>
                {/* Bowl (food/nutrition) */}
                <path d="M4 13 Q4 19.5 12 19.5 Q20 19.5 20 13 Z" fill="rgba(255,255,255,0.88)"/>
                {/* Bowl base */}
                <rect x="9" y="19" width="6" height="1.8" rx="0.9" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Nutri<span style={{ color: '#7dd3fc' }}>Aid</span>
              <span style={{ color: '#a5f3fc', fontSize: 20, fontWeight: 700 }}>4B40</span>
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.45)', marginTop: 7, fontSize: 11,
              letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
            }}>
              Food Aid Allocation System
            </div>
            <div style={{
              width: 36, height: 3, margin: '14px auto 0',
              background: 'linear-gradient(to right, #0369a1, #22d3ee)',
              borderRadius: 99,
            }} />
          </div>

          {/* Form title */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#fff' }}>Welcome back</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
              Sign in to access the admin dashboard
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.35)',
              color: '#fca5a5', borderRadius: 10,
              padding: '10px 14px', fontSize: 12, marginBottom: 18,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', marginBottom: 7,
                letterSpacing: '0.6px', textTransform: 'uppercase',
              }}>
                Username
              </label>
              <input
                className="login-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: 'rgba(255,255,255,0.6)', marginBottom: 7,
                letterSpacing: '0.6px', textTransform: 'uppercase',
              }}>
                Password
              </label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <div className="login-divider" />

          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
            NutriAid4B40 &mdash; CAT405 FYP &copy; 2025 &nbsp;|&nbsp; USM
          </div>
        </div>
      </div>
    </>
  )
}
