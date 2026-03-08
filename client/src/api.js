import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  getMe: () => client.get('/auth/me'),

  // Jobs
  getJobs: (params) => client.get('/jobs', { params }),
  getJob: (id) => client.get(`/jobs/${id}`),
  createJob: (data) => client.post('/jobs', data),
  updateJob: (id, data) => client.put(`/jobs/${id}`, data),
  deleteJob: (id) => client.delete(`/jobs/${id}`),
  closeJob: (id, data) => client.post(`/jobs/${id}/close`, data),

  // Bids
  submitBid: (data) => client.post('/bids', data),
  getMyBids: () => client.get('/bids/my-bids'),
  getJobBids: (jobId) => client.get(`/bids/job/${jobId}`),
  withdrawBid: (id) => client.post(`/bids/${id}/withdraw`),

  // Reviews
  createReview: (data) => client.post('/reviews', data),
  getSellerReviews: (sellerId) => client.get(`/reviews/seller/${sellerId}`),
  getJobReview: (jobId) => client.get(`/reviews/job/${jobId}`),

  // Analytics
  getMarketAnalytics: () => client.get('/analytics/market'),
  getCategoryAnalytics: () => client.get('/analytics/categories'),
  getBidAnalytics: () => client.get('/analytics/bids'),

  // Payments
  createPaymentIntent: (data) => client.post('/payments/create-intent', data),
  confirmPayment: (data) => client.post('/payments/confirm', data),
}

export default client
