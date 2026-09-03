import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { createCommunityPost, getCollections, getCommunityPosts, getLibrary, getProfile, type CommunityPost, type SavedLibraryCard } from '../../services/api'
import type { LoveNoteCollection } from '../../types/loveNote'

const formatDate=(value:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(value))

export function ForumPage(){
  const [collections,setCollections]=useState<LoveNoteCollection[]>([])
  const [posts,setPosts]=useState<CommunityPost[]>([])
  const [search,setSearch]=useState('')
  const [collectionId,setCollectionId]=useState('')
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')

  useEffect(()=>{getCollections().then(v=>setCollections(v.filter(x=>x.isActive!==false&&Boolean(x.id?.trim())).sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0)))).catch(()=>{})},[])
  useEffect(()=>{const t=setTimeout(()=>{setLoading(true);getCommunityPosts({search,collectionId}).then(setPosts).catch(e=>setError(e instanceof Error?e.message:'Unable to load stories')).finally(()=>setLoading(false))},180);return()=>clearTimeout(t)},[search,collectionId])

  return <main className="flex-1 flex flex-col">
    <main className="mx-auto w-full px-8 py-8 max-[760px]:px-4">
      <section className="overflow-hidden rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-10 py-10 shadow-[0_18px_44px_rgba(47,37,28,0.05)] max-[760px]:px-5">
        <div className="flex items-center justify-between gap-8">
          <div className="max-w-[620px]">
            <h1 className="m-0 font-serif text-[clamp(3rem,6vw,5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#2f2a25]">Shared Moments</h1>
            <p className="mt-5 max-w-[330px] font-serif text-[1.45rem] leading-[1.25] text-[#6d6258]">See how others are expressing what words alone cannot.</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] bg-forest px-5 text-sm text-ivory shadow-[0_14px_24px_rgba(23,57,47,0.18)] transition hover:bg-forest/90 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:ring-offset-2 focus:ring-offset-ivory" to="/forum/share">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>Share Your Story
              </Link>
              <p className="m-0 text-sm text-[#776d62]">A warmer, quieter space for memory, gratitude, repair, and celebration.</p>
            </div>
          </div>
          <div aria-hidden="true" className="relative h-[210px] min-w-[360px] max-[900px]:hidden">
            <div className="absolute bottom-4 right-28 h-[108px] w-[190px] -rotate-8 rounded-[8px] bg-[#123d32] shadow-[0_24px_48px_rgba(23,57,47,0.18)]"/>
            <div className="absolute right-4 top-4 h-[170px] w-[150px] rotate-6 rounded-[8px] border border-[rgba(57,47,39,0.13)] bg-[#fffaf2] p-5 font-serif text-[1.6rem] leading-[1.03] text-[#5f5148] shadow-[0_24px_44px_rgba(47,37,28,0.12)]">I couldn't<br/>say all of<br/>it, so I<br/>sent the<br/>card first.</div>
          </div>
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={()=>setCollectionId('')} className={`inline-flex cursor-pointer min-h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${!collectionId?'border-forest bg-forest text-ivory shadow-[0_10px_22px_rgba(23,57,47,0.16)]':'border-[rgba(57,47,39,0.12)] bg-[#f7f0e7] text-[#6d6258] hover:border-forest/20 hover:text-forest'}`}>All Stories</button>
        {collections.map(c=><button key={c.id} type="button" onClick={()=>setCollectionId(c.id)} className={`inline-flex cursor-pointer min-h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${collectionId===c.id?'border-forest bg-forest text-ivory shadow-[0_10px_22px_rgba(23,57,47,0.16)]':'border-[rgba(57,47,39,0.12)] bg-[#f7f0e7] text-[#6d6258] hover:border-forest/20 hover:text-forest'}`}>{c.name}</button>)}
      </div>

      <section id="community-feed" className="mt-5 scroll-mt-6 rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-6 shadow-[0_18px_44px_rgba(47,37,28,0.05)] max-[760px]:p-4">
        <div className="mb-6"><span className="mb-2 inline-block text-[0.74rem] font-bold uppercase tracking-[0.18em] text-[#aa7f38]">Community feed</span><h2 className="m-0 font-serif text-[2.75rem] font-semibold leading-none tracking-[-0.03em] text-[#2f2a25] max-[760px]:text-[2.2rem]">Stories that stayed</h2><p className="mt-2 text-[0.95rem] text-[#776d62]">A spacious, literary feed for the moments people chose to keep and share.</p></div>
        <div className="relative mx-auto w-full max-w-3xl mb-6 max-w-none"><svg aria-hidden="true" className="absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#877b70]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input placeholder="Search stories by title" className="h-[58px] w-full rounded-full border border-[rgba(57,47,39,0.1)] bg-[#f4eee5] px-[22px] py-0 pl-[54px] text-charcoal outline-none" type="search" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        {loading?<section className="mx-auto flex min-h-[320px] w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"><p className="text-muted">Loading stories…</p></section>:error?<section className="mx-auto flex min-h-[320px] w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 text-center"><p className="text-red-700">{error}</p></section>:posts.length===0?<section className="mx-auto flex flex-1 flex-col items-center justify-center gap-6 text-center max-w-2xl min-h-[320px] w-full"><h1 className="font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em] md:text-5xl">No stories found</h1><p className="max-w-[80%] text-sm md:text-base text-muted">Try changing the search or category filter.</p></section>:<div className="grid gap-5 lg:grid-cols-2">{posts.map(post=><article key={post.id} className="rounded-[24px] border border-[rgba(57,47,39,0.12)] bg-white/40 p-6"><div className="flex gap-5"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2 text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#aa7f38]"><span>{post.category}</span><span>·</span><span>{formatDate(post.createdAt)}</span></div><h3 className="m-0 font-serif text-[2rem] font-semibold leading-[1] text-[#2f2a25]">{post.title}</h3><p className="mt-4 whitespace-pre-wrap text-[0.95rem] leading-7 text-[#776d62]">{post.body}</p><p className="mt-5 text-sm font-semibold text-[#5f5148]">— {post.authorName}</p></div>{post.card&&<Link to={`/cards/${post.card.id}`} className="w-[112px] shrink-0"><div className="overflow-hidden rounded-[10px] border border-[rgba(57,47,39,0.12)] bg-[#f7f0e7]">{post.card.previewImageUrl?<img src={post.card.previewImageUrl} alt={post.card.title} className="aspect-[7/5] w-full object-cover"/>:<div className="grid aspect-[7/5] place-items-center p-3 text-center font-serif text-sm">{post.card.title}</div>}</div><div className="mt-2 line-clamp-2 text-xs text-[#776d62]">{post.card.title}</div></Link>}</div></article>)}</div>}
      </section>
    </main>
  </main>
}

