'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

const VendorAuthContext = createContext(null)

export function VendorAuthProvider({ children }) {
  const [vendor, setVendor]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('vendor')
    const token  = localStorage.getItem('vendorToken')
    if (stored && token) setVendor(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/vendors/login', { email, password })
    localStorage.setItem('vendorToken', data.token)
    localStorage.setItem('vendor', JSON.stringify(data.vendor))
    setVendor(data.vendor)
    return data.vendor
  }

  const logout = () => {
    localStorage.removeItem('vendorToken')
    localStorage.removeItem('vendor')
    setVendor(null)
  }

  return (
    <VendorAuthContext.Provider value={{ vendor, login, logout, loading }}>
      {children}
    </VendorAuthContext.Provider>
  )
}

export const useVendorAuth = () => useContext(VendorAuthContext)
