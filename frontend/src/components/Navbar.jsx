import { NavLink } from 'react-router-dom'

function logout() {
  localStorage.removeItem('authToken')
  window.location.href = '/login'
}

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="navbar-brand">
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
          marginLeft: 'auto', background: 'transparent', border: '1.5px solid #bfdbfe',
          color: '#bfdbfe', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, transition: 'all .15s',
        }}
        onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,.15)'; e.target.style.color = '#fff' }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#bfdbfe' }}
      >
        Logout
      </button>
    </nav>
  )
}