export function ShareStoryPage(){
  const {user}=useAuth()
  const navigate=useNavigate()
  const [profileActive,setProfileActive]=useState<boolean|null>(null)
  const [cards,setCards]=useState<SavedLibraryCard[]>([])
  const [cardId,setCardId]=useState('')
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [showName,setShowName]=useState(true)
  const [search,setSearch]=useState('')
  const [error,setError]=useState('')
  const [sending,setSending]=useState(false)

  useEffect(()=>{Promise.all([getProfile(),getLibrary().catch(()=>[] as SavedLibraryCard[])]).then(([profile,items])=>{setProfileActive(Boolean(profile.subscription?.status==='ACTIVE' && (!profile.subscription.currentPeriodEnd || new Date(profile.subscription.currentPeriodEnd)>new Date())));setCards(items)}).catch(e=>setError(e instanceof Error?e.message:'Unable to load your saved cards'))},[])
  const visible=useMemo(()=>cards.filter(x=>!search||x.card.title.toLowerCase().includes(search.toLowerCase())),[cards,search])
  const selected=cards.find(x=>x.card.id===cardId)
  async function submit(){if(!cardId||!title.trim()||!body.trim()){setError('Select a saved card and enter your story title and details.');return}setSending(true);setError('');try{await createCommunityPost({cardId,title:title.trim(),body:body.trim(),anonymous:!showName});navigate('/forum')}catch(e){setError(e instanceof Error?e.message:'Unable to publish story')}finally{setSending(false)}}

  if(profileActive===false)return <main className="flex-1 flex flex-col"><main className="mx-auto w-full px-8 py-8 max-[760px]:px-4"><section className="rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-12 text-center shadow-[0_18px_44px_rgba(47,37,28,0.05)]"><h1 className="font-serif text-[2.45rem] font-semibold leading-none tracking-[-0.03em] text-[#2f2a25]">Subscribe to Share Your Story</h1><p className="mx-auto mt-4 max-w-[600px] text-[#776d62]">Stories are connected to cards in your saved Library, which is available to active subscribers.</p><Link to="/library" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-[10px] bg-forest px-7 text-ivory">Go to Library</Link></section></main></main>

  return <main className="flex-1 flex flex-col">
    <main className="mx-auto w-full px-8 py-8 max-[760px]:px-4">
      <div className="mb-5"><Link className="inline-flex min-h-10 items-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#faf7f2] px-4 text-sm font-semibold text-[#5f5148] transition hover:border-forest/20 hover:text-forest" to="/forum">Back to Forum</Link></div>
      <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-5 max-[1100px]:grid-cols-1">
        <section className="rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-7 shadow-[0_18px_44px_rgba(47,37,28,0.05)]">
          <div className="mb-6"><span className="mb-2 inline-block text-[0.74rem] font-bold uppercase tracking-[0.18em] text-[#aa7f38]">Story details</span><h1 className="m-0 font-serif text-[2.45rem] font-semibold leading-none tracking-[-0.03em] text-[#2f2a25] max-[760px]:text-[2rem]">Write what happened</h1><p className="mt-3 max-w-[720px] text-[1rem] leading-6 text-[#776d62]">A calm, premium form flow shaped to match the visual rhythm of the forum.</p></div>
          <form className="grid gap-5" noValidate onSubmit={e=>{e.preventDefault();submit()}}>
            <label className="flex cursor-pointer items-start justify-between gap-5 rounded-[18px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] px-5 py-4"><span><span className="block text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">Name or anonymous</span><span className="mt-2 block text-[0.96rem] leading-6 text-[#2f2a25]">{showName?`Post as ${user?.fullName ?? 'you'}.`:'Post anonymously.'}</span></span><span className={`relative mt-0.5 inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition ${showName?'border-[#17392f] bg-[#17392f]':'border-[rgba(57,47,39,0.16)] bg-[#d9d3cb]'}`}><input className="peer sr-only" type="checkbox" checked={showName} onChange={e=>setShowName(e.target.checked)}/><span className={`absolute h-6 w-6 rounded-full bg-[#fcfaf7] shadow-[0_3px_8px_rgba(47,37,28,0.18)] transition ${showName?'translate-x-7':'translate-x-1'}`}/></span></label>

            <div className="relative grid gap-2"><label htmlFor="forum-card-search" className="text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">Card Selection</label><div className="relative"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#776d62]" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg><input id="forum-card-search" autoComplete="off" className="min-h-[54px] w-full rounded-[14px] border border-forest/15 bg-[#f7f0e7] px-4 pl-11 pr-12 text-[1rem] text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="Search saved cards to attach" type="text" value={search} onChange={e=>setSearch(e.target.value)}/></div><p className="m-0 text-[0.86rem] font-semibold text-[#776d62]">Select one saved card before publishing your story.</p>
              {search&&<div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-auto rounded-[14px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-2 shadow-[0_18px_44px_rgba(47,37,28,0.12)]">{visible.map(x=><button type="button" key={x.id} onClick={()=>{setCardId(x.card.id);setSearch('')}} className="flex w-full items-center gap-3 rounded-[10px] p-2 text-left hover:bg-[#f7f0e7]">{x.card.previewImageUrl&&<img src={x.card.previewImageUrl} className="h-10 w-14 rounded object-cover" alt=""/>}<span>{x.card.title}</span></button>)}</div>}
              {selected&&<div className="mt-2 flex items-center gap-3 rounded-[14px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-3">{selected.card.previewImageUrl&&<img src={selected.card.previewImageUrl} className="h-12 w-16 rounded object-cover" alt=""/>}<span className="font-semibold text-[#2f2a25]">{selected.card.title}</span><button type="button" className="ml-auto text-sm text-forest underline" onClick={()=>setCardId('')}>Change</button></div>}
            </div>

            <div className="grid gap-2"><div className="flex items-center justify-between gap-4"><label htmlFor="story-title" className="text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">Story Title</label></div><div className="relative"><input id="story-title" aria-invalid="false" className="min-h-[54px] w-full rounded-[14px] border border-forest/15 bg-[#f7f0e7] px-4 text-[1rem] text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="A few words to frame the moment" name="title" value={title} onChange={e=>setTitle(e.target.value)}/></div></div>
            <div className="grid gap-2"><div className="flex items-center justify-between gap-4"><label htmlFor="what-happened" className="text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">What happened?</label></div><textarea id="what-happened" aria-invalid="false" className="min-h-[132px] w-full resize-y rounded-[14px] border border-forest/15 bg-[#f7f0e7] px-4 py-3 text-[1rem] text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="Share the memory, why you chose the card, or what the gesture meant." name="description" value={body} onChange={e=>setBody(e.target.value)}/></div>
            {error&&<p className="m-0 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <div className="flex items-end justify-between gap-5 pt-1 max-[760px]:flex-col max-[760px]:items-stretch"><p className="m-0 max-w-[580px] text-[0.92rem] leading-6 text-[#776d62]">Your story will be added in the forum as a calm editorial post with your selected card, title, card category, and user name.</p><button type="submit" disabled={sending} className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[10px] bg-forest px-7 text-[1rem] font-bold text-ivory shadow-[0_16px_30px_rgba(23,57,47,0.16)] transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>{sending?'Publishing…':'Submit Story'}</button></div>
          </form>
        </section>

        <section className="rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-7 shadow-[0_18px_44px_rgba(47,37,28,0.05)] h-fit"><div className="mb-6"><span className="mb-2 inline-block text-[0.74rem] font-bold uppercase tracking-[0.18em] text-[#aa7f38]">Posting notes</span><h1 className="m-0 font-serif text-[2.45rem] font-semibold leading-none tracking-[-0.03em] text-[#2f2a25] max-[760px]:text-[2rem]">What gets added</h1><p className="mt-3 max-w-[720px] text-[1rem] leading-6 text-[#776d62]"/></div><div className="-mt-3">{[['Story details','Your title, story, time marker, and category become the main forum post content.'],['Name or anonymous','Use the toggle to decide whether your account name appears beside the story.'],['Attached card','If a card is selected, it appears visually beside your story in the forum post. A saved card is required before publishing.']].map(([h,p])=><div key={h} className="border-b border-[rgba(57,47,39,0.09)] py-4 last:border-b-0"><h3 className="m-0 text-[0.96rem] font-extrabold text-[#2f2a25]">{h}</h3><p className="m-0 mt-2 text-[0.95rem] leading-6 text-[#776d62]">{p}</p></div>)}</div></section>
      </div>
    </main>
  </main>
}
