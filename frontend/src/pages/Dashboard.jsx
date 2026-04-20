import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../api'
import { FlaskConical, Package, ListChecks, BookMarked, TrendingUp, Zap, ChevronRight } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ ingredients: 0, nutrients: 0, saved: 0 })
  const [aiStatus, setAiStatus] = useState(null)

  useEffect(() => {
    Promise.all([
      API.ingredients.all(),
      API.nutrients.all(),
      API.formulation.mine(),
      API.ingredients.aiStatus(),
    ]).then(([ing, nut, form, ai]) => {
      setStats({
        ingredients: ing.data?.length ?? 0,
        nutrients:   nut.data?.length ?? 0,
        saved:       form.data?.length ?? 0,
      })
      setAiStatus(ai.data)
    }).catch(() => {})
  }, [])

  const STAT_CARDS = [
    { label: 'Ingredients',       value: stats.ingredients, icon: Package,   color: '#2563eb', bg: '#dbeafe' },
    { label: 'Nutrient Profiles', value: stats.nutrients,   icon: ListChecks, color: '#7c3aed', bg: '#ede9fe' },
    { label: 'Saved Formulas',    value: stats.saved,       icon: BookMarked, color: '#d97706', bg: '#fef3c7' },
  ]

  const QUICK_LINKS = [
    { to: '/formulation',           label: 'New Formulation',    desc: 'Run LP optimizer with lock-aware constraints', icon: FlaskConical, color: 'var(--farm-green-mid)' },
    { to: '/ingredients',           label: 'Manage Ingredients', desc: 'Add or edit ingredient nutritional data',      icon: Package,     color: '#2563eb'               },
    { to: '/nutrient-requirements', label: 'Nutrient Profiles',  desc: 'Create target profiles for different animals', icon: ListChecks,  color: '#7c3aed'               },
    { to: '/saved-formulations',    label: 'Saved Formulations', desc: 'Review and reuse past formulation results',    icon: BookMarked,  color: '#d97706'               },
  ]

  return (
    <div>
      {/* Hero */}
      <div className="page-hero" style={{ marginBottom: 32 }}>
        <div className="container page-hero-inner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
                Welcome back, {user?.username} 👋
              </h1>
              <p style={{ opacity: .8 }}>Your feed formulation dashboard</p>
            </div>
            {aiStatus && (
              <div style={{
                background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                borderRadius: 12, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: aiStatus.api_available ? '#4ade80' : '#f87171',
                  boxShadow: aiStatus.api_available ? '0 0 8px #4ade80' : '0 0 8px #f87171',
                }}/>
                <span style={{ fontSize: '.8125rem', color: '#fff', fontWeight: 600 }}>
                  {aiStatus.api_available ? `AI Online · ${aiStatus.model_name}` : 'AI Offline'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={22}/>
              </div>
              <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, var(--farm-green) 0%, var(--farm-accent) 100%)',
          borderRadius: 20, padding: '32px 36px', marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20, color: '#fff',
        }}>
          <div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: 6 }}>
              <Zap size={20} style={{ marginRight: 8, verticalAlign: 'middle' }}/>
              Start a New Formulation
            </h2>
            <p style={{ opacity: .8, fontSize: '.9375rem' }}>
              Set nutrient targets, lock key ingredients, and let the LP optimizer find the cheapest valid mix.
            </p>
          </div>
          <Link to="/formulation" className="btn btn-lg" style={{
            background: '#fff', color: 'var(--farm-green-mid)', fontWeight: 700,
            boxShadow: '0 4px 16px rgba(0,0,0,.2)',
          }}>
            Calculate Now <ChevronRight size={18}/>
          </Link>
        </div>

        {/* Quick links */}
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>
          Quick Access
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {QUICK_LINKS.map(({ to, label, desc, icon: Icon, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ transition: 'all .2s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='none';            e.currentTarget.style.boxShadow='var(--shadow-sm)' }}
              >
                <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: color + '18', color, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20}/>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--gray-900)' }}>{label}</div>
                    <div style={{ fontSize: '.8125rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tips */}
        <div style={{ marginTop: 32 }}>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <TrendingUp size={20} color="var(--farm-green-mid)"/>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Pro Tips</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '🔒 Set Min = Max on an ingredient to lock it at an exact percentage',
                  '💡 The AI will suggest which ingredient to adjust when a formula is infeasible',
                  '✅ All nutrient targets are equality constraints — achieved always equals required',
                  '⚡ Chat with the AI assistant to add ingredients in natural language',
                ].map(tip => (
                  <div key={tip} style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: 'var(--gray-50)', border: '1px solid var(--gray-100)',
                    fontSize: '.875rem', color: 'var(--gray-700)', lineHeight: 1.5,
                  }}>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
