import { useState } from 'react'
import { login } from '../api/api'

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
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--gray-100)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 24 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
            Nutri<span style={{ color: 'var(--primary-light)' }}>Aid</span>4B40
          </div>
          <div style={{ color: 'var(--gray-500)', marginTop: 6, fontSize: 13 }}>
            Food Aid Allocation System
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)' }}>Admin Login</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                Sign in to access the system
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--gray-500)' }}>
          NutriAid4B40 &mdash; CAT405 FYP &copy; 2025
        </div>
      </div>
    </div>
  )
}
