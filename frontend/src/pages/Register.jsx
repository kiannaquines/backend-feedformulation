import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '../api'
import { Icon } from '../components/Icon'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await API.auth.register({ username: form.username, email: form.email, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
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
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Icon name="eco" size={32} color="#fff"/>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>Create account</h1>
          <p style={{ color: 'rgba(255,255,255,.7)' }}>Start optimizing your feed formulations</p>
        </div>

        <div className="card">
          <div className="card-body">
            {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ Account created! Redirecting to login…</div>}
            {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { k:'username', label:'Username',         Icon: 'person', type:'text',     ph:'e.g., john_doe'       },
                { k:'email',    label:'Email',            Icon: 'mail', type:'email',    ph:'you@example.com'      },
                { k:'password', label:'Password',         Icon: 'lock', type:'password', ph:'Min 8 characters'     },
                { k:'confirm',  label:'Confirm Password', Icon: 'lock', type:'password', ph:'Repeat your password' },
              ].map(({ k, label, Icon, type, ph }) => (
                <div className="form-group" key={k}>
                  <label className="form-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <Icon size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray-400)' }}/>
                    <input
                      className="form-input" type={type} placeholder={ph}
                      value={form[k]} onChange={set(k)} required
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>
              ))}

              <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading || success}>
                {loading ? <><Icon name="progress_activity" size={18} className="animate-pulse"/>Creating…</> : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.875rem', color: 'var(--gray-500)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
