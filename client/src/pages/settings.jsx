import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BadgeCheck,
  CircleUserRound,
  CreditCard,
  LogOut,
  Lock,
  ShieldCheck,
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
  'Home Repairs': [
    'Leak detection',
    'Fixture replacement',
    'Wall patching',
    'Door and lock repairs',
    'Ceiling repairs',
    'General maintenance',
  ],
  Electrical: [
    'Wiring and rewiring',
    'Socket replacement',
    'Lighting installation',
    'Circuit breaker fixes',
    'Generator changeover setup',
    'Fault diagnosis',
  ],
  Carpentry: [
    'Custom shelving',
    'Cabinet installation',
    'Door fitting',
    'Furniture repairs',
    'Wardrobe build',
    'Roof woodwork',
  ],
  Plumbing: [
    'Pipe installation',
    'Leak repairs',
    'Water heater setup',
    'Drain unclogging',
    'Bathroom fittings',
    'Pump servicing',
  ],
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
    electrical_badge: false,
  })
  const phoneInputRef = useRef(null)

  const deriveFormFromUser = (currentUser = {}) => {
    const split = (currentUser?.name || '').trim().split(/\s+/).filter(Boolean)
    return {
      firstName: split[0] || '',
      lastName: split.slice(1).join(' ') || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      city: currentUser?.city || '',
      neighbourhood: currentUser?.neighbourhood || '',
      about: currentUser?.seller_profile?.bio || '',
      category: currentUser?.primaryCategory || '',
    }
  }

  const initials = useMemo(() => {
    const name = user?.name?.trim() || 'User'
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
  }, [user])

  const [form, setForm] = useState(() => deriveFormFromUser(user || {}))

  useEffect(() => {
    setForm(deriveFormFromUser(user || {}))
  }, [user])

  const [activeSkillTags, setActiveSkillTags] = useState(() => {
    if (Array.isArray(user?.skills) && user.skills.length) return user.skills
    return []
  })

  useEffect(() => {
    if (Array.isArray(user?.skills) && user.skills.length) {
      setActiveSkillTags(user.skills)
    }
  }, [user])

  const allSkillTags = useMemo(() => {
    const base = CATEGORY_SPECIALISATIONS[form.category] || []
    const carryOver = activeSkillTags.filter((skill) => !base.includes(skill))
    return [...base, ...carryOver]
  }, [activeSkillTags, form.category])

  useEffect(() => {
    let cancelled = false

    const loadMyProfile = async () => {
      if (!user?._id) return
      setLoadingProfile(true)
      try {
        const [{ data: meData }, { data: profileData }] = await Promise.all([
          api.getMe(),
          api.getUserProfile(user._id),
        ])
        if (cancelled) return

        const mergedUser = {
          ...meData,
          city: profileData?.provider_profile?.city || meData?.city || '',
          primaryCategory: meData?.primaryCategory || form.category || '',
          skills: profileData?.provider_profile?.skills?.length
            ? profileData.provider_profile.skills
            : (Array.isArray(meData?.skills) ? meData.skills : []),
          seller_profile: {
            ...(meData?.seller_profile || {}),
            bio: profileData?.user?.seller_profile?.bio || meData?.seller_profile?.bio || '',
          },
        }

        setUser(mergedUser)
        setForm(deriveFormFromUser(mergedUser))
        if (Array.isArray(mergedUser.skills) && mergedUser.skills.length) {
          setActiveSkillTags(mergedUser.skills)
        }

        const verify = profileData?.provider_profile?.verification || {}
        setVerificationState({
          national_id_verified: !!verify.national_id_verified,
          phone_verified: !!verify.phone_verified,
          background_check_cleared: !!verify.background_check_cleared,
          skill_assessment_passed: !!verify.skill_assessment_passed,
          electrical_badge: !!verify.electrical_badge,
        })
      } catch (err) {
        if (cancelled) return
        const message = err?.response?.data?.error || 'Could not load profile details.'
        toast.error(message)
      } finally {
        if (!cancelled) setLoadingProfile(false)
      }
    }

    loadMyProfile()
    return () => {
      cancelled = true
    }
  }, [user?._id])

  const profileName = `${form.firstName} ${form.lastName}`.trim()
  const profileLocation = form.city ? `${form.city}, Ghana` : 'Ghana'

  const verificationRows = useMemo(() => {
    const hasPhone = Boolean((form.phone || '').trim())
    return [
      {
        key: 'national_id_verified',
        title: 'National ID',
        done: verificationState.national_id_verified,
        detail: verificationState.national_id_verified ? 'ID verified' : 'Not done',
        action: verificationState.national_id_verified ? 'View' : 'Start ID verification',
        onAction: () => {
          toast('ID verification submission will be enabled here soon.')
        },
      },
      {
        key: 'phone_verified',
        title: 'Phone number',
        done: verificationState.phone_verified,
        detail: verificationState.phone_verified
          ? `Verified (${form.phone || user?.phone || 'Phone number'})`
          : (hasPhone ? 'Not done' : 'Not done (add phone number first)'),
        action: verificationState.phone_verified
          ? 'View'
          : (hasPhone ? 'Send verification code' : 'Add phone number'),
        onAction: () => {
          if (verificationState.phone_verified) {
            toast.success('Phone number is already verified.')
            return
          }
          if (!hasPhone) {
            phoneInputRef.current?.focus()
            toast('Add a phone number first, then save changes.')
            return
          }
          toast('Phone OTP verification flow will be enabled here soon.')
        },
      },
      {
        key: 'background_check_cleared',
        title: 'Background check',
        done: verificationState.background_check_cleared,
        detail: verificationState.background_check_cleared ? 'Background check cleared' : 'Not done',
        action: verificationState.background_check_cleared ? 'View' : 'Request background check',
        onAction: () => {
          toast('Background check request flow will be enabled here soon.')
        },
      },
      {
        key: 'skill_assessment_passed',
        title: 'Skill assessment',
        done: verificationState.skill_assessment_passed,
        detail: verificationState.skill_assessment_passed ? 'Assessment passed' : 'Not done',
        action: verificationState.skill_assessment_passed ? 'View' : 'Take assessment',
        onAction: () => {
          toast('Skill assessment flow will be enabled here soon.')
        },
      },
    ]
  }, [form.phone, user?.phone, verificationState])

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const toggleSkill = (skill) => {
    setActiveSkillTags((prev) => (
      prev.includes(skill) ? prev.filter((entry) => entry !== skill) : [...prev, skill]
    ))
  }

  const resetProfile = () => {
    setForm(deriveFormFromUser(user || {}))
    if (Array.isArray(user?.skills) && user.skills.length) {
      setActiveSkillTags(user.skills)
    }
    toast.success('Changes discarded.')
  }

  const saveProfile = async () => {
    try {
      setSavingProfile(true)
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        neighbourhood: form.neighbourhood,
        about: form.about,
        primaryCategory: form.category,
        skills: activeSkillTags,
      }
      const { data } = await api.updateMyProfile(payload)
      const nextUser = {
        ...data.user,
        skills: activeSkillTags,
      }
      setUser(nextUser)
      setForm(deriveFormFromUser(nextUser))
      toast.success('Profile saved successfully.')
    } catch (err) {
      const message = err?.response?.data?.error || 'Could not save profile.'
      toast.error(message)
    } finally {
      setSavingProfile(false)
    }
  }

  const saveSkills = async () => {
    try {
      setSavingSkills(true)
      const payload = {
        primaryCategory: form.category,
        city: form.city,
        skills: activeSkillTags,
      }
      const { data } = await api.updateMyProfile(payload)
      const nextUser = {
        ...data.user,
        skills: activeSkillTags,
      }
      setUser(nextUser)
      toast.success('Skills saved successfully.')
    } catch (err) {
      const message = err?.response?.data?.error || 'Could not save skills.'
      toast.error(message)
    } finally {
      setSavingSkills(false)
    }
  }

  const panelStyle = {
    background: '#fff',
    border: '1px solid #d4dbe5',
    borderRadius: 12,
    overflow: 'hidden',
  }

  const sectionTitleStyle = {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
    color: 'var(--text)',
    fontFamily: 'var(--font-head)',
  }

  const badgeStyle = (bg, color = '#1f2b37') => ({
    background: bg,
    color,
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1,
    padding: '5px 8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  })

  const menuItem = (label, icon, active = false, muted = false) => (
    <button
      type="button"
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: 10,
        border: 'none',
        borderTop: '1px solid #e8edf3',
        background: active ? '#f0f2f5' : '#fff',
        color: muted ? '#8a97a8' : active ? '#1f2b37' : '#364658',
        fontSize: 14,
        fontWeight: active ? 700 : 500,
        padding: '11px 14px',
        textAlign: 'left',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (label === 'Sign out') {
          logout()
          navigate('/')
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )

  return (
    <div className="main" style={{ maxWidth: 1240, paddingTop: 12, opacity: loadingProfile ? 0.9 : 1 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <aside style={{ flex: '1 1 270px', maxWidth: 290, minWidth: 250 }}>
          <div style={panelStyle}>
            <div style={{ padding: '18px 16px 14px', textAlign: 'center' }}>
              <div style={{
                width: 82,
                height: 82,
                borderRadius: '50%',
                margin: '0 auto 10px',
                background: avatarBg(user?.name),
                color: '#fff',
                border: 'none',
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                fontSize: 24,
              }}>
                {initials || 'U'}
              </div>
              <div style={{ fontSize: 21, fontWeight: 800, color: '#273646', marginBottom: 2, fontFamily: 'var(--font-head)' }}>{profileName || 'User'}</div>
              <div style={{ color: '#75859a', fontSize: 13, marginBottom: 8 }}>Provider · {profileLocation}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid #e8edf3' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{Number(user?.average_rating ?? 0).toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{user?.total_jobs_completed ?? 0}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Jobs done</div>
                </div>
              </div>
            </div>
            {menuItem('Public Profile', <CircleUserRound size={16} />, true)}
            {menuItem('Verification', <ShieldCheck size={16} />)}
            {menuItem('Password & Security', <Lock size={16} />)}
            {menuItem('Payment & Payouts', <CreditCard size={16} />)}
            {menuItem('Sign out', <LogOut size={16} />)}
          </div>
        </aside>

        <section style={{ flex: '2 1 700px', minWidth: 300 }}>

          <div style={{ ...panelStyle, marginBottom: 14 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e6ebf2' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2b3848', fontFamily: 'var(--font-head)' }}>Personal information</div>
              <div style={{ marginTop: 2, color: '#7b899a', fontSize: 12 }}>Visible on your public provider profile</div>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>First name</span>
                  <input className="input-field" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>Last name</span>
                  <input className="input-field" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>Email address</span>
                  <input className="input-field" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>Phone number</span>
                  <input ref={phoneInputRef} className="input-field" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>City</span>
                  <input className="input-field" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>Neighbourhood</span>
                  <input className="input-field" value={form.neighbourhood} onChange={(e) => updateField('neighbourhood', e.target.value)} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
                <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>About me <span style={{ color: '#8a97a8', fontWeight: 500 }}>(shown on your public profile)</span></span>
                <textarea className="input-field" rows={5} value={form.about} onChange={(e) => updateField('about', e.target.value)} />
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-ghost" onClick={resetProfile}>Discard changes</button>
                <button type="button" className="btn btn-primary" onClick={saveProfile} disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>

          {isSeller && (
            <div style={{ ...panelStyle, marginBottom: 14 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e6ebf2', display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#2b3848', fontFamily: 'var(--font-head)' }}>Skills &amp; service categories</div>
                  <div style={{ marginTop: 2, color: '#7b899a', fontSize: 12 }}>Used to match you with relevant job requests</div>
                </div>
                <button type="button" style={{ border: 'none', background: 'transparent', color: '#1f60a0', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add skill</button>
              </div>
              <div style={{ padding: 16 }}>
                <label style={{ display: 'grid', gap: 6, maxWidth: 320 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>Primary category</span>
                  <select className="input-field" value={form.category} onChange={(e) => updateField('category', e.target.value)}>
                    <option value="">Select category</option>
                    <option value="Home Repairs">Home Repairs</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Plumbing">Plumbing</option>
                  </select>
                </label>
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: '#5b6879', fontWeight: 600, marginBottom: 8 }}>Specialisations</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {allSkillTags.map((skill) => {
                      const active = activeSkillTags.includes(skill)
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          style={{
                            border: active ? '1px solid #8cb8e6' : '1px solid #d0d8e3',
                            background: active ? '#e6f0fb' : '#f2f4f7',
                            color: active ? '#205486' : '#4e5b6a',
                            fontSize: 12,
                            borderRadius: 4,
                            padding: '6px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          {skill}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                  <button type="button" className="btn btn-primary" onClick={saveSkills} disabled={savingSkills}>
                    {savingSkills ? 'Saving...' : 'Save skills'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isSeller && (
            <div style={{ ...panelStyle, marginBottom: 14 }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #e6ebf2' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2b3848', fontFamily: 'var(--font-head)' }}>Verification &amp; trust</div>
                <div style={{ marginTop: 2, color: '#7b899a', fontSize: 12 }}>Complete these steps to strengthen your provider profile.</div>
              </div>
              <div style={{ padding: 16, display: 'grid', gap: 12 }}>
                {verificationRows.map((entry) => (
                  <div key={entry.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid #e8edf3', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: entry.done ? '#ecf3e4' : '#f5f7fa', display: 'grid', placeItems: 'center' }}>
                        <BadgeCheck size={16} color={entry.done ? '#3f7b2c' : '#77879a'} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2e3b4a' }}>{entry.title}</div>
                        <div style={{ fontSize: 12, color: '#77879a' }}>{entry.detail}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={badgeStyle('#f0f2f5', entry.done ? '#2f6d24' : '#77879a')}>{entry.done ? 'Done' : 'Not done'}</span>
                      {!entry.done && (
                        <button type="button" className="btn btn-ghost" onClick={entry.onAction} style={{ padding: '6px 10px', fontSize: 10 }}>
                          {entry.action}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ ...panelStyle, borderColor: '#ebc3c0' }}>
            <div style={{ background: '#fff5f5', borderBottom: '1px solid #ebc3c0', padding: '12px 16px' }}>
              <div style={{ color: '#be3b2f', fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-head)' }}>Danger zone</div>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2f3e4f', marginBottom: 4 }}>Deactivate account</div>
              <div style={{ color: '#687889', fontSize: 12, maxWidth: 680, marginBottom: 12 }}>
                Your profile will be hidden and all active bids will be withdrawn. You can reactivate at any time.
              </div>
              <button type="button" className="btn btn-ghost" style={{ borderColor: '#dcb6b3', color: '#a63b33' }}>
                Deactivate account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
