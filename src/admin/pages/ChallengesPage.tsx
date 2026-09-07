import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPagination } from '../components/AdminLayout'
import { adminDeleteChallenge, adminGetChallenges, adminSetChallengeStatus, type AdminChallengesResponse } from '../../services/api'

const initial: AdminChallengesResponse = {
  summary: { total: 0, drafts: 0, published: 0 },
  challenges: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
}

const monthFmt = (value: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value))

const statusClass = (status: string) =>
  status === 'PUBLISHED'
    ? 'border-[rgba(23,57,47,0.18)] bg-[rgba(23,57,47,0.1)] text-[#17392f]'
    : 'border-[rgba(119,109,98,0.16)] bg-[rgba(119,109,98,0.1)] text-[#6d6258]'

export function ChallengesPage() {
  const [data, setData] = useState(initial)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await adminGetChallenges({ search, status, month, year, page, pageSize: 10 }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load challenges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 160)
    return () => clearTimeout(timer)
  }, [search, status, month, year, page])

  useEffect(() => setPage(1), [search, status, month, year])

  async function toggle(id: string, current: string) {
    try {
      await adminSetChallengeStatus(id, current === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update challenge')
    }
  }

  async function remove() {
    if (!deleteId) return
    try {
      await adminDeleteChallenge(deleteId)
      setDeleteId(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to delete challenge')
    }
  }

  return (
    <main className="min-w-0 px-8 py-7 pb-[42px] max-[760px]:px-[18px]">
      <div className="mx-auto max-w-[1540px]">
        <button type="button" aria-label="Open navigation" className="mb-4 hidden h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-[rgba(57,47,39,0.12)] bg-[#f1ebe2] text-[#17392f] max-[980px]:inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        </button>

        <section className="grid min-w-0 gap-6">
          <header className="rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-8 py-7 shadow-[0_18px_40px_rgba(47,37,28,0.06)]">
            <span className="mb-2 inline-block text-[0.74rem] uppercase tracking-[0.18em] text-[#776d62]">Admin Panel</span>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <h1 className="m-0 font-serif text-[clamp(3rem,5vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-[#2f2a25]">Challenges</h1>
                <p className="mt-3 max-w-[760px] text-[1rem] leading-7 text-[#776d62]">Plan, publish, and maintain monthly challenge notes for subscribers, along with reminder schedules and release actions.</p>
              </div>
              <Link className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#17392f] px-6 text-sm font-bold text-[#f7f4ef] shadow-[0_14px_28px_rgba(23,57,47,0.16)] transition hover:-translate-y-px" to="/admin/challenges/create">Create Challenge</Link>
            </div>
          </header>

          <section className="relative rounded-[30px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-6 shadow-[0_18px_40px_rgba(47,37,28,0.06)] max-[720px]:p-[18px]" aria-labelledby="challenges-table-title">
            <div className="mb-[18px] flex items-start justify-between gap-[18px]">
              <div>
                <span className="mb-2 inline-block text-[0.74rem] uppercase tracking-[0.18em] text-[#776d62]">Monthly</span>
                <h2 id="challenges-table-title" className="m-0 font-serif text-[2rem] font-semibold leading-[0.98] tracking-[-0.02em]">Challenges Management</h2>
                <p className="mt-2 max-w-[700px] text-[0.95rem] text-[#776d62]">Browse and manage monthly challenges with status, date windows, and completion tracking.</p>
              </div>
            </div>

            <section className="mb-5 flex items-center justify-between gap-4 rounded-[26px] border border-[rgba(57,47,39,0.12)] bg-[linear-gradient(180deg,rgba(249,245,239,0.88),rgba(252,250,247,0.95))] p-5 max-[980px]:flex-wrap max-[720px]:p-[18px]" aria-label="Challenges filters">
              <div className="flex min-w-0 flex-1 items-center gap-3 max-[980px]:flex-wrap">
                <div className="relative mx-auto w-full max-w-3xl flex-1 max-w-none min-w-36">
                  <svg aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 text-[#17392f]" style={{ display: 'block', opacity: 1 }} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search challenges" className="relative z-10 min-h-[52px] w-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] py-0 pr-[18px] text-[#2f2a25] outline-none transition placeholder:text-[#8c8175] focus:border-[rgba(23,57,47,0.26)] focus:bg-[#fffdfa] focus:ring-4 focus:ring-[rgba(23,57,47,0.06)]" style={{ borderRadius: '3.40282e38px', paddingLeft: '56px' }} type="search" />
                </div>

                <label className="relative">
                  <span className="sr-only">Filter by status</span>
                  <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status" className="min-h-[52px] min-w-[190px] appearance-none border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 pr-12 text-[#2f2a25] outline-none transition focus:border-[rgba(23,57,47,0.26)] focus:bg-[#fffdfa] focus:ring-4 focus:ring-[rgba(23,57,47,0.06)] max-[980px]:flex-1 max-[980px]:min-w-0" style={{ borderRadius: '3.40282e38px' }}>
                    <option value="">Challenge Status</option><option value="DRAFT">Draft</option><option value="SCHEDULED">Scheduled</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option><option value="DELETED">Deleted</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#776d62]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>
                </label>

                <label className="relative">
                  <span className="sr-only">Filter by month</span>
                  <select value={month} onChange={e => setMonth(e.target.value)} aria-label="Filter by month" className="min-h-[52px] min-w-[190px] appearance-none border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 pr-12 text-[#2f2a25] outline-none transition focus:border-[rgba(23,57,47,0.26)] focus:bg-[#fffdfa] focus:ring-4 focus:ring-[rgba(23,57,47,0.06)] max-[980px]:flex-1 max-[980px]:min-w-0" style={{ borderRadius: '3.40282e38px' }}>
                    <option value="">Challenge Month</option>
                    {Array.from({ length: 12 }, (_, i) => <option key={i} value={String(i + 1)}>{new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2026, i, 1))}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#776d62]"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>
                </label>

                <div className="max-w-[120px] min-w-[80px] flex-1"><input value={year} onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="Year" className="min-h-[52px] w-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 text-[#2f2a25] outline-none transition focus:border-[rgba(23,57,47,0.26)] focus:bg-[#fffdfa] focus:ring-4 focus:ring-[rgba(23,57,47,0.06)]" style={{ borderRadius: '3.40282e38px', padding:'13px 40px' }} inputMode="numeric" /></div>
              </div>
            </section>

            {error && <div className="mb-5 rounded-[18px] border border-[rgba(125,74,74,0.18)] bg-[rgba(125,74,74,0.08)] px-4 py-3 text-sm text-[#7a4a4a]">{error}</div>}

            {loading ? (
              <section className="mx-auto flex min-h-[280px] max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"><p className="text-[#776d62]">Loading challenges…</p></section>
            ) : data.challenges.length === 0 ? (
              <section className="mx-auto flex min-h-[280px] max-w-2xl flex-1 flex-col items-center justify-center gap-3 text-center">
                <h1 className="m-0 font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em] md:text-5xl">No challenges found</h1>
                <p className="m-0 max-w-[80%] text-sm text-[#776d62] md:text-base">Try a different search, status, or year filter.</p>
              </section>
            ) : (
              <div className="overflow-x-auto rounded-[24px] border border-[rgba(57,47,39,0.12)] bg-[rgba(252,250,247,0.88)] max-[720px]:border-0 max-[720px]:bg-transparent">
                <div className="min-w-[1120px] max-[720px]:hidden">
                  <table className="w-full border-collapse">
                    <thead><tr className="bg-[rgba(241,235,226,0.45)]">
                      {['Challenge','Month','Status','Reminders','Updated','Actions'].map(label => <th key={label} className="border-b border-[rgba(57,47,39,0.12)] px-5 py-[18px] text-left text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]" style={label === 'Actions' ? { minWidth: 330, width: 330 } : undefined}>{label}</th>)}
                    </tr></thead>
                    <tbody>{data.challenges.map((challenge, index) => <tr key={challenge.id} className="transition hover:bg-[rgba(23,57,47,0.028)]">
                      <td className={`${index ? 'border-t border-[rgba(57,47,39,0.08)] ' : ''}px-5 py-[18px] align-middle`}><div className="flex items-center gap-3.5">{challenge.imageUrl ? <img src={challenge.imageUrl} alt="" className="rounded-[16px] border border-[rgba(57,47,39,0.1)]" style={{ width: 82, height: 64, minWidth: 82, maxWidth: 82, objectFit: 'cover', display: 'block', flexShrink: 0 }}/> : <div className="rounded-[16px] border border-[rgba(57,47,39,0.1)] bg-[linear-gradient(135deg,#ece2d5,#d9cdbf)]" style={{ width: 82, height: 64, minWidth: 82, maxWidth: 82, flexShrink: 0 }}/>}<div><strong className="block">{challenge.title}</strong><span className="mt-1 block text-[0.84rem] text-[#776d62]">Monthly subscriber challenge</span></div></div></td>
                      <td className={`${index ? 'border-t border-[rgba(57,47,39,0.08)] ' : ''}px-5 py-[18px] align-middle text-[0.95rem]`}>{monthFmt(challenge.challengeMonth)}</td>
                      <td className={`${index ? 'border-t border-[rgba(57,47,39,0.08)] ' : ''}px-5 py-[18px] align-middle`}><span className={`inline-flex min-h-[34px] items-center rounded-full border px-3 text-[0.84rem] font-bold ${statusClass(challenge.status)}`}>{challenge.status}</span></td>
                      <td className={`${index ? 'border-t border-[rgba(57,47,39,0.08)] ' : ''}px-5 py-[18px] align-middle text-[0.95rem]`}>{challenge.reminders.length} reminder{challenge.reminders.length === 1 ? '' : 's'}</td>
                      <td className={`${index ? 'border-t border-[rgba(57,47,39,0.08)] ' : ''}px-5 py-[18px] align-middle text-[0.95rem]`}>{new Date(challenge.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className={`${index ? 'border-t border-[rgba(57,47,39,0.08)] ' : ''}px-5 py-[18px] align-middle`} style={{ minWidth: 330, width: 330 }}><div className="flex items-center gap-2 whitespace-nowrap"><Link to={`/admin/challenges/${challenge.id}/participants`} title="View participants" className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] px-3 text-xs font-bold text-[#17392f] transition hover:-translate-y-px hover:bg-[#f6f0e8]">Participants</Link><button type="button" title={challenge.status === 'PUBLISHED' ? 'Unpublish challenge' : 'Publish challenge'} onClick={() => toggle(challenge.id, challenge.status)} className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] px-4 text-xs font-bold text-[#17392f] transition hover:-translate-y-px hover:bg-[#f6f0e8]">{challenge.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button><button type="button" aria-label="Delete challenge" title="Delete challenge" onClick={() => setDeleteId(challenge.id)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(125,74,74,0.18)] bg-[rgba(125,74,74,0.06)] text-[#7a4a4a] transition hover:-translate-y-px hover:bg-[rgba(125,74,74,0.1)]"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 18, height: 18, minWidth: 18, maxWidth: 18 }}><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg></button></div></td>
                    </tr>)}</tbody>
                  </table>
                </div>

                <div className="hidden gap-3 max-[720px]:grid">{data.challenges.map(challenge => <article key={challenge.id} className="rounded-[22px] border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] p-4 shadow-[0_10px_22px_rgba(47,37,28,0.04)]"><div className="flex items-start gap-3">{challenge.imageUrl ? <img src={challenge.imageUrl} alt="" className="rounded-[16px]" style={{ width: 92, height: 72, minWidth: 92, maxWidth: 92, objectFit: 'cover', display: 'block', flexShrink: 0 }}/> : <div className="rounded-[16px] bg-[linear-gradient(135deg,#ece2d5,#d9cdbf)]" style={{ width: 92, height: 72, minWidth: 92, maxWidth: 92, flexShrink: 0 }}/>}<div className="min-w-0"><strong className="block truncate">{challenge.title}</strong><span className="mt-1 block text-sm text-[#776d62]">{monthFmt(challenge.challengeMonth)}</span></div></div><div className="mt-4 grid grid-cols-2 gap-3"><div><span className="block text-[0.7rem] uppercase tracking-[0.14em] text-[#776d62]">Status</span><span className={`mt-1 inline-flex min-h-[34px] items-center rounded-full border px-3 text-[0.84rem] font-bold ${statusClass(challenge.status)}`}>{challenge.status}</span></div><div><span className="block text-[0.7rem] uppercase tracking-[0.14em] text-[#776d62]">Reminders</span><span className="mt-2 block text-sm">{challenge.reminders.length}</span></div></div><div className="mt-4 flex flex-wrap gap-2"><Link to={`/admin/challenges/${challenge.id}/participants`} className="min-h-10 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 py-2 text-sm font-semibold text-[#17392f]">Participants</Link><button type="button" onClick={() => toggle(challenge.id, challenge.status)} className="min-h-10 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 text-sm font-semibold text-[#17392f]">{challenge.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button><button type="button" onClick={() => setDeleteId(challenge.id)} className="min-h-10 rounded-full border border-[rgba(125,74,74,0.18)] bg-[rgba(125,74,74,0.06)] px-4 text-sm font-semibold text-[#7a4a4a]">Delete</button></div></article>)}</div>
              </div>
            )}

            <div className="mt-5"><AdminPagination {...data.pagination} onPageChange={setPage} pageSize={10}/></div>
          </section>
        </section>
      </div>

      {deleteId && <div className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(30,24,20,0.42)] p-5" role="dialog" aria-modal="true"><div className="w-full max-w-[460px] rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-6 shadow-[0_28px_80px_rgba(47,37,28,0.2)]"><span className="mb-2 inline-block text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#aa7f38]">Confirm deletion</span><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none">Delete challenge?</h2><p className="mt-3 text-[0.95rem] leading-6 text-[#776d62]">This will permanently remove the challenge and its reminder schedule. This action cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteId(null)} className="min-h-11 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] px-5 text-sm font-semibold text-[#2f2a25]">Cancel</button><button type="button" onClick={remove} className="min-h-11 rounded-full bg-[#7a4a4a] px-5 text-sm font-bold text-white" style={{background: '#7a4a4a'}}>Delete Challenge</button></div></div></div>}
    </main>
  )
}
