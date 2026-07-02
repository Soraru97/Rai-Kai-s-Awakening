import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface bg-mesh relative flex flex-col">
      <div className="noise-overlay" />
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-1/3 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>
      <SiteHeader />
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
        className="relative z-10 flex-1 flex flex-col">
        <Outlet />
      </motion.main>
      <SiteFooter />
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#181c27', color: '#e8eaf2', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#181c27' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#181c27' } },
      }} />
    </div>
  )
}
