import { Link } from 'react-router-dom'
import { SITE_CONFIG } from '@/data/siteConfig'

export function SiteHeader() {
  return (
    <header className="relative z-10 px-4 sm:px-6 pt-6">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-3 group">
          {SITE_CONFIG.logoUrl ? (
            <img src={SITE_CONFIG.logoUrl} alt={SITE_CONFIG.siteName}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)', boxShadow: '0 4px 16px rgba(108,99,255,0.4)' }}>
              {SITE_CONFIG.siteName?.[0]?.toUpperCase() || 'V'}
            </div>
          )}
          <span className="font-bold text-text-primary text-lg tracking-tight">{SITE_CONFIG.siteName}</span>
        </Link>
      </div>
    </header>
  )
}
