'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingBag, ClipboardList, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useVendorAuth } from '@/context/VendorAuthContext'

export default function VendorLayout({ children }) {
  const { vendor, logout } = useVendorAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { logout(); router.push('/vendor/login') }

  const navItems = [
    { href: '/vendor/dashboard', label: 'Dashboard',    Icon: LayoutDashboard },
    { href: '/vendor/tenders',   label: 'Open Tenders', Icon: ClipboardList },
  ]

  const NavLinks = () => (
    <>
      {navItems.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link key={href} href={href} onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-teal-600 text-white' : 'text-teal-200 hover:bg-teal-800/60 hover:text-white'
            }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-gradient-to-b from-teal-950 to-teal-900 text-white flex-col shadow-xl">
        <div className="px-5 py-5 border-b border-teal-800/60 flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Vendor Portal</h1>
            <p className="text-teal-400 text-[11px]">{vendor?.company_name}</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-teal-800/60">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-teal-300 hover:text-white hover:bg-teal-800/60 rounded-xl text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative z-10 w-60 bg-gradient-to-b from-teal-950 to-teal-900 text-white flex flex-col shadow-xl">
            <div className="px-5 py-5 border-b border-teal-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-teal-300" />
                <span className="text-sm font-bold">Vendor Portal</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-teal-400"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1"><NavLinks /></nav>
            <div className="px-3 py-4 border-t border-teal-800/60">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-teal-300 hover:text-white hover:bg-teal-800/60 rounded-xl text-sm">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-teal-900 text-white flex-shrink-0">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-teal-800">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold">Vendor Portal</span>
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold">
            {vendor?.company_name?.[0] ?? 'V'}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
