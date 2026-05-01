// Old Navbar removed. This file is now empty and ready for new implementation.
export default function Navbar() {
  return null;
}
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
              <Icon name="logout" size={16} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} title="'menu'">
              {open ? <Icon name="close" size={18}/> : <Icon name="menu" size={18}/>}
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
