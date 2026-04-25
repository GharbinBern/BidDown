import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store'

export default function LoginPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [roles, setRoles] = useState(['buyer'])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, register } = useAuthStore()

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        toast.success('Welcome back!')
      } else {
        await register(email, password, name, roles)
        toast.success('Account created!')
      }
      navigate('/browse')
    } catch (error) {
      toast.error(error.response?.data?.error || (mode === 'login' ? 'Login failed' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{mode === 'login' ? 'Welcome back.' : 'Get started.'}</h1>
          <p>{mode === 'login' ? 'Sign in to manage your requests and bids.' : 'Create your account and start trading.'}</p>
        </div>

        <div className="auth-mode-toggle">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign In</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" placeholder="John Doe" required />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="you@example.com" required />
          </div>

          <div className={mode === 'register' ? 'form-row' : ''}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
            </div>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" placeholder="••••••••" required />
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">I want to...</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => toggleRole('buyer')} className={`filter-pill ${roles.includes('buyer') ? 'active' : ''}`} style={{ flex: 1 }}>Buy Services</button>
                <button type="button" onClick={() => toggleRole('seller')} className={`filter-pill ${roles.includes('seller') ? 'active' : ''}`} style={{ flex: 1 }}>Sell Services</button>
              </div>
              <div className="form-hint">You can be both. Select one or both roles.</div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} disabled={loading}>
            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  )
}
