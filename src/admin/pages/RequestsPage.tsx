import { useEffect, useState, type ReactNode } from 'react'
import { adminGetRequests, adminSetRequestStatus, getCollections, type AdminPoetryRequest, type AdminRequestsResponse } from '../../services/api'
import type { LoveNoteCollection } from '../../types/loveNote'

const empty: AdminRequestsResponse = {
  summary: { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 },
  categories: [],
  collections: [],
  requests: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
}

const dateFmt = (value: string) => new Intl.DateTimeFormat('en-US', {
  month: 'short', day: '2-digit', year: 'numeric',
}).format(new Date(value))

const statusLabel = (status: AdminPoetryRequest['status']) => status.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

const statusClass = (status: AdminPoetryRequest['status']) => {
  if (status === 'COMPLETED') return 'border-[rgba(23,57,47,0.18)] bg-[rgba(23,57,47,0.1)] text-[#17392f]'
  if (status === 'IN_PROGRESS') return 'border-[rgba(168,132,55,0.22)] bg-[rgba(168,132,55,0.14)] text-[#85652a]'
  if (status === 'CANCELLED') return 'border-[rgba(125,74,74,0.18)] bg-[rgba(125,74,74,0.11)] text-[#7a4a4a]'
  return 'border-[rgba(119,109,98,0.14)] bg-[rgba(119,109,98,0.08)] text-[#7d7165]'
}

