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

  fetchJob: async (id) => {
    set({ loading: true })
    try {
      const { data } = await api.getJob(id)
      set({ selectedJob: data, loading: false })
      return data
    } catch (error) {
      set({ loading: false })
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
}

export const usePreferencesStore = create((set) => ({
  theme: DEFAULT_PREFERENCES.theme,
  requestOrderMode: DEFAULT_PREFERENCES.requestOrderMode,

  setTheme: (theme) => {
    localStorage.setItem('pref_theme', theme)
    set({ theme })
  },

  setRequestOrderMode: (requestOrderMode) => {
    localStorage.setItem('pref_request_order', requestOrderMode)
    set({ requestOrderMode })
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
        detail: `Your bid of $${bidAmount} was accepted.`,
        timestamp: toEventTime(bid.accepted_date || bid.updatedAt, bid.createdAt),
        jobId: jobId ? String(jobId) : null,
      })
    }

    if (bid.status === 'rejected') {
      events.push({
        id: `bid-rejected-${bidId}`,
        type: 'lost',
        title: `Bid not selected: ${title}`,
        detail: `Your bid of $${bidAmount} was not chosen for this request.`,
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
