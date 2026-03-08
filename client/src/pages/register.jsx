import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [roles, setRoles] = useState(['buyer'])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const valuePoints = useMemo(() => [
    'Post requests with clear budget caps',
    'Compete as a seller in sealed bidding rounds',
    'Track savings and conversion in one dashboard',
  ], [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register(email, password, name, roles)
      toast.success('Account created! Welcome to BidDown')
      navigate('/marketplace')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <h2>Join The Marketplace Built For Smarter Price Discovery.</h2>
        <p>Create your profile once and switch between buyer and seller workflows any time.</p>
        <div className="auth-points">
          {valuePoints.map((point) => (
            <span key={point}>• {point}</span>
          ))}
        </div>
      </aside>

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Set up your BidDown profile in under a minute</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="********"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="********"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">I want to...</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => toggleRole('buyer')}
                className={`filter-pill ${roles.includes('buyer') ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                Buy Services
              </button>
              <button
                type="button"
                onClick={() => toggleRole('seller')}
                className={`filter-pill ${roles.includes('seller') ? 'active' : ''}`}
                style={{ flex: 1 }}
              >
                Sell Services
              </button>
            </div>
            <div className="form-hint">You can be both. Select one or both roles.</div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 24 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
