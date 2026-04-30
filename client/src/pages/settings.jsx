import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BadgeCheck,
  Briefcase,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Lock,
  LogOut,
  MapPin,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { api } from '../api'
import { useAuthStore } from '../store'

const AVATAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#e11d48', '#6366f1', '#0d9488']
function avatarBg(name) {
  if (!name) return AVATAR_COLORS[0]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

const CATEGORY_SPECIALISATIONS = {
  'Home Repairs': ['Leak detection', 'Fixture replacement', 'Wall patching', 'Door and lock repairs', 'Ceiling repairs', 'General maintenance'],
  Electrical: ['Wiring and rewiring', 'Socket replacement', 'Lighting installation', 'Circuit breaker fixes', 'Generator changeover setup', 'Fault diagnosis'],
  Carpentry: ['Custom shelving', 'Cabinet installation', 'Door fitting', 'Furniture repairs', 'Wardrobe build', 'Roof woodwork'],
  Plumbing: ['Pipe installation', 'Leak repairs', 'Water heater setup', 'Drain unclogging', 'Bathroom fittings', 'Pump servicing'],
}

function FieldLabel({ children }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', display: 'block', marginBottom: 7 }}>
      {children}
    </span>
  )
}

function SectionPanel({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #d8e0ea',
      borderRadius: 12, overflow: 'hidden', marginBottom: 16,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ padding: '16px 22px', borderBottom: '1px solid #eaeff6' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2533', fontFamily: 'var(--font-head)', marginBottom: 2 }}>
          {title}
        </div>
        {subtitle && <div style={{ color: '#7b8fa3', fontSize: 13 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '20px 22px' }}>
        {children}
      </div>
    </div>
  )
}

const INPUT_STYLE = {
  width: '100%',
  background: '#fafbfd',
  border: '1px solid #d0d8e4',
  borderRadius: 8,
  padding: '9px 13px',
  fontSize: 14,
  color: '#1a2533',
  fontFamily: 'var(--font)',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
  const roles = user?.roles || []
  const isSeller = roles.includes('seller')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [verificationState, setVerificationState] = useState({
    national_id_verified: false,
    phone_verified: false,
    background_check_cleared: false,
    skill_assessment_passed: false,
  })
  const phoneInputRef = useRef(null)

  const deriveForm = (u = {}) => {
    const split = (u?.name || '').trim().split(/\s+/).filter(Boolean)
    return {
      firstName: split[0] || '',
      lastName: split.slice(1).join(' ') || '',
      email: u?.email || '',
      phone: u?.phone || '',
      city: u?.city || '',
      neighbourhood: u?.neighbourhood || '',
      about: u?.seller_profile?.bio || '',
      category: u?.primaryCategory || '',
    }
  }

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'User'
    return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')
  }, [user])

  const [form, setForm] = useState(() => deriveForm(user || {}))
  useEffect(() => { setForm(deriveForm(user || {})) }, [user])

  const [activeSkills, setActiveSkills] = useState(() =>
    Array.isArray(user?.skills) && user.skills.length ? user.skills : []
  )
  useEffect(() => {
    if (Array.isArray(user?.skills) && user.skills.length) setActiveSkills(user.skills)
  }, [user])

  const allSkillTags = useMemo(() => {
    const base = CATEGORY_SPECIALISATIONS[form.category] || []
    const extras = activeSkills.filter((s) => !base.includes(s))
    return [...base, ...extras]
  }, [activeSkills, form.category])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!user?._id) return
      setLoadingProfile(true)
      try {
        const [{ data: me }, { data: prof }] = await Promise.all([api.getMe(), api.getUserProfile(user._id)])
        if (cancelled) return
        const merged = {
          ...me,
          city: prof?.provider_profile?.city || me?.city || '',
          primaryCategory: me?.primaryCategory || '',
          skills: prof?.provider_profile?.skills?.length ? prof.provider_profile.skills : (Array.isArray(me?.skills) ? me.skills : []),
          seller_profile: { ...(me?.seller_profile || {}), bio: prof?.user?.seller_profile?.bio || me?.seller_profile?.bio || '' },
        }
        setUser(merged)
        setForm(deriveForm(merged))
        if (Array.isArray(merged.skills) && merged.skills.length) setActiveSkills(merged.skills)
        const v = prof?.provider_profile?.verification || {}
        setVerificationState({
          national_id_verified: !!v.national_id_verified,
          phone_verified: !!v.phone_verified,
          background_check_cleared: !!v.background_check_cleared,
          skill_assessment_passed: !!v.skill_assessment_passed,
        })
      } catch (err) {
        if (!cancelled) toast.error(err?.response?.data?.error || 'Could not load profile.')
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?._id])

  const profileName = `${form.firstName} ${form.lastName}`.trim()
  const profileLocation = form.city ? `${form.city}, Ghana` : 'Ghana'

  const verificationRows = useMemo(() => {
    const hasPhone = Boolean((form.phone || '').trim())
    return [
      {
        key: 'national_id_verified',
        title: 'National ID',
        detail: verificationState.national_id_verified ? 'Identity confirmed' : 'Upload your Ghana Card or passport',
        done: verificationState.national_id_verified,
        action: 'Start verification',
        onAction: () => toast('ID verification will be available here soon.'),
      },
      {
        key: 'phone_verified',
        title: 'Phone number',
        detail: verificationState.phone_verified
          ? `Verified · ${form.phone || user?.phone}`
          : hasPhone ? 'Verify your number with a code' : 'Add a phone number first',
        done: verificationState.phone_verified,
        action: hasPhone ? 'Send code' : 'Add phone number',
        onAction: () => {
          if (!hasPhone) { phoneInputRef.current?.focus(); toast('Add a phone number above first.'); return }
          toast('Phone verification will be available here soon.')
        },
      },
      {
        key: 'background_check_cleared',
        title: 'Background check',
        detail: verificationState.background_check_cleared ? 'Check passed' : 'Builds trust with clients in your area',
        done: verificationState.background_check_cleared,
        action: 'Request check',
        onAction: () => toast('Background check will be available here soon.'),
      },
      {
        key: 'skill_assessment_passed',
        title: 'Skill assessment',
        detail: verificationState.skill_assessment_passed ? 'Assessment passed' : 'Demonstrate your expertise with a short test',
        done: verificationState.skill_assessment_passed,
        action: 'Take assessment',
        onAction: () => toast('Skill assessment will be available here soon.'),
      },
    ]
  }, [form.phone, user?.phone, verificationState])

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const toggleSkill = (s) => setActiveSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const resetProfile = () => {
    setForm(deriveForm(user || {}))
    if (Array.isArray(user?.skills)) setActiveSkills(user.skills)
    toast.success('Changes discarded.')
  }

  const saveProfile = async () => {
    try {
      setSavingProfile(true)
      const { data } = await api.updateMyProfile({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone,
        city: form.city, neighbourhood: form.neighbourhood,
        about: form.about, primaryCategory: form.category,
        skills: activeSkills,
      })
      const next = { ...data.user, skills: activeSkills }
      setUser(next)
      setForm(deriveForm(next))
      toast.success('Profile saved.')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const saveSkills = async () => {
    try {
      setSavingSkills(true)
      const { data } = await api.updateMyProfile({ primaryCategory: form.category, city: form.city, skills: activeSkills })
      setUser({ ...data.user, skills: activeSkills })
      toast.success('Skills saved.')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not save skills.')
    } finally {
      setSavingSkills(false)
    }
  }

  const NAV_ITEMS = [
    { label: 'Public Profile', icon: <CircleUserRound size={16} />, active: true },
    { label: 'Verification',   icon: <ShieldCheck size={16} /> },
    { label: 'Password & Security', icon: <Lock size={16} /> },
    { label: 'Payment & Payouts',   icon: <CreditCard size={16} /> },
  ]

  const FIELD_ROWS = [
    { field: 'firstName',    label: 'First name',    type: 'text' },
    { field: 'lastName',     label: 'Last name',     type: 'text' },
    { field: 'email',        label: 'Email address', type: 'email' },
    { field: 'phone',        label: 'Phone number',  type: 'tel', ref: phoneInputRef },
    { field: 'city',         label: 'City',          type: 'text' },
    { field: 'neighbourhood',label: 'Neighbourhood', type: 'text' },
  ]

  return (
    <div className="main" style={{ maxWidth: 1120, paddingTop: 20, opacity: loadingProfile ? 0.85 : 1, transition: 'opacity 0.2s' }}>


      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Sidebar ── */}
        <aside style={{ flex: '1 1 240px', maxWidth: 268, minWidth: 220 }}>
          <div style={{
            background: '#fff', border: '1px solid #d8e0ea',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }}>
            {/* Avatar + identity */}
            <div style={{ padding: '26px 18px 18px', textAlign: 'center', borderBottom: '1px solid #eaeff6' }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%',
                margin: '0 auto 14px',
                background: avatarBg(user?.name),
                color: '#fff',
                display: 'grid', placeItems: 'center',
                fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-head)',
                boxShadow: '0 0 0 4px #fff, 0 0 0 7px #e0e8f4',
              }}>
                {initials || 'U'}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2533', fontFamily: 'var(--font-head)', lineHeight: 1.2, marginBottom: 5 }}>
                {profileName || 'Your Name'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#8fa3b5', fontSize: 12 }}>
                <MapPin size={12} />
                {profileLocation}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 16, paddingTop: 16, borderTop: '1px solid #eaeff6' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                    <Star size={13} color="#dca53a" fill="#dca53a" />
                    {Number(user?.average_rating ?? 0).toFixed(1)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                    <Briefcase size={13} color="#6b7b8d" />
                    {user?.total_jobs_completed ?? 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Jobs done</div>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav>
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  style={{
                    display: 'flex', width: '100%',
                    alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, border: 'none', borderBottom: '1px solid #eaeff6',
                    borderLeft: `3px solid ${item.active ? 'var(--accent)' : 'transparent'}`,
                    background: item.active ? '#fffbf2' : '#fff',
                    color: item.active ? 'var(--accent)' : '#3a4d60',
                    fontSize: 13, fontWeight: item.active ? 700 : 500,
                    padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronRight size={14} style={{ opacity: 0.35 }} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => { logout(); navigate('/') }}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center', gap: 9,
                  border: 'none', borderLeft: '3px solid transparent',
                  background: '#fff', color: '#c0392b',
                  fontSize: 13, fontWeight: 500,
                  padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                Sign out
              </button>
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section style={{ flex: '2 1 580px', minWidth: 280 }}>

          {/* Personal information */}
          <SectionPanel
            title="Personal information"
            subtitle="Visible on your public provider profile"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
              {FIELD_ROWS.map(({ field, label, type, ref }) => (
                <label key={field} style={{ display: 'grid', gap: 0 }}>
                  <FieldLabel>{label}</FieldLabel>
                  <input
                    ref={ref}
                    type={type}
                    value={form[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                    placeholder={label}
                    style={INPUT_STYLE}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#d0d8e4' }}
                  />
                </label>
              ))}
            </div>
            <label style={{ display: 'grid', gap: 0 }}>
              <FieldLabel>
                About me{' '}
                <span style={{ color: '#9baab8', fontWeight: 400 }}>(shown on your public profile)</span>
              </FieldLabel>
              <textarea
                rows={4}
                value={form.about}
                onChange={(e) => updateField('about', e.target.value)}
                placeholder="Describe your experience and why clients should hire you..."
                style={{ ...INPUT_STYLE, resize: 'vertical', lineHeight: 1.55 }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { e.target.style.borderColor = '#d0d8e4' }}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button
                type="button"
                onClick={resetProfile}
                style={{
                  border: '1px solid #d0d8e4', background: '#fff',
                  borderRadius: 8, padding: '9px 18px',
                  fontSize: 13, fontWeight: 600, color: '#3a4d60', cursor: 'pointer',
                }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                style={{
                  border: 'none', background: 'var(--accent)',
                  borderRadius: 8, padding: '9px 22px',
                  fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  opacity: savingProfile ? 0.6 : 1,
                }}
              >
                {savingProfile ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </SectionPanel>

          {/* Skills & categories (sellers only) */}
          {isSeller && (
            <SectionPanel
              title="Skills and service categories"
              subtitle="Used to match you with relevant job requests on BidDown"
            >
              <label style={{ display: 'grid', gap: 0, maxWidth: 320, marginBottom: 20 }}>
                <FieldLabel>Primary category</FieldLabel>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#d0d8e4' }}
                >
                  <option value="">Select a category</option>
                  <option value="Home Repairs">Home Repairs</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Carpentry">Carpentry</option>
                  <option value="Plumbing">Plumbing</option>
                </select>
              </label>

              <div>
                <FieldLabel>Specialisations</FieldLabel>
                {allSkillTags.length === 0 ? (
                  <p style={{ color: 'var(--muted)', fontSize: 13, margin: '6px 0 0' }}>
                    Select a category above to see specialisations.
                  </p>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                    {allSkillTags.map((skill) => {
                      const on = activeSkills.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          style={{
                            border: on ? '1.5px solid #7ab2e6' : '1px solid #d0d8e4',
                            background: on ? '#ddeefa' : '#f6f8fb',
                            color: on ? '#1a4d80' : '#4e5b6a',
                            fontSize: 13, fontWeight: on ? 700 : 500,
                            borderRadius: 6, padding: '7px 14px',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
                <button
                  type="button"
                  onClick={saveSkills}
                  disabled={savingSkills}
                  style={{
                    border: 'none', background: 'var(--accent)',
                    borderRadius: 8, padding: '9px 22px',
                    fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                    opacity: savingSkills ? 0.6 : 1,
                  }}
                >
                  {savingSkills ? 'Saving...' : 'Save skills'}
                </button>
              </div>
            </SectionPanel>
          )}

          {/* Verification (sellers only) */}
          {isSeller && (
            <SectionPanel
              title="Verification and trust"
              subtitle="Complete these steps to build credibility with clients and stand out on BidDown"
            >
              <div style={{ display: 'grid', gap: 10 }}>
                {verificationRows.map((entry) => (
                  <div
                    key={entry.key}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: 12,
                      border: `1px solid ${entry.done ? '#c3e6c3' : '#e4eaf3'}`,
                      borderRadius: 10, padding: '13px 16px',
                      background: entry.done ? '#f4fbf4' : '#fff',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: entry.done ? '#d4edd4' : '#f0f4f8',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <BadgeCheck size={18} color={entry.done ? '#2a7a2a' : '#9baab8'} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2533', marginBottom: 2 }}>{entry.title}</div>
                        <div style={{ fontSize: 12, color: '#7b8fa3' }}>{entry.detail}</div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {entry.done ? (
                        <span style={{
                          background: '#d4edd4', color: '#2a7a2a',
                          borderRadius: 5, fontSize: 11, fontWeight: 700, padding: '4px 10px',
                        }}>
                          Done
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={entry.onAction}
                          style={{
                            border: '1px solid #c8d8ea', background: '#fff',
                            borderRadius: 7, padding: '6px 13px',
                            fontSize: 12, fontWeight: 600, color: '#3a4d60', cursor: 'pointer',
                          }}
                        >
                          {entry.action}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionPanel>
          )}

          {/* Danger zone */}
          <div style={{
            background: '#fff', border: '1px solid #eac4c0',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ background: '#fff8f7', padding: '14px 22px', borderBottom: '1px solid #eac4c0' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#c0392b', fontFamily: 'var(--font-head)' }}>
                Danger zone
              </div>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#2f3e4f', marginBottom: 4 }}>Deactivate account</div>
              <div style={{ color: '#7b8fa3', fontSize: 13, maxWidth: 520, marginBottom: 16, lineHeight: 1.65 }}>
                Your profile will be hidden and all active bids withdrawn. You can reactivate at any time by signing back in.
              </div>
              <button
                type="button"
                style={{
                  border: '1px solid #eac4c0', background: '#fff',
                  color: '#c0392b', borderRadius: 8, padding: '9px 18px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Deactivate account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
