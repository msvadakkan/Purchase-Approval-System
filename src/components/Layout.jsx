'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, ClipboardList, CheckCircle2,
  Store, Settings, LogOut, Building2, ChevronRight,
  Menu, X, FileOutput, ChevronDown, Plus,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCompany } from '@/context/CompanyContext'

const ROLE_LABELS = {
  admin: 'Administrator', ceo: 'CEO',
  department_head: 'Department Head', manager: 'Manager', employee: 'Employee',
}
const APPROVER_ROLES = ['admin', 'ceo', 'department_head', 'manager']

function UserAvatar({ name }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function CompanySwitcher({ onNavigate }) {
  const { companies, activeCompany, setActiveCompany } = useCompany()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!companies.length) return null

  return (
    <div ref={ref} className="relative px-3 mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-indigo-800/50 hover:bg-indigo-800/80 rounded-xl transition-colors text-left"
      >
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{activeCompany?.name ?? 'Select company'}</p>
          <p className="text-indigo-400 text-[10px]">Active company</p>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-indigo-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-indigo-950 border border-indigo-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {companies.map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveCompany(c); setOpen(false) }}
              className={`w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                activeCompany?.id === c.id
                  ? 'bg-indigo-700 text-white font-semibold'
                  : 'text-indigo-200 hover:bg-indigo-800'
              }`}
            >
              <div className="w-6 h-6 bg-indigo-600/50 rounded flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3 h-3" />
              </div>
              <span className="truncate">{c.name}</span>
            </button>
          ))}
          <div className="border-t border-indigo-800 p-1.5">
            <button
              onClick={() => { setOpen(false); router.push('/companies/new'); if (onNavigate) onNavigate() }}
              className="w-full flex items-center gap-2 px-3 py-2 text-teal-400 hover:text-teal-300 text-xs font-semibold rounded-lg hover:bg-indigo-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Company
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); router.push('/login') }
  const closeSidebar = () => setSidebarOpen(false)

  const navItems = [
    { href: '/dashboard',    label: 'Dashboard',         Icon: LayoutDashboard },
    { href: '/requests',     label: 'Purchase Requests', Icon: FileText },
    { href: '/requirements', label: 'Requirements',      Icon: ClipboardList },
    { href: '/lpos',         label: 'LPO',               Icon: FileOutput },
    ...(APPROVER_ROLES.includes(user?.role)
      ? [{ href: '/approvals', label: 'Pending Approvals', Icon: CheckCircle2 }]
      : []),
    ...(user?.role === 'admin'
      ? [
          { href: '/companies', label: 'Companies',   Icon: Building2 },
          { href: '/vendors',   label: 'Vendors',     Icon: Store },
          { href: '/admin',     label: 'Admin Panel', Icon: Settings },
        ]
      : []),
  ]

  const SidebarContent = () => (
    <aside className="w-64 bg-gradient-to-b from-indigo-950 to-indigo-900 text-white flex flex-col h-full shadow-xl">
      <div className="px-5 py-5 border-b border-indigo-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight tracking-wide">Purchase Approval</h1>
            <p className="text-indigo-400 text-[11px]">Management System</p>
          </div>
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-1 text-indigo-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-3">
        <CompanySwitcher onNavigate={closeSidebar} />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">Navigation</p>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-300 hover:bg-indigo-800/60 hover:text-white'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                isActive ? 'bg-indigo-500' : 'bg-indigo-800/50 group-hover:bg-indigo-700/60'
              }`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-indigo-800/60">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
          <UserAvatar name={user?.name} />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate leading-tight">{user?.name}</p>
            <p className="text-indigo-400 text-[11px] truncate">{ROLE_LABELS[user?.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-indigo-300 hover:text-white hover:bg-indigo-800/60 rounded-xl text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <SidebarContent />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeSidebar} />
          <div className="relative z-10 flex flex-shrink-0">
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-indigo-900 text-white flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-indigo-800 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-300" />
            <span className="text-sm font-bold">Purchase Approval</span>
          </div>
          <UserAvatar name={user?.name} />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
