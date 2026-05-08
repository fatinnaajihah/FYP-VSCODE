import { useState } from 'react'
import { login } from '../api/api'

const css = `
  .login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #164e63 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    overflow: hidden; position: relative;
  }

  /* ── Animated blobs ── */
  .login-blob {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(90px);
  }
  .blob1 {
    width: 600px; height: 600px; opacity: 0.28;
    background: radial-gradient(circle, #0369a1 0%, transparent 70%);
    top: -220px; left: -180px;
    animation: floatA 20s ease-in-out infinite;
  }
  .blob2 {
    width: 520px; height: 520px; opacity: 0.25;
    background: radial-gradient(circle, #0891b2 0%, transparent 70%);
    bottom: -160px; right: -160px;
    animation: floatB 25s ease-in-out infinite;
  }
  .blob3 {
    width: 340px; height: 340px; opacity: 0.18;
    background: radial-gradient(circle, #22d3ee 0%, transparent 70%);
    top: 40%; left: 55%;
    animation: floatC 18s ease-in-out infinite;
  }
  .blob4 {
    width: 280px; height: 280px; opacity: 0.15;
    background: radial-gradient(circle, #38bdf8 0%, transparent 70%);
    bottom: 20%; left: 10%;
    animation: floatD 22s ease-in-out infinite;
  }

  @keyframes floatA {
    0%,100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(50px, -70px) scale(1.08); }
    66%      { transform: translate(-40px, 40px) scale(0.95); }
  }
  @keyframes floatB {
    0%,100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(-60px, 50px) scale(1.06); }
    66%      { transform: translate(70px, -30px) scale(1.1); }
  }
  @keyframes floatC {
    0%,100% { transform: translate(0, 0) scale(1); }
    50%      { transform: translate(-80px, 60px) scale(0.9); }
  }
  @keyframes floatD {
    0%,100% { transform: translate(0, 0) scale(1); }
    40%      { transform: translate(60px, -40px) scale(1.1); }
    80%      { transform: translate(-30px, 50px) scale(0.95); }
  }

  /* ── Layout ── */
  .login-split {
    display: flex; align-items: center; gap: 0;
    width: 100%; max-width: 1040px;
    padding: 60px 48px;
    position: relative; z-index: 1; flex: 1;
  }
  .login-brand-side {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding-right: 64px;
  }
  .login-vdivider {
    width: 1px; height: 360px; flex-shrink: 0;
    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent);
  }
  .login-form-side {
    flex: 1; display: flex; flex-direction: column;
    justify-content: center; padding-left: 64px;
  }

  /* ── Inputs ── */
  .login-input {
    width: 100% !important;
    padding: 15px 18px !important;
    background: rgba(255,255,255,0.1) !important;
    border: 1.5px solid rgba(255,255,255,0.2) !important;
    border-radius: 14px !important;
    font-size: 15px !important;
    color: #fff !important;
    outline: none !important;
    transition: border-color .2s, background .2s !important;
    box-sizing: border-box !important;
  }
  .login-input:focus {
    border-color: rgba(125,211,252,0.9) !important;
    background: rgba(255,255,255,0.16) !important;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.32); }

  /* ── Button ── */
  .login-btn {
    width: 100%; padding: 16px 0; margin-top: 8px;
    background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%);
    border: none; border-radius: 14px;
    color: #fff; font-size: 16px; font-weight: 700;
    cursor: pointer; letter-spacing: 0.4px;
    box-shadow: 0 6px 24px rgba(3,105,161,0.55);
    transition: opacity .15s, transform .12s, box-shadow .15s;
  }
  .login-btn:hover:not(:disabled) {
    opacity: 0.92; transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(3,105,161,0.65);
  }
  .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Footer ── */
  .login-footer {
    width: 100%; text-align: center; padding: 22px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.55);
    position: relative; z-index: 1; letter-spacing: 0.3px;
  }

  @media (max-width: 720px) {
    .login-split { flex-direction: column; gap: 40px; padding: 40px 24px; }
    .login-brand-side { padding-right: 0; }
    .login-form-side { padding-left: 0; }
    .login-vdivider { display: none; }
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

        {/* Animated background blobs */}
        <div className="login-blob blob1" />
        <div className="login-blob blob2" />
        <div className="login-blob blob3" />
        <div className="login-blob blob4" />

        {/* Split layout */}
        <div className="login-split">

          {/* ── Left: Branding ── */}
          <div className="login-brand-side">
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 100, height: 100, borderRadius: 28, marginBottom: 28,
              background: 'linear-gradient(135deg, #0369a1 0%, #0891b2 100%)',
              boxShadow: '0 14px 42px rgba(3,105,161,0.65)',
            }}>
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M12 9.5 C12 9.5 7.5 6.5 7.5 4.2 C7.5 2.8 8.9 2.3 9.8 2.8 C10.7 3.3 12 5.2 12 5.2 C12 5.2 13.3 3.3 14.2 2.8 C15.1 2.3 16.5 2.8 16.5 4.2 C16.5 6.5 12 9.5 12 9.5Z" fill="rgba(255,255,255,0.95)"/>
                <path d="M4 13 Q4 19.5 12 19.5 Q20 19.5 20 13 Z" fill="rgba(255,255,255,0.88)"/>
                <rect x="9" y="19" width="6" height="1.8" rx="0.9" fill="rgba(255,255,255,0.5)"/>
              </svg>
            </div>

            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
              Nutri<span style={{ color: '#7dd3fc' }}>Aid</span>
              <span style={{ color: '#a5f3fc', fontSize: 34, fontWeight: 700 }}>4B40</span>
            </div>

            <div style={{
              color: 'rgba(255,255,255,0.45)', marginTop: 12, fontSize: 12,
              letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 500,
            }}>
              Food Aid Allocation System
            </div>

            <div style={{
              width: 48, height: 3, margin: '22px auto 0',
              background: 'linear-gradient(to right, #0369a1, #22d3ee)',
              borderRadius: 99,
            }} />
          </div>

          {/* ── Divider ── */}
          <div className="login-vdivider" />

          {/* ── Right: Form ── */}
          <div className="login-form-side">
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>Welcome back</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
                Sign in to access the admin dashboard
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#fca5a5', borderRadius: 10,
                padding: '10px 14px', fontSize: 13, marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)', marginBottom: 9,
                  letterSpacing: '0.9px', textTransform: 'uppercase',
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

              <div style={{ marginBottom: 10 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)', marginBottom: 9,
                  letterSpacing: '0.9px', textTransform: 'uppercase',
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
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          NutriAid4B40 &mdash; CAT405 FYP &copy; 2025 &nbsp;|&nbsp; USM
        </div>
      </div>
    </>
  )
}
