import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BadgeCheck,
  Bell,
  ChartColumn,
  CircleUserRound,
  CreditCard,
  LogOut,
  Lock,
  Pencil,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { api } from '../api'
import { useAuthStore } from '../store'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
  const roles = user?.roles || []
  const isSeller = roles.includes('seller')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [verificationRows, setVerificationRows] = useState([
    { title: 'National ID', detail: 'Status unavailable', status: 'Pending', active: false },
    { title: 'Phone number', detail: 'Status unavailable', status: 'Pending', active: false },
    { title: 'Background check', detail: 'Status unavailable', status: 'Pending', active: false },
    { title: 'Skill assessment', detail: 'Status unavailable', status: 'Pending', active: false },
    { title: 'Electrical skill badge', detail: 'Not yet applied', status: 'Take assessment', active: false },
  ])

  const defaultAbout = 'I am a professional service provider based in Accra with years of hands-on experience across residential and commercial jobs.'

  const deriveFormFromUser = (currentUser = {}) => {
    const split = (currentUser?.name || 'User').trim().split(/\s+/)
    return {
      firstName: split[0] || 'User',
      lastName: split.slice(1).join(' ') || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '+233 24 555 7712',
      city: currentUser?.city || 'Accra',
      neighbourhood: currentUser?.neighbourhood || 'Adabraka',
      about: currentUser?.seller_profile?.bio || defaultAbout,
      category: currentUser?.primaryCategory || 'Home Repairs',
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
    return [
      'Polytank repair',
      'Float valve replacement',
      'Pipe fitting',
      'Bathroom fittings',
      'Overhead tank sealing',
      'Drain clearing',
    ]
  })

  useEffect(() => {
    if (Array.isArray(user?.skills) && user.skills.length) {
      setActiveSkillTags(user.skills)
    }
  }, [user])

  const allSkillTags = [
    'Polytank repair',
    'Float valve replacement',
    'Pipe fitting',
    'Bathroom fittings',
    'Overhead tank sealing',
    'Drain clearing',
    'Electrical',
    'Tiling',
    'Carpentry',
    'Painting',
  ]

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
          city: profileData?.provider_profile?.city || meData?.city || 'Accra',
          primaryCategory: meData?.primaryCategory || form.category || 'Home Repairs',
          skills: profileData?.provider_profile?.skills?.length
            ? profileData.provider_profile.skills
            : (Array.isArray(meData?.skills) ? meData.skills : []),
          seller_profile: {
            ...(meData?.seller_profile || {}),
            bio: profileData?.user?.seller_profile?.bio || meData?.seller_profile?.bio || defaultAbout,
          },
        }

        setUser(mergedUser)
        setForm(deriveFormFromUser(mergedUser))
        if (Array.isArray(mergedUser.skills) && mergedUser.skills.length) {
          setActiveSkillTags(mergedUser.skills)
        }

        const verify = profileData?.provider_profile?.verification || {}
        setVerificationRows([
          {
            title: 'National ID',
            detail: verify.national_id_verified ? 'Identity verified' : 'ID not yet verified',
            status: verify.national_id_verified ? 'Verified' : 'Pending',
            active: !!verify.national_id_verified,
          },
          {
            title: 'Phone number',
            detail: form.phone || mergedUser?.phone || 'Phone number not set',
            status: verify.phone_verified ? 'Verified' : 'Pending',
            active: !!verify.phone_verified,
          },
          {
            title: 'Background check',
            detail: verify.background_check_cleared ? 'Background cleared' : 'Check required',
            status: verify.background_check_cleared ? 'Verified' : 'Renew soon',
            active: !!verify.background_check_cleared,
          },
          {
            title: 'Skill assessment',
            detail: verify.skill_assessment_passed ? 'Assessment passed' : 'Assessment pending',
            status: verify.skill_assessment_passed ? 'Active' : 'Pending',
            active: !!verify.skill_assessment_passed,
          },
          {
            title: 'Electrical skill badge',
            detail: verify.electrical_badge ? 'Badge active' : 'Not yet applied',
            status: verify.electrical_badge ? 'Active' : 'Take assessment',
            active: !!verify.electrical_badge,
          },
        ])
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
                background: '#f0f2f5',
                color: 'var(--text)',
                border: '1px solid #d4dbe5',
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
                fontSize: 24,
              }}>
                {initials || 'U'}
              </div>
              <div style={{ fontSize: 21, fontWeight: 800, color: '#273646', marginBottom: 2, fontFamily: 'var(--font-head)' }}>{profileName || 'User'}</div>
              <div style={{ color: '#75859a', fontSize: 13, marginBottom: 8 }}>Provider · {profileLocation}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={badgeStyle('#f0f2f5', '#3a4d60')}>✓ Verified</span>
                <span style={badgeStyle('#f0f2f5', '#3a4d60')}>★ Top Rated</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid #e8edf3' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>4.9</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{user?.total_jobs_completed ?? 2}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Jobs done</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>97%</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Completion</div>
                </div>
              </div>
            </div>
            {menuItem('Public Profile', <CircleUserRound size={16} />, true)}
            {menuItem('Edit Profile', <Pencil size={16} />)}
            {menuItem('Verification', <ShieldCheck size={16} />)}
            {menuItem('Notifications', <Bell size={16} />, false, true)}
            {menuItem('Password & Security', <Lock size={16} />)}
            {menuItem('Payment & Payouts', <CreditCard size={16} />)}
            {menuItem('My Stats', <ChartColumn size={16} />)}
            {menuItem('Preferences', <Settings size={16} />)}
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
                  <input className="input-field" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#5b6879', fontWeight: 600 }}>City</span>
                  <select className="input-field" value={form.city} onChange={(e) => updateField('city', e.target.value)}>
                    <option value="Accra">Accra</option>
                    <option value="Kumasi">Kumasi</option>
                    <option value="Takoradi">Takoradi</option>
                    <option value="Tamale">Tamale</option>
                  </select>
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

          <div style={{ ...panelStyle, marginBottom: 14 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #e6ebf2' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#2b3848', fontFamily: 'var(--font-head)' }}>Verification &amp; trust</div>
              <div style={{ marginTop: 2, color: '#7b899a', fontSize: 12 }}>Verified providers win 3x more bids on average</div>
            </div>
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              {verificationRows.map((entry) => (
                <div key={entry.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid #e8edf3', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecf3e4', display: 'grid', placeItems: 'center' }}>
                      <BadgeCheck size={16} color={entry.active ? '#3f7b2c' : '#77879a'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2e3b4a' }}>{entry.title}</div>
                      <div style={{ fontSize: 12, color: '#77879a' }}>{entry.detail}</div>
                    </div>
                  </div>
                  <span style={badgeStyle(entry.active ? '#f0f2f5' : '#f0f2f5', entry.active ? '#2f6d24' : '#77879a')}>{entry.status}</span>
                </div>
              ))}
            </div>
          </div>

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
