import { Expense, JobApplication } from '@/types'

function today() {
  return new Date().toISOString().slice(0, 10)
}

function downloadCSV(rows: string[][], filename: string) {
  const content = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function exportExpensesCSV(expenses: Expense[]) {
  const rows: string[][] = [
    ['Date', 'Category', 'Amount', 'Currency', 'Amount USD', 'Note'],
    ...expenses.map((e) => [
      e.date,
      e.category,
      String(e.amount),
      e.currency,
      String(e.amount_usd),
      e.note ?? '',
    ]),
  ]
  downloadCSV(rows, `expenses-${today()}.csv`)
}

export function exportJobsCSV(jobs: JobApplication[]) {
  const rows: string[][] = [
    ['Company', 'Position', 'Status', 'Salary Min', 'Salary Max', 'Currency', 'Applied Date', 'Notes'],
    ...jobs.map((j) => [
      j.company,
      j.position,
      j.status,
      j.salary_min != null ? String(j.salary_min) : '',
      j.salary_max != null ? String(j.salary_max) : '',
      j.salary_currency,
      j.applied_date,
      j.notes ?? '',
    ]),
  ]
  downloadCSV(rows, `job-applications-${today()}.csv`)
}
