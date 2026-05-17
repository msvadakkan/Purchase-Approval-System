'use client'
import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config
  const isVendor = window.location.pathname.startsWith('/vendor')
  const token = isVendor
    ? localStorage.getItem('vendorToken')
    : localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (typeof window !== 'undefined' && err.response?.status === 401) {
      const isVendor = window.location.pathname.startsWith('/vendor')
      if (isVendor) {
        localStorage.removeItem('vendorToken')
        localStorage.removeItem('vendor')
        window.location.href = '/vendor/login'
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
