import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPagination } from '../components/AdminLayout'
import { adminGetChallengeParticipants, type AdminChallengeParticipantsResponse } from '../../services/api'

const initial: AdminChallengeParticipantsResponse = {
  challenge: { id: '', title: '', challengeMonth: '' },
  summary: { joined: 0, inProgress: 0, completed: 0, completionRate: 0 },
  participants: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
}

function fmt(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ChallengeParticipantsPage() {
  const { challengeId = '' } = useParams()
  const [data, setData] = useState(initial)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => setPage(1), [search, status])
  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setLoading(true); setError('')
      try {
        const next = await adminGetChallengeParticipants(challengeId, { search, status, page, pageSize: 10 })
        if (!cancelled) setData(next)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unable to load challenge participants')
      } finally { if (!cancelled) setLoading(false) }
    }, 140)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [challengeId, search, status, page])

  const month = useMemo(() => data.challenge.challengeMonth ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(data.challenge.challengeMonth)) : '', [data.challenge.challengeMonth])

  return <main className="min-w-0 px-8 py-7 pb-[42px] max-[760px]:px-[18px]"><div className="mx-auto max-w-[1540px] grid gap-6">
    <header className="rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-8 py-7 shadow-[0_18px_40px_rgba(47,37,28,0.06)]">
      <span className="mb-2 inline-block text-[0.74rem] uppercase tracking-[0.18em] text-[#776d62]">Challenge Participation</span>
      <div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="m-0 font-serif text-[clamp(2.6rem,5vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-[#2f2a25]">{data.challenge.title || 'Participants'}</h1><p className="mt-3 text-[1rem] text-[#776d62]">{month ? `${month} · ` : ''}See who joined, who completed, which Love Note they chose, and where they planned to leave it.</p></div><Link to="/admin/challenges" className="inline-flex min-h-[46px] items-center rounded-full border border-[rgba(57,47,39,.14)] bg-[#f9f5ef] px-5 text-sm font-bold text-[#17392f]">← Back to Challenges</Link></div>
    </header>

    <section className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
      {[['Joined',data.summary.joined],['In Progress',data.summary.inProgress],['Completed',data.summary.completed],['Completion Rate',`${data.summary.completionRate}%`]].map(([label,value])=><article key={String(label)} className="rounded-[24px] border border-[rgba(57,47,39,.11)] bg-[#fcfaf7] p-5 shadow-[0_12px_30px_rgba(47,37,28,.04)]"><span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">{label}</span><strong className="mt-2 block font-serif text-[2.35rem] leading-none text-[#2f2a25]">{value}</strong></article>)}
    </section>

    <section className="rounded-[30px] border border-[rgba(57,47,39,.12)] bg-[#fcfaf7] p-6 shadow-[0_18px_40px_rgba(47,37,28,.06)] max-[720px]:p-[18px]">
      <div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-[240px] flex-1"><svg aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 text-[#17392f]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subscriber name or email" className="min-h-[52px] w-full border border-[rgba(57,47,39,.12)] bg-[#fcfaf7] pr-4 outline-none" style={{borderRadius:'3.40282e38px',paddingLeft:'56px'}}/></div><select value={status} onChange={e=>setStatus(e.target.value)} className="min-h-[52px] min-w-[190px] border border-[rgba(57,47,39,.12)] bg-[#fcfaf7] px-4" style={{borderRadius:'3.40282e38px'}}><option value="">All statuses</option><option value="STARTED">In Progress</option><option value="COMPLETED">Completed</option></select></div>
      {error&&<div className="mb-4 rounded-[16px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading?<div className="grid min-h-[240px] place-items-center text-[#776d62]">Loading participants…</div>:data.participants.length===0?<div className="grid min-h-[240px] place-items-center text-center"><div><h2 className="font-serif text-3xl font-semibold">No participants yet</h2><p className="mt-2 text-sm text-[#776d62]">Participation appears here after a subscriber starts the challenge.</p></div></div>:<div className="overflow-x-auto rounded-[22px] border border-[rgba(57,47,39,.1)]"><table className="w-full min-w-[1050px] border-collapse"><thead><tr className="bg-[rgba(241,235,226,.45)]">{['Subscriber','Status','Love Note','Where to Leave It','Started','Completed'].map(x=><th key={x} className="border-b border-[rgba(57,47,39,.1)] px-5 py-4 text-left text-[0.72rem] uppercase tracking-[0.15em] text-[#776d62]">{x}</th>)}</tr></thead><tbody>{data.participants.map((p,index)=><tr key={p.id}><td className={`${index?'border-t border-[rgba(57,47,39,.08)] ':''}px-5 py-4`}><strong className="block text-sm">{p.user.fullName}</strong><span className="mt-1 block text-xs text-[#776d62]">{p.user.email}</span></td><td className={`${index?'border-t border-[rgba(57,47,39,.08)] ':''}px-5 py-4`}><span className={`inline-flex rounded-full px-3 py-2 text-xs font-extrabold ${p.status==='COMPLETED'?'bg-[#17392f] text-white':'bg-[#efe6d9] text-[#6d5d4d]'}`}>{p.status==='COMPLETED'?'Completed':'In Progress'}</span></td><td className={`${index?'border-t border-[rgba(57,47,39,.08)] ':''}px-5 py-4 text-sm`}>{p.selectedCard ? <><strong className="block">{p.selectedCard.title}</strong><span className="text-xs text-[#776d62]">{p.selectedCard.collectionName}</span></> : '—'}</td><td className={`${index?'border-t border-[rgba(57,47,39,.08)] ':''}px-5 py-4 text-sm`}>{p.selectedLocation || '—'}</td><td className={`${index?'border-t border-[rgba(57,47,39,.08)] ':''}px-5 py-4 text-sm`}>{fmt(p.startedAt)}</td><td className={`${index?'border-t border-[rgba(57,47,39,.08)] ':''}px-5 py-4 text-sm`}>{fmt(p.completedAt)}</td></tr>)}</tbody></table></div>}
      <div className="mt-5"><AdminPagination {...data.pagination} onPageChange={setPage} pageSize={10}/></div>
    </section>
  </div></main>
}
