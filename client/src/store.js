import { create } from 'zustand'
import { api } from './api'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const { data } = await api.login({ email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token, isAuthenticated: true })
    return data
  },

  register: async (email, password, name, roles) => {
    const { data } = await api.register({ email, password, name, roles })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token, isAuthenticated: true })
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))

export const useJobsStore = create((set, get) => ({
  jobs: [],
  selectedJob: null,
  loading: false,

  fetchJobs: async (params = {}) => {
    set({ loading: true })
    try {
      const { data } = await api.getJobs(params)
      set({ jobs: data.jobs, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  fetchJob: async (id, options = {}) => {
    const { silent = false } = options
    if (!silent) {
      set({ loading: true })
    }
    try {
      const { data } = await api.getJob(id)
      set((state) => ({ selectedJob: data, loading: silent ? state.loading : false }))
      return data
    } catch (error) {
      if (!silent) {
        set({ loading: false })
      }
      throw error
    }
  },

  createJob: async (jobData) => {
    const { data } = await api.createJob(jobData)
    set((state) => ({ jobs: [data, ...state.jobs] }))
    return data
  },

  closeJob: async (jobId, bidId) => {
    const { data } = await api.closeJob(jobId, { bid_id: bidId })
    set((state) => ({
      jobs: state.jobs.map((j) => (j._id === jobId ? data.job : j)),
      selectedJob: data.job,
    }))
    return data
  },
}))

export const useBidsStore = create((set) => ({
  myBids: [],
  jobBids: [],
  loading: false,

  fetchMyBids: async () => {
    set({ loading: true })
    try {
      const { data } = await api.getMyBids()
      set({ myBids: data, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  submitBid: async (bidData) => {
    const { data } = await api.submitBid(bidData)
    set((state) => ({ myBids: [...state.myBids, data] }))
    return data
  },
}))

export const useAnalyticsStore = create((set) => ({
  marketStats: null,
  categoryStats: null,
  loading: false,

  fetchMarketAnalytics: async () => {
    set({ loading: true })
    try {
      const { data } = await api.getMarketAnalytics()
      set({ marketStats: data, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  fetchCategoryAnalytics: async () => {
    set({ loading: true })
    try {
      const { data } = await api.getCategoryAnalytics()
      set({ categoryStats: data, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
}))

const DEFAULT_PREFERENCES = {
  theme: localStorage.getItem('pref_theme') || 'light',
  requestOrderMode: localStorage.getItem('pref_request_order') || 'mine-first',
  marketViewMode: localStorage.getItem('pref_market_view') || 'list',
  activeRole: localStorage.getItem('pref_active_role') || 'buyer',
}

export const usePreferencesStore = create((set) => ({
  theme: DEFAULT_PREFERENCES.theme,
  requestOrderMode: DEFAULT_PREFERENCES.requestOrderMode,
  marketViewMode: DEFAULT_PREFERENCES.marketViewMode,
  activeRole: DEFAULT_PREFERENCES.activeRole,

  setTheme: (theme) => {
    localStorage.setItem('pref_theme', theme)
    set({ theme })
  },

  setRequestOrderMode: (requestOrderMode) => {
    localStorage.setItem('pref_request_order', requestOrderMode)
    set({ requestOrderMode })
  },

  setMarketViewMode: (marketViewMode) => {
    localStorage.setItem('pref_market_view', marketViewMode)
    set({ marketViewMode })
  },

  setActiveRole: (activeRole) => {
    localStorage.setItem('pref_active_role', activeRole)
    set({ activeRole })
  },
}))

const parseDate = (value) => {
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

const toEventTime = (candidate, fallback) => {
  const date = parseDate(candidate) || parseDate(fallback) || new Date()
  return date.toISOString()
}

const buildNotifications = ({ myBids, jobs, userId }) => {
  const events = []

  myBids.forEach((bid) => {
    const bidId = String(bid._id)
    const jobId = bid.job_id?._id || bid.job_id
    const title = bid.job_id?.title || 'Request'
    const bidAmount = Number(bid.amount || 0).toLocaleString()

    if (bid.status === 'accepted') {
      events.push({
        id: `bid-accepted-${bidId}`,
        type: 'won',
        title: `You won: ${title}`,
        detail: `Your bid of GH¢ ${bidAmount} was accepted.`,
        timestamp: toEventTime(bid.accepted_date || bid.updatedAt, bid.createdAt),
        jobId: jobId ? String(jobId) : null,
      })
    }

    if (bid.status === 'rejected') {
      events.push({
        id: `bid-rejected-${bidId}`,
        type: 'lost',
        title: `Bid not selected: ${title}`,
        detail: `Your bid of GH¢ ${bidAmount} was not chosen for this request.`,
        timestamp: toEventTime(bid.updatedAt, bid.createdAt),
        jobId: jobId ? String(jobId) : null,
      })
    }

    if (bid.status === 'accepted' && bid.job_id?.escrow_released) {
      events.push({
        id: `escrow-seller-${bidId}`,
        type: 'escrow',
        title: `Escrow released: ${title}`,
        detail: 'The buyer payment was confirmed and escrow has been released.',
        timestamp: toEventTime(bid.updatedAt, bid.createdAt),
        jobId: jobId ? String(jobId) : null,
      })
    }

    // Workflow stage notifications for seller
    const stage = bid.job_id?.workflow_stage
    if (bid.status === 'accepted' && stage) {
      if (stage === 'contract') {
        events.push({
          id: `wf-contract-seller-${bidId}`,
          type: 'workflow',
          title: `Contract ready: ${title}`,
          detail: 'Review and confirm the contract terms to proceed.',
          timestamp: toEventTime(bid.job_id?.updatedAt, bid.createdAt),
          jobId: jobId ? String(jobId) : null,
        })
      }
      if (stage === 'escrow' || stage === 'in_progress') {
        events.push({
          id: `wf-escrow-seller-${bidId}`,
          type: 'workflow',
          title: `Contract confirmed: ${title}`,
          detail: 'Contract is confirmed. Waiting for the client to deposit escrow before work begins.',
          timestamp: toEventTime(bid.job_id?.updatedAt, bid.createdAt),
          jobId: jobId ? String(jobId) : null,
        })
      }
      if (stage === 'in_progress') {
        events.push({
          id: `wf-inprogress-seller-${bidId}`,
          type: 'workflow',
          title: `Escrow funded: ${title}`,
          detail: 'The client has deposited escrow. You can now start work.',
          timestamp: toEventTime(bid.job_id?.updatedAt, bid.createdAt),
          jobId: jobId ? String(jobId) : null,
        })
      }
      if (stage === 'review') {
        events.push({
          id: `wf-review-seller-${bidId}`,
          type: 'workflow',
          title: `Awaiting review: ${title}`,
          detail: 'Your work has been submitted and is awaiting buyer review.',
          timestamp: toEventTime(bid.job_id?.updatedAt, bid.createdAt),
          jobId: jobId ? String(jobId) : null,
        })
      }
      if (stage === 'completed') {
        events.push({
          id: `wf-done-seller-${bidId}`,
          type: 'workflow',
          title: `Work approved: ${title}`,
          detail: 'The buyer approved your work. Payment will be released.',
          timestamp: toEventTime(bid.job_id?.updatedAt, bid.createdAt),
          jobId: jobId ? String(jobId) : null,
        })
      }
      if (bid.job_id?.dispute_raised) {
        events.push({
          id: `wf-dispute-seller-${bidId}`,
          type: 'dispute',
          title: `Dispute raised: ${title}`,
          detail: 'A dispute has been opened on this job. Please check the job for details.',
          timestamp: toEventTime(bid.job_id?.dispute_raised_at || bid.job_id?.updatedAt, bid.createdAt),
          jobId: jobId ? String(jobId) : null,
        })
      }
    }
  })

  jobs
    .filter((job) => String(job.owner_id?._id || job.owner_id) === String(userId) && job.escrow_released)
    .forEach((job) => {
      events.push({
        id: `escrow-buyer-${job._id}`,
        type: 'escrow',
        title: `Escrow released: ${job.title}`,
        detail: 'Payment has been confirmed and funds were released for this request.',
        timestamp: toEventTime(job.updatedAt, job.createdAt),
        jobId: String(job._id),
      })
    })

  // Buyer workflow notifications
  jobs
    .filter((job) => String(job.owner_id?._id || job.owner_id) === String(userId) && job.winning_bid_id)
    .forEach((job) => {
      const stage = job.workflow_stage
      const jid = String(job._id)
      if (stage === 'escrow') {
        events.push({
          id: `wf-escrow-buyer-${jid}`,
          type: 'workflow',
          title: `Contract confirmed: ${job.title}`,
          detail: 'Both parties confirmed the contract. Please deposit escrow to start work.',
          timestamp: toEventTime(job.updatedAt, job.createdAt),
          jobId: jid,
        })
      }
      if (stage === 'in_progress') {
        events.push({
          id: `wf-inprogress-buyer-${jid}`,
          type: 'workflow',
          title: `Escrow funded. Work started: ${job.title}`,
          detail: 'Escrow was deposited and the provider has started work.',
          timestamp: toEventTime(job.updatedAt, job.createdAt),
          jobId: jid,
        })
      }
      if (stage === 'review') {
        events.push({
          id: `wf-review-buyer-${jid}`,
          type: 'workflow',
          title: `Work submitted: ${job.title}`,
          detail: 'The provider submitted their work. Please review and approve.',
          timestamp: toEventTime(job.updatedAt, job.createdAt),
          jobId: jid,
        })
      }
      if (stage === 'completed') {
        events.push({
          id: `wf-done-buyer-${jid}`,
          type: 'workflow',
          title: `Completed: ${job.title}`,
          detail: 'Work approved. Escrow has been released to the provider.',
          timestamp: toEventTime(job.updatedAt, job.createdAt),
          jobId: jid,
        })
      }
      if (job.dispute_raised) {
        events.push({
          id: `wf-dispute-buyer-${jid}`,
          type: 'dispute',
          title: `Dispute raised: ${job.title}`,
          detail: 'A dispute has been opened on this job. Please check the job for details.',
          timestamp: toEventTime(job.dispute_raised_at || job.updatedAt, job.createdAt),
          jobId: jid,
        })
      }
    })

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const readKey = (userId) => `notif_read_${userId}`

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  readIds: [],
  unreadCount: 0,
  loading: false,

  refreshNotifications: async (user) => {
    const userId = user?._id || user?.id
    if (!userId) {
      set({ notifications: [], unreadCount: 0, loading: false })
      return
    }

    set({ loading: true })
    try {
      const [bidsRes, closedRes, completedRes] = await Promise.all([
        api.getMyBids(),
        api.getJobs({ status: 'closed', limit: 100 }),
        api.getJobs({ status: 'completed', limit: 100 }),
      ])

      const notifications = buildNotifications({
        myBids: bidsRes.data,
        jobs: [...closedRes.data.jobs, ...completedRes.data.jobs],
        userId,
      })

      const savedReadIds = JSON.parse(localStorage.getItem(readKey(userId)) || '[]')
      const unreadCount = notifications.filter((item) => !savedReadIds.includes(item.id)).length
      set({ notifications, readIds: savedReadIds, unreadCount, loading: false })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  markRead: (notificationId, user) => {
    const userId = user?._id || user?.id
    if (!userId) return

    const { readIds, notifications } = get()
    if (readIds.includes(notificationId)) return

    const nextReadIds = [...readIds, notificationId]
    localStorage.setItem(readKey(userId), JSON.stringify(nextReadIds))
    const unreadCount = notifications.filter((item) => !nextReadIds.includes(item.id)).length
    set({ readIds: nextReadIds, unreadCount })
  },

  markUnread: (notificationId, user) => {
    const userId = user?._id || user?.id
    if (!userId) return

    const { readIds, notifications } = get()
    if (!readIds.includes(notificationId)) return

    const nextReadIds = readIds.filter((id) => id !== notificationId)
    localStorage.setItem(readKey(userId), JSON.stringify(nextReadIds))
    const unreadCount = notifications.filter((item) => !nextReadIds.includes(item.id)).length
    set({ readIds: nextReadIds, unreadCount })
  },

  markAllRead: (user) => {
    const userId = user?._id || user?.id
    if (!userId) return

    const ids = get().notifications.map((item) => item.id)
    localStorage.setItem(readKey(userId), JSON.stringify(ids))
    set({ readIds: ids, unreadCount: 0 })
  },
}))
