import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const location = useLocation()
  const navigate = useNavigate()
  const { login, register } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const nextMode = params.get('mode')
    if (nextMode === 'register' || nextMode === 'login') {
      setMode(nextMode)
    }
  }, [location.search])

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  const handleDemoLogin = async (role) => {
    const demoEmail = role === 'buyer' ? 'demo.buyer@brafom.gh' : 'demo.seller@brafom.gh'
    setLoading(true)
    try {
      await login(demoEmail, 'Demo1234')
      toast.success('Logged in as demo ' + (role === 'buyer' ? 'client' : 'provider'))
      navigate('/dashboard')
    } catch {
      toast.error('Demo login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (mode === 'register' && roles.length === 0) {
      toast.error('Choose at least one role to continue')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        await register(email, password, name, roles)
        toast.success('Account created!')
        navigate('/browse')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || (mode === 'login' ? 'Login failed' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <aside className="auth-brand">
          <div className="auth-brand-mark">BraFom</div>
          <h2>Get work fast. Hire smart. All in one marketplace.</h2>
          <p>
            Sign up in seconds and start posting jobs or placing bids right away.
          </p>
          <ul>
            <li>Reverse bidding for better prices</li>
            <li>Verified providers across local categories</li>
            <li>Smart matching by location and service type</li>
          </ul>
        </aside>

        <div className="auth-card">
          <div className="auth-header">
            <h1>{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h1>
            <p>{mode === 'login' ? 'Sign in to manage your bids and requests.' : 'Create your account to get started.'}</p>
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
                <label className="form-label">I want to use BraFom as</label>
                <div className="auth-role-row">
                  <button type="button" onClick={() => toggleRole('buyer')} className={`filter-pill ${roles.includes('buyer') ? 'active' : ''}`}>Client</button>
                  <button type="button" onClick={() => toggleRole('seller')} className={`filter-pill ${roles.includes('seller') ? 'active' : ''}`}>Provider</button>
                </div>
                <div className="form-hint">Select one or both roles.</div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 22 }} disabled={loading}>
              {loading
                ? (mode === 'login' ? 'Signing in...' : 'Creating account...')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {mode === 'login' && (
            <div className="demo-access">
              <div className="demo-access-label">Just exploring? Try a demo account</div>
              <div className="demo-access-row">
                <button
                  type="button"
                  className="btn btn-secondary demo-access-btn"
                  onClick={() => handleDemoLogin('buyer')}
                  disabled={loading}
                >
                  Try as Client
                </button>
                <button
                  type="button"
                  className="btn btn-secondary demo-access-btn"
                  onClick={() => handleDemoLogin('seller')}
                  disabled={loading}
                >
                  Try as Provider
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
