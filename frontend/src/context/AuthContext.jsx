import { createContext, useContext, useState, useEffect } from 'react'
import { API } from '../api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (e) {
        localStorage.clear()
      }
    } else {
      localStorage.clear()
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const r = await API.auth.login(credentials)
    localStorage.setItem('token', r.data.access_token)
    localStorage.setItem('user', JSON.stringify(r.data.user))
    setUser(r.data.user)
    return r.data
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
