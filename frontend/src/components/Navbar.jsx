import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sprout, LayoutDashboard, FlaskConical, Package, ListChecks, BookMarked, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard',            label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/formulation',          label: 'Formulation',     icon: FlaskConical    },
  { to: '/ingredients',          label: 'Ingredients',     icon: Package         },
  { to: '/nutrient-requirements',label: 'Nutrients',       icon: ListChecks      },
  { to: '/saved-formulations',   label: 'Saved',           icon: BookMarked      },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname }     = useLocation()
  const [open, setOpen]  = useState(false)

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/dashboard" className="navbar-brand">
            <div className="navbar-logo">
              <Sprout size={20} color="#fff" />
            </div>
            <span className="navbar-title">FeedForm</span>
          </Link>

          {/* Desktop nav */}
          <div className="navbar-nav" style={{ display: 'none' }} id="desktop-nav">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to} to={to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 8,
                  fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname === to ? 'var(--farm-green-mid)' : 'var(--gray-500)',
                  background: pathname === to ? 'var(--emerald-light)' : 'transparent',
                  transition: 'all .18s',
                }}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--gray-500)', marginRight: 4 }}>
              {user.username}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={logout} title="Logout">
              <LogOut size={16} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} title="Menu">
              {open ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / full menu */}
      {open && (
        <div style={{
          borderTop: '1px solid var(--gray-100)', background: 'var(--white)',
          padding: '12px 0',
        }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to} to={to}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  fontWeight: 500, fontSize: '.9rem', textDecoration: 'none',
                  color: pathname === to ? 'var(--farm-green-mid)' : 'var(--gray-700)',
                  background: pathname === to ? 'var(--emerald-light)' : 'transparent',
                }}
              >
                <Icon size={17}/> {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
