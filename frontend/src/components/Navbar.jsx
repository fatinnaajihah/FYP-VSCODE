import { NavLink } from 'react-router-dom'

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
    </nav>
  )
}
