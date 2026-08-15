import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import { cardPdfUrl, createSubscriptionCheckout, getLibrary, getProfile, setLibraryCardUsed, type SavedLibraryCard } from '../../services/api'

export function LibraryPage(){
  const [items,setItems]=useState<SavedLibraryCard[]>([])
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState<'ALL'|'USED'|'NOT_USED'>('ALL')
  const [loading,setLoading]=useState(true)
  const [active,setActive]=useState<boolean|null>(null)
  const [error,setError]=useState('')
  const [checkout,setCheckout]=useState(false)

  useEffect(()=>{
    getProfile().then(async profile=>{
      const isActive=profile.subscription?.status==='ACTIVE' && (!profile.subscription.currentPeriodEnd || new Date(profile.subscription.currentPeriodEnd)>new Date())
      setActive(isActive)
      if(isActive) setItems(await getLibrary())
    }).catch(e=>setError(e instanceof Error?e.message:'Unable to load library')).finally(()=>setLoading(false))
  },[])

  const visible=useMemo(()=>items.filter(x=>{
    if(filter==='USED'&&!x.usedAt)return false
    if(filter==='NOT_USED'&&x.usedAt)return false
    return !search||x.card.title.toLowerCase().includes(search.toLowerCase())
  }),[items,search,filter])

  async function toggleUsed(item:SavedLibraryCard){
    await setLibraryCardUsed(item.card.id,!item.usedAt)
    setItems(v=>v.map(x=>x.id===item.id?{...x,usedAt:x.usedAt?null:new Date().toISOString()}:x))
  }

  async function subscribe(){
    setCheckout(true)
    setError('')
    try{
      const result=await createSubscriptionCheckout('/library')
      window.location.assign(result.url)
    }catch(e){
      setError(e instanceof Error?e.message:'Unable to start checkout')
      setCheckout(false)
    }
  }

  if(loading)return <main className="flex-1 flex flex-col"><section className="flex flex-1 items-center justify-center bg-[#f7f3ed] text-muted">Loading your library…</section></main>

  return <main className="flex-1 flex flex-col">
    <section className="flex flex-1 flex-col bg-[#f7f3ed] px-16 pb-12 pt-12 text-charcoal max-[1180px]:px-7 max-[760px]:px-[18px] max-[760px]:pt-8">
      <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col">
        <header className="mb-8">
          <h1 className="font-serif text-[50px] font-semibold leading-[0.95] tracking-[-0.03em] max-[760px]:text-[38px]">Your Library</h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-muted">Cards you've saved to return to, share, or send - alongside poem requests still being crafted and those ready to revisit.</p>
        </header>

        {active===false ? (
          <section className="flex flex-1 flex-col items-center justify-center rounded-[22px] border border-[rgba(56,45,36,0.08)] bg-white/30 p-12 text-center shadow-[0_10px_28px_rgba(44,32,23,0.06)] max-[760px]:p-8">
            <div className="mx-auto flex max-w-lg flex-col items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-forest/10 text-forest">
                <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
              </div>
              <h2 className="font-serif text-[32px] font-semibold leading-[0.96] tracking-[-0.02em] text-charcoal max-[760px]:text-[26px]">Subscribe to Access Your Library</h2>
              <p className="text-[15px] leading-7 text-muted">Saved cards and custom poetry requests are available to subscribers. Start your journey to unlock your personal poetry collection.</p>
              {error&&<p className="text-sm text-red-700">{error}</p>}
              <button type="button" disabled={checkout} onClick={subscribe} className="mt-2 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-7 text-sm font-medium text-ivory shadow-[0_12px_24px_rgba(23,57,47,0.18)] transition focus:outline-none focus:ring-2 focus:ring-forest/25 focus:ring-offset-2 focus:ring-offset-ivory cursor-pointer bg-forest hover:-translate-y-px hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60">{checkout?'Opening checkout…':'Subscribe Now'}</button>
            </div>
          </section>
        ) : (
          <section className="flex flex-1 flex-col rounded-[22px] border border-[rgba(56,45,36,0.08)] bg-white/30 p-6 shadow-[0_10px_28px_rgba(44,32,23,0.06)] max-[760px]:p-4">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3"><button className="rounded-full border border-forest/20 bg-forest/10 px-5 py-3 text-sm font-semibold text-forest">Saved Cards</button><button className="rounded-full border border-[rgba(56,45,36,0.12)] bg-[#f7f3ed] px-5 py-3 text-sm text-muted">Your Requests</button></div>
              <div className="flex flex-wrap gap-2">{(['ALL','USED','NOT_USED'] as const).map(x=><button key={x} className={`rounded-full border px-4 py-2 text-sm ${filter===x?'border-forest bg-forest text-ivory':'border-[rgba(56,45,36,0.12)] bg-[#fcfaf7] text-muted'}`} onClick={()=>setFilter(x)}>{x==='NOT_USED'?'Not Used':x[0]+x.slice(1).toLowerCase()}</button>)}</div>
            </div>
            <label className="relative block"><svg aria-hidden="true" className="absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#877b70]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your saved cards..." className="h-[58px] w-full rounded-full border border-[rgba(57,47,39,0.1)] bg-[#f4eee5] px-[22px] py-0 pl-[54px] text-charcoal outline-none"/></label>
            {error?<div className="grid min-h-[340px] place-items-center text-red-700">{error}</div>:!visible.length?<div className="grid min-h-[340px] place-items-center text-muted">No saved cards found.</div>:<div className="mt-7 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visible.map(item=><article key={item.id}><Link to={`/cards/${item.card.id}`}><LoveNoteCard card={item.card}/></Link><div className="mt-3 flex items-center gap-2"><a href={cardPdfUrl(item.card.id)} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-forest text-ivory" title="View full PDF">◉</a><a href={cardPdfUrl(item.card.id,true)} className="grid h-10 w-10 place-items-center rounded-full border border-[rgba(56,45,36,0.12)] bg-[#fcfaf7] text-forest" title="Download PDF">⇩</a><button onClick={()=>toggleUsed(item)} className="rounded-full border border-[rgba(56,45,36,0.12)] bg-[#fcfaf7] px-3 py-2 text-xs">{item.usedAt?'Used':'Mark Used'}</button></div></article>)}</div>}
          </section>
        )}
      </div>
    </section>
  </main>
}
