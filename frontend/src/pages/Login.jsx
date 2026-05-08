import { useState } from 'react'
import { login } from '../api/api'

const css = `
  .login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #1a1040 100%);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; position: relative;
  }
  .login-blob {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(70px); opacity: 0.55;
  }
  .login-card {
    width: 100%; max-width: 420px; padding: 44px 40px;
    background: rgba(255,255,255,0.07);
    backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
    border-radius: 22px; border: 1px solid rgba(255,255,255,0.13);
    box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
    position: relative; z-index: 1; margin: 20px;
  }
  .login-input {
    width: 100% !important;
    padding: 11px 14px !important;
    background: rgba(255,255,255,0.07) !important;
    border: 1.5px solid rgba(255,255,255,0.13) !important;
    border-radius: 10px !important;
    font-size: 13px !important;
    color: #fff !important;
    outline: none !important;
    transition: border-color .2s, background .2s !important;
    box-sizing: border-box !important;
  }
  .login-input:focus {
    border-color: rgba(167,139,250,0.85) !important;
    background: rgba(255,255,255,0.10) !important;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.28); }
  .login-btn {
    width: 100%; padding: 12px 0;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none; border-radius: 11px;
    color: #fff; font-size: 14px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.3px;
    box-shadow: 0 4px 18px rgba(99,102,241,0.45);
    transition: opacity .15s, transform .12s, box-shadow .15s;
  }
  .login-btn:hover:not(:disabled) {
    opacity: 0.92; transform: translateY(-1px);
    box-shadow: 0 7px 22px rgba(99,102,241,0.55);
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
          width: 480, height: 480,
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          top: '-160px', left: '-160px',
        }} />
        <div className="login-blob" style={{
          width: 360, height: 360,
          background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
          bottom: '-80px', right: '-80px',
        }} />
        <div className="login-blob" style={{
          width: 220, height: 220,
          background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)',
          top: '55%', right: '10%',
        }} />

        <div className="login-card">

          {/* Brand header */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 58, height: 58, borderRadius: 16, marginBottom: 16,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.5)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C8.5 3 5 6 5 10c0 2.8 1.6 5.2 4 6.5V20h6v-3.5c2.4-1.3 4-3.7 4-6.5 0-4-3.5-7-7-7z" fill="rgba(255,255,255,0.9)"/>
                <path d="M10 20h4v1.5a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5V20z" fill="rgba(255,255,255,0.6)"/>
              </svg>
            </div>

            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
              Nutri<span style={{ color: '#a78bfa' }}>Aid</span>
              <span style={{ color: '#818cf8', fontSize: 20, fontWeight: 700 }}>4B40</span>
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.45)', marginTop: 7, fontSize: 11,
              letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 500,
            }}>
              Food Aid Allocation System
            </div>
            <div style={{
              width: 36, height: 3, margin: '14px auto 0',
              background: 'linear-gradient(to right, #6366f1, #a78bfa)',
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
