import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import { cardPdfUrl, createSubscriptionCheckout, getLibrary, getMyPoetryRequests, getProfile, setLibraryCardUsed, type SavedLibraryCard, type UserPoetryRequest } from '../../services/api'

function SearchIcon(){
  return <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
}

function EyeIcon(){
  return <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
}

function DownloadIcon(){
  return <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
}

export function LibraryPage(){
  const [items,setItems]=useState<SavedLibraryCard[]>([])
  const [requests,setRequests]=useState<UserPoetryRequest[]>([])
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState<'ALL'|'USED'|'NOT_USED'>('ALL')
  const [loading,setLoading]=useState(true)
  const [active,setActive]=useState<boolean|null>(null)
  const [error,setError]=useState('')
  const [checkout,setCheckout]=useState(false)
  const [searchParams,setSearchParams]=useSearchParams()
  const [tab,setTab]=useState<'SAVED'|'REQUESTS'>(()=>searchParams.get('tab')==='requests'?'REQUESTS':'SAVED')

  useEffect(()=>{
    setTab(searchParams.get('tab')==='requests'?'REQUESTS':'SAVED')
  },[searchParams])

  useEffect(()=>{
    getProfile().then(async profile=>{
      const isActive=profile.subscription?.status==='ACTIVE' && (!profile.subscription.currentPeriodEnd || new Date(profile.subscription.currentPeriodEnd)>new Date())
      setActive(isActive)
      if(isActive){
        const [savedCards, requestData]=await Promise.all([getLibrary(),getMyPoetryRequests()])
        setItems(savedCards)
        setRequests(requestData)
      }
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

  if(loading)return <main className="flex flex-1 flex-col"><section className="flex flex-1 items-center justify-center bg-[#f7f3ed] text-muted">Loading your library…</section></main>

  return <main className="flex flex-1 flex-col">
    <section className="flex flex-1 flex-col bg-[#f7f3ed] px-16 pb-12 pt-12 text-charcoal max-[1180px]:px-7 max-[760px]:px-[18px] max-[760px]:pt-8">
      <div className="mx-auto flex w-full max-w-[1220px] flex-1 flex-col">
        <header className="mb-8">
          <h1 className="font-serif text-[50px] font-semibold leading-[0.95] tracking-[-0.03em] max-[760px]:text-[38px]">Your Library</h1>
          <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-muted">Cards you've saved to return to, share, or send - alongside poem requests still being crafted and those ready to revisit.</p>
        </header>

        {active===false ? (
          <section className="flex flex-1 flex-col items-center justify-center rounded-[22px] border border-[rgba(56,45,36,0.08)] bg-white/30 p-12 text-center shadow-[0_10px_28px_rgba(44,32,23,0.06)] max-[760px]:p-8">
            <div className="mx-auto flex max-w-lg flex-col items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-forest/10 text-forest"><svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>
              <h2 className="font-serif text-[32px] font-semibold leading-[0.96] tracking-[-0.02em] text-charcoal max-[760px]:text-[26px]">Subscribe to Access Your Library</h2>
              <p className="text-[15px] leading-7 text-muted">Saved cards and custom poetry requests are available to subscribers. Start your journey to unlock your personal poetry collection.</p>
              {error&&<p className="text-sm text-red-700">{error}</p>}
              <button type="button" disabled={checkout} onClick={subscribe} className="mt-2 inline-flex min-h-[50px] cursor-pointer items-center justify-center gap-2 rounded-full bg-forest px-7 text-sm font-medium text-ivory shadow-[0_12px_24px_rgba(23,57,47,0.18)] transition hover:-translate-y-px hover:bg-forest/90 focus:outline-none focus:ring-2 focus:ring-forest/25 focus:ring-offset-2 focus:ring-offset-ivory disabled:cursor-not-allowed disabled:opacity-60">{checkout?'Opening checkout…':'Subscribe Now'}</button>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-7 flex flex-wrap gap-3">
              <button type="button" aria-pressed={tab==='SAVED'} onClick={()=>{setTab('SAVED');setSearchParams({})}} className={`min-h-11 cursor-pointer rounded-full border px-5 text-sm transition ${tab==='SAVED'?'border-forest/20 bg-[#eaf0ee] font-semibold text-forest':'border-[rgba(56,45,36,0.12)] text-[#5e5348] hover:bg-[#f4eee5] hover:text-forest'}`}>Saved Cards</button>
              <button type="button" aria-pressed={tab==='REQUESTS'} onClick={()=>{setTab('REQUESTS');setSearchParams({tab:'requests'})}} className={`min-h-11 cursor-pointer rounded-full border px-5 text-sm transition ${tab==='REQUESTS'?'border-forest/20 bg-[#eaf0ee] font-semibold text-forest':'border-[rgba(56,45,36,0.12)] text-[#5e5348] hover:bg-[#f4eee5] hover:text-forest'}`}>Your Requests</button>
            </div>

            {tab==='REQUESTS' ? (
              <section className="min-w-0 overflow-hidden rounded-[22px] border border-[rgba(56,45,36,0.08)] bg-white/30 p-6 shadow-[0_10px_28px_rgba(44,32,23,0.06)] max-[760px]:p-[18px]">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-serif text-[28px] font-semibold leading-none text-charcoal">Your Requests</h2>
                  <Link className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest px-5 text-sm text-ivory transition hover:bg-forest/90 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:ring-offset-2 focus:ring-offset-ivory" to="/poetry-request">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    <span className="max-[520px]:sr-only">Add Request</span>
                  </Link>
                </div>
                <div className="mt-5" />
                {!requests.length ? <section className="mx-auto flex min-h-[300px] max-w-2xl flex-1 flex-col items-center justify-center gap-6 py-14 text-center max-[760px]:min-h-[260px]">
                  <h1 className="font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em] md:text-5xl">No poetry requests yet</h1>
                  <p className="max-w-[80%] text-sm text-muted md:text-base">When you request a custom poem, it will appear here.</p>
                </section> : <div className="grid gap-3">{requests.map(request=><article key={request.id} className="rounded-[16px] border border-[rgba(56,45,36,0.09)] bg-white/70 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a7d70]">{request.occasion||request.category}</span><h3 className="mt-1 font-serif text-[24px] font-semibold text-charcoal">{request.recipientName?`For ${request.recipientName}`:'Personalized poem'}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{request.prompt}</p>{(request.relationship||request.tone)&&<p className="mt-3 text-xs text-[#776d62]">{request.relationship&&<>Relationship: <strong>{request.relationship}</strong></>}{request.relationship&&request.tone?' · ':''}{request.tone&&<>Tone: <strong>{request.tone}</strong></>}</p>}</div><span className="rounded-full border border-forest/15 bg-[#eaf0ee] px-3 py-1.5 text-xs font-bold text-forest">{request.status.replaceAll('_',' ')}</span></div></article>)}</div>}
              </section>
            ) : (
            <section className="min-w-0 overflow-hidden rounded-[22px] border border-[rgba(56,45,36,0.08)] bg-white/30 p-6 shadow-[0_10px_28px_rgba(44,32,23,0.06)] max-[760px]:p-[18px]">
              <div className="mb-7 flex flex-wrap items-center gap-4">
                <div className="min-w-[280px] max-w-[420px] flex-1 max-[760px]:min-w-0 max-[760px]:max-w-none max-[760px]:basis-full">
                  <label className="relative mx-auto block w-full max-w-3xl">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#877b70]"><SearchIcon/></span>
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your saved cards..." className="h-[58px] w-full rounded-full border border-[rgba(57,47,39,0.1)] bg-[#f4eee5] px-[22px] py-0 pl-[54px] text-charcoal outline-none transition placeholder:text-[#8a7e72] focus:border-forest/25 focus:ring-2 focus:ring-forest/10" type="search"/>
                  </label>
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2.5 max-[760px]:ml-0">
                  {(['ALL','USED','NOT_USED'] as const).map(x=><button key={x} type="button" aria-pressed={filter===x} onClick={()=>setFilter(x)} className={`min-h-10 cursor-pointer whitespace-nowrap rounded-full border px-4 text-sm transition ${filter===x?'border-forest/20 bg-[#eaf0ee] font-semibold text-forest':'border-[rgba(56,45,36,0.12)] bg-white text-[#675b50] hover:bg-[#eaf0ee] hover:text-forest'}`}>{x==='NOT_USED'?'Not Used':x[0]+x.slice(1).toLowerCase()}</button>)}
                </div>
              </div>

              {error ? <div className="grid min-h-[340px] place-items-center text-red-700">{error}</div> : !visible.length ? (
                <div className="grid min-h-[340px] place-items-center px-5 text-center">
                  <div><p className="font-serif text-2xl font-semibold text-charcoal">No saved cards found.</p><p className="mt-2 text-sm text-muted">Try another search or change the status filter.</p></div>
                </div>
              ) : (
                <section className="grid grid-cols-1 justify-items-center gap-[18px] sm:grid-cols-2 sm:justify-items-stretch md:grid-cols-3 lg:grid-cols-4">
                  {visible.map(item=><article key={item.id} className="flex w-full min-w-0 max-w-[15.625rem] flex-col gap-3 sm:max-w-none">
                    <Link className="block w-full" to={`/cards/${item.card.id}`}><LoveNoteCard card={item.card} className="w-full"/></Link>
                    <div className="flex flex-col items-center gap-2 md:items-start">
                      <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
                        <a aria-label={`View ${item.card.title}`} title="View" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest bg-forest text-ivory transition hover:-translate-y-px hover:bg-forest/90" href={cardPdfUrl(item.card.id)} target="_blank" rel="noreferrer"><EyeIcon/></a>
                        <a aria-label={`Download ${item.card.title}`} title="Download" className="inline-grid h-10 w-10 place-items-center rounded-full border border-forest/20 text-forest transition hover:-translate-y-px hover:bg-cream" href={cardPdfUrl(item.card.id,true)}><DownloadIcon/></a>
                        <button type="button" onClick={()=>toggleUsed(item)} className={`min-h-10 cursor-pointer rounded-full border px-3.5 text-xs font-medium transition hover:-translate-y-px ${item.usedAt?'border-forest/20 bg-[#eaf0ee] text-forest':'border-[rgba(56,45,36,0.12)] bg-white text-[#675b50] hover:bg-[#f4eee5] hover:text-forest'}`} title={item.usedAt?'Mark as not used':'Mark as used'}>{item.usedAt?'Used':'Mark Used'}</button>
                      </div>
                    </div>
                  </article>)}
                </section>
              )}
            </section>
            )}
          </>
        )}
      </div>
    </section>
  </main>
}
