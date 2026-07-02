import { SITE_CONFIG } from '@/data/siteConfig'

export function SiteFooter() {
  const year = new Date().getFullYear()
  const copyright = SITE_CONFIG.copyrightText.replace('{year}', year)

  return (
    <footer className="relative z-10 px-4 sm:px-6 py-8 mt-auto">
      <div className="max-w-6xl mx-auto border-t border-border pt-6 flex flex-col items-center text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5">
            {SITE_CONFIG.logoUrl ? (
              <img src={SITE_CONFIG.logoUrl} alt={SITE_CONFIG.siteName} className="w-6 h-6 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)' }}>
                {SITE_CONFIG.siteName?.[0]?.toUpperCase() || 'V'}
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-text-secondary">{SITE_CONFIG.siteName}</p>
              {SITE_CONFIG.tagline && <p className="text-xs text-text-muted">{SITE_CONFIG.tagline}</p>}
            </div>
          </div>

          {SITE_CONFIG.socialLinks?.length > 0 && (
            <div className="flex items-center gap-4">
              {SITE_CONFIG.socialLinks.map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-text-muted hover:text-accent transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {SITE_CONFIG.ageRestriction && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-xs font-bold text-text-muted flex-shrink-0">
              {SITE_CONFIG.ageRestriction}
            </div>
          )}
        </div>
        <p className="text-xs text-text-muted mt-4">{copyright}</p>
      </div>
    </footer>
  )
}
