import * as XLSX from 'xlsx'

/**
 * Export poll results to CSV
 * @param {Object} resultsData - Results data by stage
 * @param {string} pollTitle
 */
export function exportToCSV(resultsData, pollTitle) {
  const rows = []

  rows.push(['Голосование', pollTitle])
  rows.push(['Экспорт', new Date().toLocaleString('ru-RU')])
  rows.push([])

  for (const stage of resultsData) {
    rows.push([`Этап: ${stage.title}`])
    rows.push(['Карточка', 'Голосов', 'Процент', 'Место'])

    const sorted = [...stage.cards].sort((a, b) => b.votes - a.votes)
    sorted.forEach((card, idx) => {
      rows.push([card.title, card.votes, `${card.percentage}%`, idx + 1])
    })

    rows.push(['Итого голосов', stage.totalVotes])
    rows.push([])
  }

  const csvContent = rows.map(row =>
    row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `votebox-${slugify(pollTitle)}-results.csv`)
}

/**
 * Export poll results to Excel (.xlsx)
 * @param {Array} resultsData
 * @param {Array} votesData - Raw votes for per-voter sheet
 * @param {string} pollTitle
 */
export function exportToExcel(resultsData, votesData, pollTitle) {
  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary results per stage
  for (const stage of resultsData) {
    const sheetData = [
      ['Карточка', 'Голосов', 'Процент', 'Место'],
      ...([...stage.cards]
        .sort((a, b) => b.votes - a.votes)
        .map((card, idx) => [card.title, card.votes, `${card.percentage}%`, idx + 1])),
      [],
      ['Итого', stage.totalVotes],
    ]
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    ws['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 8 }]
    XLSX.utils.book_append_sheet(wb, ws, stage.title.slice(0, 31))
  }

  // Sheet 2: Raw votes
  if (votesData?.length) {
    const headers = ['Дата', 'Страна', 'Город', 'Регион', 'ID браузера (хэш)']
    const stageIds = Object.keys(votesData[0]?.stages || {})
    headers.push(...stageIds.map(id => `Этап ${id}`))

    const rows = votesData.map(vote => {
      const row = [
        vote.createdAt ? new Date(vote.createdAt.seconds * 1000).toLocaleString('ru-RU') : '',
        vote.country || '',
        vote.city || '',
        vote.region || '',
        vote.browserId?.slice(0, 12) + '...' || '',
      ]
      stageIds.forEach(id => {
        row.push((vote.stages?.[id] || []).join(', '))
      })
      return row
    })

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, ...stageIds.map(() => ({ wch: 25 }))]
    XLSX.utils.book_append_sheet(wb, ws, 'Детали голосов')
  }

  XLSX.writeFile(wb, `votebox-${slugify(pollTitle)}-results.xlsx`)
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
}
