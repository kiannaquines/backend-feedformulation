import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sprout, Mail, Lock, Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a4731 0%, #52796f 100%)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Sprout size={32} color="#fff"/>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.9375rem' }}>Sign in to FeedForm</p>
        </div>

        <div className="card">
          <div className="card-body">
            {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
                  <input
                    className="form-input" type="text" placeholder="your_username"
                    value={form.username} onChange={set('username')} required
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
                  <input
                    className="form-input" type="password" placeholder="••••••••"
                    value={form.password} onChange={set('password')} required
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
                {loading ? <><Loader2 size={18} className="animate-pulse"/>Signing in…</> : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.875rem', color: 'var(--gray-500)' }}>
              No account?{' '}
              <Link to="/register" style={{ color: 'var(--farm-green-mid)', fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
