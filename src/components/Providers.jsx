'use client'
import { AuthProvider } from '@/context/AuthContext'
import { VendorAuthProvider } from '@/context/VendorAuthContext'
import { CompanyProvider } from '@/context/CompanyContext'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <VendorAuthProvider>
        <CompanyProvider>
          {children}
        </CompanyProvider>
      </VendorAuthProvider>
    </AuthProvider>
  )
}
