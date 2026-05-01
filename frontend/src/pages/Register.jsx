import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API } from '@/api'
import { Icon } from '@/components/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast({
        variant: 'destructive',
        title: 'Password mismatch',
        description: 'Passwords do not match. Please try again.',
      })
      return
    }
    setLoading(true)
    try {
      await API.auth.register({ username: form.username, email: form.email, password: form.password })
      toast({
        title: 'Account created!',
        description: 'Redirecting to login...',
      })
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: err.response?.data?.detail || 'Registration failed. Try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { k: 'username', label: 'Username', icon: 'person', type: 'text', ph: 'e.g., john_doe' },
    { k: 'email', label: 'Email', icon: 'mail', type: 'email', ph: 'you@example.com' },
    { k: 'password', label: 'Password', icon: 'lock', type: 'password', ph: 'Min 8 characters' },
    { k: 'confirm', label: 'Confirm Password', icon: 'lock', type: 'password', ph: 'Repeat your password' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Icon name="eco" size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create account</h1>
          <p className="text-slate-400 mt-2">Start optimizing your feed formulations</p>
        </div>

        {/* Register Card */}
        <Card className="border-slate-800">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {fields.map(({ k, label, icon, type, ph }) => (
                <div key={k} className="space-y-2">
                  <Label htmlFor={k}>{label}</Label>
                  <div className="relative">
                    <Icon name={icon} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={k}
                      type={type}
                      placeholder={ph}
                      value={form[k]}
                      onChange={set(k)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
              ))}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="progress_activity" size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
