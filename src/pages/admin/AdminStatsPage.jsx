import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAllPolls } from '@/services/pollService'
import { getVoteStats, getResults } from '@/services/voteService'
import { formatNumber, percentage } from '@/utils/helpers'
import { InlineLoader } from '@/components/ui/Loader'
import { CountryChart, CityChart, TimelineChart } from '@/components/admin/StatsCharts'
import { Button } from '@/components/ui/Button'
import { exportToCSV, exportToExcel } from '@/utils/export'

function StatBox({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  )
}

export default function AdminStatsPage() {
  const [polls, setPolls] = useState([])
  const [selectedPollId, setSelectedPollId] = useState('')
  const [stats, setStats] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    getAllPolls().then(p => {
      setPolls(p)
      if (p.length > 0) setSelectedPollId(p[0].id)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedPollId) loadStats(selectedPollId)
  }, [selectedPollId])

  async function loadStats(pollId) {
    setStatsLoading(true)
    const [voteStats, pollResults] = await Promise.all([getVoteStats(pollId), getResults(pollId)])
    setStats(voteStats)
    setResults(pollResults)
    setStatsLoading(false)
  }

  function getProcessedResults() {
    return results.map(stage => ({
      title: stage.stageTitle,
      totalVotes: stage.totalVotes || 0,
      cards: Object.entries(stage.cards || {}).map(([id, card]) => ({
        id, title: card.title, votes: card.votes || 0,
        percentage: percentage(card.votes || 0, stage.totalVotes || 0),
      })),
    }))
  }

  function handleExportCSV() {
    const poll = polls.find(p => p.id === selectedPollId)
    exportToCSV(getProcessedResults(), poll?.title || 'poll')
    toast.success('CSV downloaded')
  }

  function handleExportExcel() {
    const poll = polls.find(p => p.id === selectedPollId)
    exportToExcel(getProcessedResults(), stats?.votes || [], poll?.title || 'poll')
    toast.success('Excel downloaded')
  }

  const uniqueUsers = stats?.votes?.length || 0
  const countryCount = stats ? Object.keys(stats.countries).length : 0
  const cityCount = stats ? Object.keys(stats.cities || {}).length : 0
  const stageVoteCounts = results.map(r => ({ title: r.stageTitle, votes: r.totalVotes || 0 }))

  if (loading) return <InlineLoader />

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Statistics</h1>
          <p className="text-text-secondary text-sm mt-1">Detailed analytics by poll</p>
        </div>
        <select value={selectedPollId} onChange={(e) => setSelectedPollId(e.target.value)} className="input-field w-auto">
          {polls.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {polls.length === 0 ? (
        <p className="text-text-muted text-center py-12">No polls to show statistics for</p>
      ) : statsLoading ? <InlineLoader /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatBox label="Total votes" value={formatNumber(stats?.totalVotes || 0)} icon="🗳️" />
            <StatBox label="Unique users" value={formatNumber(uniqueUsers)} icon="👤" />
            <StatBox label="Countries" value={countryCount} icon="🌍" />
            <StatBox label="Cities" value={cityCount} icon="🏙️" />
            <StatBox label="Stages" value={results.length} icon="📋" />
          </div>

          <div className="glass-panel p-6 mb-6">
            <h2 className="font-semibold text-text-primary mb-4">Votes by stage</h2>
            <div className="space-y-3">
              {stageVoteCounts.map((stage, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-3">
                  <span className="text-sm text-text-secondary">{stage.title}</span>
                  <span className="font-semibold text-text-primary">{formatNumber(stage.votes)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-panel p-6">
              <h2 className="font-semibold text-text-primary mb-4">Users by country</h2>
              <CountryChart data={stats?.countries || {}} />
            </div>
            <div className="glass-panel p-6">
              <h2 className="font-semibold text-text-primary mb-4">Users by city</h2>
              <CityChart data={stats?.cities || {}} />
            </div>
          </div>

          <div className="glass-panel p-6 mb-6">
            <h2 className="font-semibold text-text-primary mb-4">Activity over time</h2>
            <TimelineChart data={stats?.timeline || {}} />
          </div>

          <div className="glass-panel p-6">
            <h2 className="font-semibold text-text-primary mb-1">Export results</h2>
            <p className="text-sm text-text-muted mb-4">Download full poll results as CSV or Excel</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleExportCSV}>📄 Export CSV</Button>
              <Button variant="secondary" onClick={handleExportExcel}>📊 Export Excel</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