export function RequestsPage() {
  const [data, setData] = useState(empty)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [collection, setCollection] = useState('')
  const [collectionOptions, setCollectionOptions] = useState<LoveNoteCollection[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewing, setViewing] = useState<AdminPoetryRequest | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await adminGetRequests({ search, status, collection, page, pageSize: 10 })
      setData({
        summary: response?.summary ?? empty.summary,
        categories: Array.isArray(response?.categories) ? response.categories : [],
        collections: Array.isArray(response?.collections) ? response.collections : [],
        requests: Array.isArray(response?.requests) ? response.requests : [],
        pagination: response?.pagination ?? empty.pagination,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCollections().then(items => setCollectionOptions(Array.isArray(items) ? items : [])).catch(() => setCollectionOptions([]))
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(load, 160)
    return () => window.clearTimeout(timer)
  }, [search, status, collection, page])

  useEffect(() => setPage(1), [search, status, collection])

  async function update(item: AdminPoetryRequest, next: AdminPoetryRequest['status']) {
    try {
      await adminSetRequestStatus(item.id, next)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to update request')
    }
  }

  const start = data.pagination.total === 0 ? 0 : (data.pagination.page - 1) * data.pagination.pageSize + 1
  const end = Math.min(data.pagination.total, data.pagination.page * data.pagination.pageSize)

  return <div className="admin-requests-reference min-w-0 px-8 py-7 pb-[42px] max-[760px]:px-[18px]">
    <div className="mx-auto max-w-[1540px]">
      <header className="mb-6 flex items-start justify-between gap-5 rounded-[30px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-[30px] shadow-[0_20px_42px_rgba(47,37,28,0.07)] max-[720px]:p-5">
        <div>
          <span className="mb-2 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-[#776d62]">Admin panel</span>
          <h1 className="m-0 font-serif text-5xl font-semibold leading-none tracking-[-0.03em] md:text-6xl">Requests</h1>
          <p className="mt-2.5 max-w-[720px] text-base text-[#776d62]">A clear, premium workspace for personalized poem requests, with gentle structure for review, progress, and completion.</p>
        </div>
      </header>

      <section className="mb-[22px] grid gap-4" aria-label="Requests summary" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <SummaryCard label="Total Requests" value={data.summary.total} note="All custom poetry requests across the platform." />
        <SummaryCard accent label="Pending" value={data.summary.pending} note="Requests waiting for editorial work to begin." />
        <SummaryCard label="In Progress" value={data.summary.inProgress} note="Requests currently being written or reviewed." />
        <SummaryCard label="Completed" value={data.summary.completed} note="Requests already delivered back to the user." />
        <SummaryCard label="Cancelled" value={data.summary.cancelled} note="Requests closed before completion." />
      </section>

      <section className="mt-[18px] rounded-[30px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-6 shadow-[0_20px_42px_rgba(47,37,28,0.07)] max-[720px]:p-[18px]" aria-labelledby="requestsListTitle">
        <div className="mb-[18px] flex items-start justify-between gap-[18px]">
          <div>
            <span className="mb-2 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-[#776d62]">Requests List</span>
            <h2 id="requestsListTitle" className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em]">Personalized poem requests</h2>
            <p className="mt-2 max-w-[700px] text-[0.96rem] text-[#776d62]">Each completed request remains inside <strong>Your Requests</strong> on the user side.</p>
          </div>
        </div>

        <section className="mb-5 flex items-center justify-between gap-4 rounded-[26px] border border-[rgba(57,47,39,0.12)] bg-[linear-gradient(180deg,rgba(249,245,239,0.88),rgba(252,250,247,0.95))] p-5 max-[980px]:flex-wrap max-[720px]:p-[18px]" aria-label="Requests filters">
          <div className="flex min-w-0 flex-1 items-center gap-3 max-[980px]:flex-wrap">
            <div className="relative mx-auto w-full max-w-none max-[980px]:order-1 max-[980px]:w-full">
              <svg aria-hidden="true" style={{ left: '20px', zIndex: 20 }} className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6f655c]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." style={{ borderRadius: '3.40282e38px', paddingLeft: '56px' }} className="relative z-0 min-h-[52px] w-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] py-0 pl-14 pr-[18px] text-[#2f2a25] outline-none transition placeholder:text-[#8c8175] focus:border-[rgba(23,57,47,0.26)] focus:bg-[#fffdfa] focus:ring-4 focus:ring-[rgba(23,57,47,0.06)]" type="search" />
            </div>
            <FilterSelect label="Filter by request status" value={status} onChange={setStatus} options={[['','Request Status'],['PENDING','Pending'],['IN_PROGRESS','In Progress'],['COMPLETED','Completed'],['CANCELLED','Cancelled']]} />
            <FilterSelect label="Filter by collection" value={collection} onChange={setCollection} options={[['','Collections'], ...collectionOptions.map(c => [c.id,c.name] as [string,string])]} />
          </div>
        </section>

        {error && <div className="mb-4 rounded-[14px] border border-[#ead3cd] bg-[#faf0ed] px-4 py-3 text-sm text-[#874b43]">{error}</div>}

        {loading ? <EmptyState title="Loading requests…" copy="Please wait while the latest request records are loaded." /> : data.requests.length === 0 ? <EmptyState title="No requests found" copy="New personalized poem requests will appear here." /> : <>
          <div className="overflow-x-auto rounded-[24px] border border-[rgba(57,47,39,0.12)] bg-[rgba(252,250,247,0.88)] max-[760px]:hidden">
            <table className="w-full min-w-[1120px] border-collapse">
              <thead><tr className="bg-[rgba(241,235,226,0.45)]">
                {['Requester','Category','Request','Status','Date','Action'].map(h => <th key={h} className="border-b border-[rgba(57,47,39,0.12)] px-5 py-[18px] text-left text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">{h}</th>)}
              </tr></thead>
              <tbody>{data.requests.map(r => <tr key={r.id} className="transition hover:bg-[rgba(23,57,47,0.028)]">
                <td className="border-t border-[rgba(57,47,39,0.08)] px-5 py-[18px] align-middle text-[0.95rem]"><strong className="block">{r.requesterName}</strong><span className="mt-1 block text-[0.84rem] text-[#776d62]">{r.requesterEmail}</span></td>
                <td className="border-t border-[rgba(57,47,39,0.08)] px-5 py-[18px] align-middle"><span className="inline-flex min-h-[34px] items-center rounded-full border border-[rgba(39,74,63,0.08)] bg-[rgba(39,74,63,0.07)] px-3 text-[0.84rem] font-semibold text-[#274a3f]">{r.category}</span></td>
                <td className="max-w-[420px] border-t border-[rgba(57,47,39,0.08)] px-5 py-[18px] align-middle text-[0.95rem]"><strong className="block">{r.occasion || 'Personalized poem'}</strong><span className="mt-1 block line-clamp-2 text-[0.84rem] leading-5 text-[#776d62]">{r.prompt}</span></td>
                <td className="border-t border-[rgba(57,47,39,0.08)] px-5 py-[18px] align-middle"><select value={r.status} onChange={e => update(r, e.target.value as AdminPoetryRequest['status'])} className={`min-h-[38px] rounded-full border px-3 text-[0.84rem] font-bold outline-none ${statusClass(r.status)}`}><option value="PENDING">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></td>
                <td className="border-t border-[rgba(57,47,39,0.08)] px-5 py-[18px] align-middle text-[0.95rem]">{dateFmt(r.createdAt)}</td>
                <td className="border-t border-[rgba(57,47,39,0.08)] px-5 py-[18px] align-middle"><button type="button" onClick={() => setViewing(r)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] text-[#17392f] transition hover:-translate-y-px hover:border-[rgba(23,57,47,0.16)] hover:bg-[#fbf8f3]" aria-label="View request" title="View request"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.1 12s3.6-6 9.9-6 9.9 6 9.9 6-3.6 6-9.9 6-9.9-6-9.9-6Z"/><circle cx="12" cy="12" r="3"/></svg></button></td>
              </tr>)}</tbody>
            </table>
          </div>

          <div className="hidden gap-3.5 max-[760px]:grid">{data.requests.map(r => <article key={r.id} className="rounded-[22px] border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] p-[18px] shadow-[0_10px_22px_rgba(47,37,28,0.04)]">
            <strong className="block text-base">{r.requesterName}</strong><span className="mt-1 block break-words text-[0.84rem] text-[#776d62]">{r.requesterEmail}</span>
            <div className="mt-4 grid grid-cols-2 gap-4 max-[480px]:grid-cols-1"><MobileField label="Category"><span className="inline-flex min-h-[34px] items-center rounded-full border border-[rgba(39,74,63,0.08)] bg-[rgba(39,74,63,0.07)] px-3 text-[0.84rem] font-semibold text-[#274a3f]">{r.category}</span></MobileField><MobileField label="Date">{dateFmt(r.createdAt)}</MobileField><MobileField label="Request" wide><strong>{r.occasion || 'Personalized poem'}</strong><p className="mt-1 text-[0.84rem] text-[#776d62]">{r.prompt}</p></MobileField><MobileField label="Status" wide><select value={r.status} onChange={e => update(r, e.target.value as AdminPoetryRequest['status'])} className={`min-h-[38px] rounded-full border px-3 text-[0.84rem] font-bold outline-none ${statusClass(r.status)}`}><option value="PENDING">Pending</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></MobileField></div>
            <button type="button" onClick={() => setViewing(r)} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 text-sm font-semibold text-[#17392f]">View request</button>
          </article>)}</div>

          <footer className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(57,47,39,0.12)] px-1 pt-4">
            <div className="text-[0.9rem] text-[#776d62]">Showing <span className="font-bold text-[#2f2a25]">{start}-{end}</span> of <span className="font-bold text-[#2f2a25]">{data.pagination.total}</span></div>
            <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#faf7f2] px-4 text-sm transition hover:bg-[#f4eee5] disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[#17392f] bg-[#17392f] px-3 text-sm text-[#f7f4ef] shadow-[0_10px_22px_rgba(23,57,47,0.14)]">{page}</span><button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)} className="min-h-10 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#faf7f2] px-4 text-sm transition hover:bg-[#f4eee5] disabled:cursor-not-allowed disabled:opacity-40">Next</button></nav>
          </footer>
        </>}
      </section>
    </div>

    {viewing && <div className="fixed inset-0 z-[1200] grid place-items-center bg-[rgba(28,25,22,0.48)] p-5 backdrop-blur-[4px]" onMouseDown={e => { if (e.currentTarget === e.target) setViewing(null) }}>
      <section className="w-full max-w-[620px] rounded-[28px] border border-[rgba(57,47,39,0.14)] bg-[#fcfaf7] p-7 shadow-[0_28px_80px_rgba(30,25,20,0.25)]">
        <div className="flex items-start justify-between gap-5"><div><span className="mb-2 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-[#776d62]">Request details</span><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em]">{viewing.occasion || 'Personalized poem'}</h2><p className="mt-2 text-sm text-[#776d62]">Submitted by {viewing.requesterName} · {dateFmt(viewing.createdAt)}</p></div><button type="button" onClick={() => setViewing(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] text-xl text-[#5f5148]">×</button></div>
        <div className="mt-6 grid gap-4"><div className="rounded-[18px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-4"><span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#776d62]">Category</span><p className="mt-2 text-base text-[#2f2a25]">{viewing.category}</p></div><div className="rounded-[18px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-4"><span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#776d62]">Request</span><p className="mt-2 whitespace-pre-wrap text-base leading-7 text-[#2f2a25]">{viewing.prompt}</p></div>{viewing.adminNotes && <div className="rounded-[18px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-4"><span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#776d62]">Admin notes</span><p className="mt-2 whitespace-pre-wrap text-base leading-7 text-[#2f2a25]">{viewing.adminNotes}</p></div>}</div>
      </section>
    </div>}
  </div>
}

function SummaryCard({ label, value, note, accent = false }: { label: string; value: number; note: string; accent?: boolean }) {
  return <article className={`min-w-0 rounded-[26px] border px-5 pb-[18px] pt-5 shadow-[0_12px_26px_rgba(47,37,28,0.05)] ${accent ? 'border-[rgba(23,57,47,0.35)] bg-[linear-gradient(160deg,rgba(23,57,47,0.98),rgba(39,74,63,0.94))]' : 'border-[rgba(57,47,39,0.12)] bg-[#fcfaf7]'}`}>
    <span style={accent ? { color: '#ffffff' } : undefined} className={`mb-3 inline-flex text-[0.73rem] uppercase tracking-[0.16em] ${accent ? 'font-bold' : 'text-[#776d62]'}`}>{label}</span>
    <h2 style={accent ? { color: '#ffffff' } : undefined} className={`m-0 mb-2 text-[2.02rem] font-bold leading-none tracking-[-0.04em] ${accent ? '' : 'text-[#17392f]'}`}>{value}</h2>
    <p style={accent ? { color: '#ffffff', opacity: 0.92 } : undefined} className={`m-0 text-[0.92rem] ${accent ? 'font-medium leading-6' : 'text-[#776d62]'}`}>{note}</p>
  </article>
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string,string][] }) {
  return <label className="relative"><span className="sr-only">{label}</span><select aria-label={label} value={value} onChange={e => onChange(e.target.value)} style={{ borderRadius: '3.40282e38px' }} className="min-h-[52px] min-w-[190px] appearance-none border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 pr-12 text-[#2f2a25] outline-none transition focus:border-[rgba(23,57,47,0.26)] focus:bg-[#fffdfa] focus:ring-4 focus:ring-[rgba(23,57,47,0.06)] max-[980px]:flex-1 max-[980px]:min-w-0">{options.map(([v,l]) => <option key={`${v}-${l}`} value={v}>{l}</option>)}</select><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#776d62]"><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg></span></label>
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className="flex flex-col items-center border-t border-[rgba(57,47,39,0.12)] px-6 py-12 text-center" aria-live="polite"><div className="mx-auto mb-[18px] grid h-[68px] w-[68px] place-items-center rounded-[22px] border border-[rgba(57,47,39,0.12)] bg-[linear-gradient(180deg,rgba(241,235,226,0.9),rgba(249,245,239,0.95))] text-[#17392f]"><svg className="h-[30px] w-[30px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg></div><h3 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em]">{title}</h3><p className="mt-2.5 w-full max-w-[420px] text-center text-[0.98rem] text-[#776d62]">{copy}</p></div>
}

function MobileField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <div className={wide ? 'col-span-2 max-[480px]:col-span-1' : ''}><span className="mb-1 block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#776d62]">{label}</span><div className="text-[0.94rem]">{children}</div></div>
}
