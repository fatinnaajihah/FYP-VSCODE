import { NavLink } from 'react-router-dom'

function logout() {
  localStorage.removeItem('authToken')
  window.location.href = '/login'
}

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
        {/* Bowl + Heart logo */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M12 9.5 C12 9.5 7.5 6.5 7.5 4.2 C7.5 2.8 8.9 2.3 9.8 2.8 C10.7 3.3 12 5.2 12 5.2 C12 5.2 13.3 3.3 14.2 2.8 C15.1 2.3 16.5 2.8 16.5 4.2 C16.5 6.5 12 9.5 12 9.5Z" fill="rgba(255,255,255,0.9)"/>
          <path d="M4 13 Q4 19.5 12 19.5 Q20 19.5 20 13 Z" fill="rgba(255,255,255,0.82)"/>
          <rect x="9" y="19" width="6" height="1.8" rx="0.9" fill="rgba(255,255,255,0.45)"/>
        </svg>
        Nutri<span>Aid</span>4B40
      </a>
      <div className="navbar-links">
        <NavLink to="/beneficiaries" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Beneficiaries
        </NavLink>
        <NavLink to="/scoring" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Priority Scoring
        </NavLink>
        <NavLink to="/optimization" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          GA Optimization
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Results & Analysis
        </NavLink>
      </div>
      <button
        onClick={logout}
        style={{
          marginLeft: 'auto', background: 'transparent', border: '1.5px solid rgba(125,211,252,.5)',
          color: '#7dd3fc', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, transition: 'all .15s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,.15)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,.4)' }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#7dd3fc'; e.target.style.borderColor = 'rgba(125,211,252,.5)' }}
      >
        Logout
      </button>
    </nav>
  )
}
