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

  return <main className="bg-[#f8f3eb] text-[#2b2621] min-h-[calc(100vh-88px)] px-8 py-8 md:px-12 lg:px-16">
    <section className="mx-auto max-w-[1420px] rounded-[30px] border border-[rgba(74,60,47,.13)] bg-[#fcfaf7] px-9 py-10 shadow-[0_15px_38px_rgba(45,34,24,.05)] md:px-12 lg:px-14">
      <div className="grid min-h-[280px] items-center gap-8 md:grid-cols-[1.2fr_.8fr]">
        <div>
          <h1 className="font-serif text-[clamp(3.6rem,6vw,5.3rem)] font-semibold leading-[.9] tracking-[-.045em]">Shared Moments</h1>
          <p className="mt-5 max-w-[520px] font-serif text-[1.55rem] leading-[1.3] text-[#756a60]">See how others are expressing what<br/>words alone cannot.</p>
          <Link to="/forum/share" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-[9px] bg-[#17392f] px-6 font-semibold text-[#f7f3ec] shadow-[0_10px_24px_rgba(23,57,47,.13)]"><span className="text-xl">＋</span>Share Your Story</Link>
          <p className="mt-4 text-[.98rem] text-[#7d746b]">A warmer, quieter space for memory, gratitude, repair, and celebration.</p>
        </div>
        <div className="relative hidden h-[210px] md:block">
          <div className="absolute right-[70px] top-[72px] h-[105px] w-[260px] rotate-[-7deg] rounded-[8px] bg-[#174234] shadow-[0_18px_30px_rgba(20,30,24,.13)]"/>
          <div className="absolute right-[20px] top-[18px] w-[165px] rotate-[7deg] rounded-[8px] border border-[#e8ded0] bg-[#fbf7ef] p-5 font-serif text-[1.45rem] italic leading-[1.12] text-[#5a5048] shadow-[0_16px_30px_rgba(45,34,24,.10)]">I couldn't<br/>say all of<br/>it, so I<br/>sent the<br/>card first.</div>
        </div>
      </div>
    </section>

    <div className="mx-auto mt-5 flex max-w-[1420px] flex-wrap gap-3">
      <button onClick={()=>setCollectionId('')} className={`rounded-full border px-5 py-3 text-sm font-semibold ${!collectionId?'border-[#17392f] bg-[#17392f] text-white':'border-[#dfd4c6] bg-[#f7f1e8] text-[#5e544a]'}`}>All Stories</button>
      {collections.map(c=><button key={c.id} onClick={()=>setCollectionId(c.id)} className={`rounded-full border px-5 py-3 text-sm font-semibold ${collectionId===c.id?'border-[#17392f] bg-[#17392f] text-white':'border-[#dfd4c6] bg-[#f7f1e8] text-[#5e544a]'}`}>{c.name}</button>)}
    </div>

    <section className="mx-auto mt-5 min-h-[550px] max-w-[1420px] rounded-[30px] border border-[rgba(74,60,47,.13)] bg-[#fcfaf7] px-7 py-8 shadow-[0_15px_38px_rgba(45,34,24,.04)] md:px-9">
      <div className="mb-7"><span className="text-[12px] font-semibold uppercase tracking-[.18em] text-[#a98643]">Community Feed</span><h2 className="mt-2 font-serif text-[3rem] font-semibold leading-none tracking-[-.035em]">Stories that stayed</h2><p className="mt-3 text-[#7d746b]">A spacious, literary feed for the moments people chose to keep and share.</p></div>
      <label className="flex h-14 items-center gap-3 rounded-full border border-[#ded3c6] bg-[#f6efe5] px-6 text-[#81766c]"><span>⌕</span><input className="w-full bg-transparent outline-none" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stories by title"/></label>
      {loading?<div className="grid min-h-[330px] place-items-center text-[#81766c]">Loading stories…</div>:error?<div className="grid min-h-[330px] place-items-center text-[#9a443d]">{error}</div>:posts.length===0?<div className="grid min-h-[330px] place-items-center text-center"><div><h3 className="font-serif text-[2.9rem] font-semibold">No stories found</h3><p className="mt-4 text-[#81766c]">Try changing the search or collection filter.</p></div></div>:<div className="mt-7 grid gap-5 lg:grid-cols-2">{posts.map(post=><article key={post.id} className="rounded-[24px] border border-[#e3d9cc] bg-white/50 p-6 shadow-[0_8px_20px_rgba(45,34,24,.04)]"><div className="flex gap-5"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-[.13em] text-[#a98643]"><span>{post.category}</span><span>·</span><span>{formatDate(post.createdAt)}</span></div><h3 className="font-serif text-[2rem] font-semibold leading-[1]">{post.title}</h3><p className="mt-4 whitespace-pre-wrap text-[.98rem] leading-7 text-[#6f655b]">{post.body}</p><p className="mt-5 text-sm font-medium text-[#4e453e]">— {post.authorName}</p></div>{post.card&&<Link to={`/cards/${post.card.id}`} className="w-[112px] shrink-0"><div className="overflow-hidden rounded-[10px] border border-[#e5dacd] bg-[#f2ebe1] shadow-sm">{post.card.previewImageUrl?<img src={post.card.previewImageUrl} alt={post.card.title} className="aspect-[7/5] w-full object-cover"/>:<div className="grid aspect-[7/5] place-items-center p-3 text-center font-serif text-sm">{post.card.title}</div>}</div><div className="mt-2 line-clamp-2 text-xs text-[#6f655b]">{post.card.title}</div></Link>}</div></article>)}</div>}
    </section>
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

  if(profileActive===false)return <main className="bg-[#f8f3eb] px-8 py-16 min-h-[70vh]"><section className="mx-auto max-w-[900px] rounded-[30px] border border-[#e3d9cc] bg-[#fcfaf7] p-12 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e6e7e1] text-3xl text-[#17392f]">▢</div><h1 className="mt-6 font-serif text-[3rem] font-semibold">Subscribe to Share Your Story</h1><p className="mx-auto mt-4 max-w-[600px] text-[#786d63]">Stories are connected to cards in your saved Library, which is available to active subscribers.</p><Link to="/library" className="mt-7 inline-flex rounded-full bg-[#17392f] px-7 py-4 font-semibold text-white">Go to Library</Link></section></main>

  return <main className="bg-[#f8f3eb] px-8 py-8 text-[#2b2621] md:px-12 lg:px-16">
    <div className="mx-auto max-w-[1420px]"><Link to="/forum" className="inline-flex rounded-full border border-[#ded3c6] bg-[#fcfaf7] px-5 py-3 text-sm font-semibold">Back to Forum</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-[30px] border border-[#e2d8cb] bg-[#fcfaf7] p-7 shadow-[0_15px_38px_rgba(45,34,24,.05)] md:p-9">
          <span className="text-[12px] font-semibold uppercase tracking-[.18em] text-[#a98643]">Story Details</span><h1 className="mt-2 font-serif text-[3.2rem] font-semibold leading-none">Write what happened</h1><p className="mt-4 text-[1.05rem] text-[#766c62]">A calm, premium form flow shaped to match the visual rhythm of the forum.</p>
          <div className="mt-7 flex items-center justify-between rounded-[20px] border border-[#dfd4c6] bg-[#f8f2e9] px-5 py-5"><div><div className="text-[12px] font-semibold uppercase tracking-[.18em] text-[#6c6258]">Name or Anonymous</div><div className="mt-2 text-lg">{showName?`Post as ${user?.fullName}.`:'Post anonymously.'}</div></div><button onClick={()=>setShowName(v=>!v)} aria-label="Toggle name visibility" className={`relative h-10 w-16 rounded-full transition ${showName?'bg-[#17392f]':'bg-[#cfc7bd]'}`}><span className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition ${showName?'left-7':'left-1'}`}/></button></div>
          <div className="mt-6"><label className="text-[12px] font-semibold uppercase tracking-[.18em] text-[#6c6258]">Card Selection</label><label className="mt-3 flex h-14 items-center gap-3 rounded-[12px] border border-[#d9cfc3] bg-[#f7efe4] px-5"><span>⌕</span><input className="w-full bg-transparent outline-none" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search saved cards to attach"/></label><p className="mt-2 text-sm text-[#665c53]">Select one saved card before publishing your story.</p>
            {search&&<div className="mt-2 max-h-48 overflow-auto rounded-xl border border-[#e0d6ca] bg-white p-2">{visible.map(x=><button key={x.id} onClick={()=>{setCardId(x.card.id);setSearch('')}} className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[#f7f1e8]">{x.card.previewImageUrl&&<img src={x.card.previewImageUrl} className="h-10 w-14 rounded object-cover" alt=""/>}<span>{x.card.title}</span></button>)}</div>}
            {selected&&<div className="mt-3 flex items-center gap-4 rounded-xl border border-[#e0d6ca] bg-white p-3">{selected.card.previewImageUrl&&<img src={selected.card.previewImageUrl} className="h-16 w-24 rounded object-cover" alt=""/>}<div><strong className="font-serif text-xl">{selected.card.title}</strong><div className="text-sm text-[#7c7167]">Selected saved card</div></div><button className="ml-auto text-sm underline" onClick={()=>setCardId('')}>Change</button></div>}
          </div>
          <label className="mt-6 block text-[12px] font-semibold uppercase tracking-[.18em] text-[#6c6258]">Story Title<input className="mt-3 h-14 w-full rounded-[9px] border border-[#d9cfc3] bg-white px-5 text-base font-normal tracking-normal outline-none" value={title} onChange={e=>setTitle(e.target.value)} placeholder="A few words to frame the moment"/></label>
          <label className="mt-6 block text-[12px] font-semibold uppercase tracking-[.18em] text-[#6c6258]">What Happened?<textarea className="mt-3 min-h-[150px] w-full rounded-[9px] border border-[#d9cfc3] bg-white p-5 text-base font-normal leading-7 tracking-normal outline-none" value={body} onChange={e=>setBody(e.target.value)} placeholder="Share the memory, why you chose the card, or what the gesture meant."/></label>
          {error&&<div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="mt-6 flex items-center justify-between gap-5 border-t border-[#e8ded2] pt-6"><p className="max-w-[620px] text-sm leading-6 text-[#756b61]">Your story will be added in the forum as a calm editorial post with your selected card, title, card collection, and user name.</p><button onClick={submit} disabled={sending} className="shrink-0 rounded-[8px] bg-[#17392f] px-7 py-4 font-semibold text-white disabled:opacity-60">➤ &nbsp; {sending?'Publishing…':'Submit Story'}</button></div>
        </section>
        <aside className="h-fit rounded-[30px] border border-[#e2d8cb] bg-[#fcfaf7] p-8 shadow-[0_15px_38px_rgba(45,34,24,.05)]"><span className="text-[12px] font-semibold uppercase tracking-[.18em] text-[#a98643]">Posting Notes</span><h2 className="mt-2 font-serif text-[3rem] font-semibold leading-none">What gets added</h2>{[['Story details','Your title, story, and card collection become the main forum post content.'],['Name or anonymous','Use the toggle to decide whether your account name appears beside the story.'],['Attached card','If a card is selected, it appears visually beside your story in the forum post. A saved card is required before publishing.']].map(([h,p])=><div key={h} className="border-b border-[#e7ddd1] py-5 last:border-0"><h3 className="font-semibold">{h}</h3><p className="mt-3 leading-7 text-[#766c62]">{p}</p></div>)}</aside>
      </div>
    </div>
  </main>
}
