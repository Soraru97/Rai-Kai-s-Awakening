import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getGlobalSettings, updateGlobalSettings, getAllPolls } from '@/services/pollService'
import { Toggle } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { InlineLoader } from '@/components/ui/Loader'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState(null)
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getGlobalSettings(), getAllPolls()]).then(([s, p]) => {
      setSettings(s); setPolls(p); setLoading(false)
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await updateGlobalSettings({
        activePollId: settings.activePollId || null,
        maintenanceMode: settings.maintenanceMode || false,
      })
      toast.success('Settings saved')
    } catch { toast.error('Save error') } finally { setSaving(false) }
  }

  if (loading) return <InlineLoader />

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">Global platform settings</p>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel-lg p-6">
          <h2 className="font-semibold text-text-primary mb-4">Admin account</h2>
          <div className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user?.email}</p>
              <p className="text-xs text-text-muted">Full access to admin panel</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel-lg p-6">
          <h2 className="font-semibold text-text-primary mb-1">Active poll</h2>
          <p className="text-sm text-text-muted mb-4">Which poll is shown on the main page</p>
          <select value={settings?.activePollId || ''} onChange={(e) => setSettings(prev => ({ ...prev, activePollId: e.target.value }))}
            className="input-field">
            <option value="">— Not selected —</option>
            {polls.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel-lg p-6">
          <h2 className="font-semibold text-text-primary mb-1">Maintenance mode</h2>
          <p className="text-sm text-text-muted mb-4">Temporarily disable voting for all users</p>
          <Toggle checked={settings?.maintenanceMode || false}
            onChange={(v) => setSettings(prev => ({ ...prev, maintenanceMode: v }))}
            label="Enable maintenance mode" />
        </motion.div>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>Save settings</Button>
        </div>
      </div>
    </div>
  )
}
