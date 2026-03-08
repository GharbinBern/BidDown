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
