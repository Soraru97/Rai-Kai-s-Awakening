import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/services/authService'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SITE_CONFIG } from '@/data/siteConfig'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/admin', label: 'Обзор', icon: '📊', end: true },
  { to: '/admin/polls', label: 'Голосования', icon: '🗳️' },
  { to: '/admin/stats', label: 'Статистика', icon: '📈' },
  { to: '/admin/settings', label: 'Настройки', icon: '⚙️' },
]

export function AdminLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/admin/login')
    } catch {
      toast.error('Ошибка выхода')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col fixed h-screen z-20 bg-surface-1">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {SITE_CONFIG.logoUrl ? (
              <img
                src={SITE_CONFIG.logoUrl}
                alt={SITE_CONFIG.siteName}
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {SITE_CONFIG.siteName?.[0]?.toUpperCase() || 'V'}
              </div>
            )}
            <div>
              <p className="font-bold text-text-primary text-sm">{SITE_CONFIG.siteName}</p>
              <p className="text-xs text-text-muted">Панель управления</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/15 text-accent border border-accent/25'
                    : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user?.email}</p>
              <p className="text-xs text-text-muted">Администратор</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        <motion.main
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>

        <SiteFooter />
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#181c27',
            color: '#e8eaf2',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  )
}
