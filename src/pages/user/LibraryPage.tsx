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

  async function toggleUsed(item:SavedLibraryCard){await setLibraryCardUsed(item.card.id,!item.usedAt);setItems(v=>v.map(x=>x.id===item.id?{...x,usedAt:x.usedAt?null:new Date().toISOString()}:x))}
  async function subscribe(){setCheckout(true);setError('');try{const result=await createSubscriptionCheckout('/library');window.location.assign(result.url)}catch(e){setError(e instanceof Error?e.message:'Unable to start checkout');setCheckout(false)}}

  if(loading)return <main className="min-h-[70vh] bg-[#f8f3eb] grid place-items-center text-[#756b61]">Loading your library…</main>

  return <main className="min-h-[calc(100vh-88px)] bg-[#f8f3eb] px-6 py-[78px] text-[#2b2621] md:px-12 lg:px-[76px]">
    <section className="mx-auto max-w-[1800px]"><h1 className="font-serif text-[clamp(3.4rem,5vw,4.2rem)] font-semibold leading-none tracking-[-.04em]">Your Library</h1><p className="mt-6 max-w-[820px] text-[1.12rem] leading-[1.7] text-[#756b61]">Cards you've saved to return to, share, or send – alongside poem requests still<br className="hidden md:block"/> being crafted and those ready to revisit.</p></section>

    {active===false?<section className="mx-auto mt-[54px] grid min-h-[540px] max-w-[1800px] place-items-center rounded-[28px] border border-[#e2d8cb] bg-[#fcfaf7] px-8 text-center shadow-[0_14px_34px_rgba(45,34,24,.05)]"><div><div className="mx-auto grid h-[92px] w-[92px] place-items-center rounded-full bg-[#e7e7e1] text-[2.4rem] text-[#17392f]">▢</div><h2 className="mt-8 font-serif text-[clamp(2.7rem,4vw,3.4rem)] font-semibold leading-none tracking-[-.035em]">Subscribe to Access Your Library</h2><p className="mx-auto mt-7 max-w-[760px] text-[1.12rem] leading-[1.75] text-[#756b61]">Saved cards and custom poetry requests are available to subscribers.<br/>Start your journey to unlock your personal poetry collection.</p>{error&&<p className="mt-4 text-sm text-red-700">{error}</p>}<button disabled={checkout} onClick={subscribe} className="mt-9 rounded-full bg-[#17392f] px-9 py-[18px] text-lg font-semibold text-white shadow-[0_12px_25px_rgba(23,57,47,.18)] disabled:opacity-60">{checkout?'Opening checkout…':'Subscribe Now'}</button></div></section>:<>
      <section className="mx-auto mt-[54px] max-w-[1800px]"><div className="mb-6 flex gap-3"><button className="rounded-full border border-[#b9cbc4] bg-[#e8f0ed] px-5 py-3 text-sm font-semibold text-[#17392f]">Saved Cards</button><button className="rounded-full border border-[#ded3c6] bg-[#f8f3eb] px-5 py-3 text-sm text-[#655b52]">Your Requests</button></div>
        <div className="min-h-[610px] rounded-[28px] border border-[#e2d8cb] bg-[#fcfaf7] p-6 shadow-[0_14px_34px_rgba(45,34,24,.05)] md:p-8"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><label className="flex h-14 w-full max-w-[420px] items-center gap-3 rounded-full border border-[#ded3c6] bg-[#f6efe5] px-6 text-[#81766c]">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your saved cards..." className="w-full bg-transparent outline-none"/></label><div className="flex gap-2">{(['ALL','USED','NOT_USED'] as const).map(x=><button key={x} className={`rounded-full border px-4 py-2 text-sm ${filter===x?'border-[#b9cbc4] bg-[#e8f0ed] text-[#17392f]':'border-[#ded3c6] bg-white text-[#655b52]'}`} onClick={()=>setFilter(x)}>{x==='NOT_USED'?'Not Used':x[0]+x.slice(1).toLowerCase()}</button>)}</div></div>
          {error?<div className="grid min-h-[340px] place-items-center text-red-700">{error}</div>:!visible.length?<div className="grid min-h-[340px] place-items-center text-[#81766c]">No saved cards found.</div>:<div className="mt-7 grid grid-cols-2 gap-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{visible.map(item=><article key={item.id}><Link to={`/cards/${item.card.id}`}><LoveNoteCard card={item.card}/></Link><div className="mt-3 flex items-center gap-2"><a href={cardPdfUrl(item.card.id)} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-[#17392f] text-white" title="View full PDF">◉</a><a href={cardPdfUrl(item.card.id,true)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d8cec2] bg-white text-[#17392f]" title="Download PDF">⇩</a><button onClick={()=>toggleUsed(item)} className="rounded-full border border-[#d8cec2] bg-white px-3 py-2 text-xs">{item.usedAt?'Used':'Mark Used'}</button></div></article>)}</div>}
        </div>
      </section>
    </>}
  </main>
}
