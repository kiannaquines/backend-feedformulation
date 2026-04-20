import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon } from './Icon'
import { useState, useEffect } from 'react'

const NAV = [
  { to: '/dashboard',            label: 'Dashboard',       icon: 'dashboard' },
  { to: '/formulation',          label: 'Formulation',     icon: 'science'    },
  { to: '/ingredients',          label: 'Ingredients',     icon: 'inventory_2'         },
  { to: '/nutrient-requirements',label: 'Nutrients',       icon: 'checklist'      },
  { to: '/saved-formulations',   label: 'Saved',           icon: 'bookmark'      },
]

export default function SidebarLayout({ children }) {
  const { user, logout } = useAuth()
  const { pathname }     = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (!user) return null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'block', '@media (min-width: 1024px)': { display: 'none' } }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'var(--white)', borderRight: '1px solid var(--gray-200)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
      }} className="sidebar-responsive">
        
        {/* Brand */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid var(--gray-100)' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--text-main)',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon name="eco" size={18} color="var(--bg-surface)" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.04em' }}>FeedForm</span>
          </Link>
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}>
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, paddingLeft: 12 }}>
            Main 'menu'
          </div>
          {NAV.map(({ to, label, icon }) => {
            const active = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link key={to} to={to} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 6,
                textDecoration: 'none', fontWeight: 500, fontSize: '.875rem',
                color: active ? 'var(--text-main)' : 'var(--text-muted)',
                background: active ? 'var(--bg-surface-hover)' : 'transparent',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if(!active) { e.currentTarget.style.color = 'var(--text-main)' } }}
              onMouseLeave={e => { if(!active) { e.currentTarget.style.color = 'var(--text-muted)' } }}
              >
                <Icon name={icon} size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* 'person' Card inside sidebar */}
        <div style={{ padding: 16, borderTop: '1px solid var(--gray-100)' }}>
          <div style={{ background: 'var(--bg-app)', padding: 12, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--text-main)', color: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.username}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Navbar */}
        <header style={{
          height: 64, background: 'var(--white)', borderBottom: '1px solid var(--gray-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-600)', padding: 4 }}>
              <Icon name="menu" size={24} />
            </button>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-800)', margin: 0, display: 'none' }} className="desktop-page-title">
              {NAV.find(n => pathname === n.to)?.label || 'Dashboard'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="logout" size={16} /> <span className="hide-on-mobile">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
          {children}
        </main>
        
        <footer style={{
          padding: '20px 24px', textAlign: 'center', fontSize: '.8125rem', color: 'var(--gray-400)',
          borderTop: '1px solid var(--gray-200)', background: 'var(--white)'
        }}>
          © 2025 Feed Formulation System · Powered by Groq AI
        </footer>
      </div>
    </div>
  )
}
