'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVendorAuth } from '@/context/VendorAuthContext'
import VendorLayout from '@/components/VendorLayout'

export default function VendorAppLayout({ children }) {
  const { vendor, loading } = useVendorAuth()
  const router = useRouter()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''

  useEffect(() => {
    if (!loading && !vendor) {
      if (pathname !== '/vendor/login' && pathname !== '/vendor/register')
        router.replace('/vendor/login')
    }
  }, [vendor, loading])

  if (pathname === '/vendor/login' || pathname === '/vendor/register') {
    return <>{children}</>
  }

  if (loading || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <VendorLayout>{children}</VendorLayout>
}
