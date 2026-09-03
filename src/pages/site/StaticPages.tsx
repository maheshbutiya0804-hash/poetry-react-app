import { useEffect, useMemo, useState } from 'react'
import { getCollections, getLibrary, getMyOrders, getScavengerLocations, type ScavengerLocation } from '../../services/api'
import type { LoveNoteCollection } from '../../types/loveNote'
import { HOME_REFERENCE_MARKUP } from './homeReferenceMarkup'
import { useAuth } from '../../auth/AuthContext'
import { Link } from 'react-router-dom'

function ContentPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <main className="hs-page"><section className="hs-page-hero"><p>{eyebrow}</p><h1>{title}</h1></section><section className="hs-content">{children}</section></main>
}

type HomeCollection = LoveNoteCollection

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function collectionMarkup(collections: HomeCollection[], loading: boolean, error: string) {
  if (loading) {
    return `<div aria-live="polite"><section class="border-b border-[rgba(74,60,47,0.12)] py-16 max-[760px]:py-11"><div class="mx-auto w-[min(1360px,calc(100%_-_56px))] max-[760px]:w-[min(100%,calc(100%_-_24px))]"><p class="text-sm text-[#7d746b]">Loading collections…</p></div></section></div>`
  }
  if (error) {
    return `<div aria-live="polite"><section class="border-b border-[rgba(74,60,47,0.12)] py-16 max-[760px]:py-11"><div class="mx-auto w-[min(1360px,calc(100%_-_56px))] max-[760px]:w-[min(100%,calc(100%_-_24px))]"><p class="text-sm text-[#7d746b]">${escapeHtml(error)}</p></div></section></div>`
  }
  if (!collections.length) {
    return `<div aria-live="polite"><section class="border-b border-[rgba(74,60,47,0.12)] py-16 max-[760px]:py-11"><div class="mx-auto w-[min(1360px,calc(100%_-_56px))] max-[760px]:w-[min(100%,calc(100%_-_24px))]"><p class="text-sm text-[#7d746b]">No collections are available yet.</p></div></section></div>`
  }

  const tiles = collections.map((collection) => `
    <div class="home-collection-slide">
      <a href="/love-notes/${encodeURIComponent(collection.id)}">
        <article class="relative w-full overflow-hidden select-none rounded-[10px] ring-1 ring-[rgba(255,255,255,0.14)] card-tile-size before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,14,10,0.10)_100%)] before:content-[''] bg-[radial-gradient(circle_at_20%_14%,rgba(255,255,255,0.08)_0%,transparent_18%),radial-gradient(circle_at_80%_78%,rgba(182,108,96,0.20)_0%,transparent_28%),linear-gradient(135deg,#352d5b_0%,#4b416f_38%,#6d5672_68%,#9d6a61_100%)] text-white" style="--card-preview-color:#fffaf3;--card-preview-shadow:0 1px 2px rgba(20,16,12,0.18);--card-title-color:#fffaf3;background-image:radial-gradient(circle at 19% 33%,rgba(234,200,189,0.12) 0%,transparent 24%),radial-gradient(circle at 86% 77%,rgba(255,255,255,0.07) 0%,transparent 28%),linear-gradient(128deg,rgb(65,39,43) 0%,rgb(122,80,84) 46%,rgb(162,118,110) 100%);color:rgb(255,250,243);">
          <div aria-label="Locked preview" class="absolute right-3.5 top-3.5 z-[3] inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(251,248,244,0.92)] text-forest shadow-[0_6px_14px_rgba(23,57,47,0.12)]">
            <svg aria-hidden="true" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>
          </div>
          <div class="absolute inset-0 z-[1] flex flex-col p-[16px_16px_18px]">
            <div class="flex max-w-[15ch] flex-1 flex-col justify-between gap-3">
              <h3 class="m-0 font-serif text-4xl font-semibold leading-[0.98] text-(--card-title-color,currentColor)">${escapeHtml(collection.name)}</h3>
              <p class="m-0 font-serif text-md leading-[1.28] text-[var(--card-preview-color,currentColor)] [text-shadow:var(--card-preview-shadow,none)] md:text-lg">${escapeHtml(collection.description || '')}</p>
            </div>
          </div>
        </article>
      </a>
    </div>`).join('')

  return `<div aria-live="polite">
    <section class="border-b border-[rgba(74,60,47,0.12)] py-16 max-[760px]:py-11">
      <div class="mx-auto w-[min(1360px,calc(100%_-_56px))] max-[760px]:w-[min(100%,calc(100%_-_24px))]">
        <section class="flex flex-col gap-5">
          <div>
            <h2 class="font-serif text-[34px] font-semibold leading-none tracking-[-0.02em] text-charcoal">Collections</h2>
            <p class="mt-2 max-w-[520px] text-sm leading-6 text-muted">Explore Laurentine Love Notes by collection.</p>
          </div>
          <div data-home-collections-scroll class="home-collections-scroller">
            <div class="home-collections-track">${tiles}</div>
          </div>
          <div class="home-collections-controls">
            <button type="button" data-home-collections-prev aria-label="Scroll collections left" title="Previous collection" class="home-collections-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
            </button>
            <button type="button" data-home-collections-next aria-label="Scroll collections right" title="Next collection" class="home-collections-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
            </button>
          </div>
        </section>
      </div>
    </section>
  </div>`
}


function LoggedInHome({ collections, loading, error }: { collections: HomeCollection[]; loading: boolean; error: string }) {
  const [savedCount, setSavedCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getLibrary(), getMyOrders()]).then(([library, orders]) => {
      if (cancelled) return
      if (library.status === 'fulfilled') setSavedCount(library.value.length)
      if (orders.status === 'fulfilled') setOrderCount(orders.value.orders.length)
    })
    return () => { cancelled = true }
  }, [])

  return <main className="flex-1 flex flex-col">
    <section className="flex flex-1 flex-col bg-[#f7f4ef] pb-[42px] text-[#2f2a25]">
      <section className="grid min-h-[470px] grid-cols-[1.05fr_1fr] items-stretch border-b border-[rgba(57,47,39,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0))] max-[1180px]:grid-cols-1">
        <div className="flex flex-col justify-center gap-[18px] px-16 py-[72px] pb-16 max-[1180px]:px-7 max-[760px]:px-[18px] max-[760px]:pb-[34px] max-[760px]:pt-11">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-[#a88437]">Your Poetry Library</div>
          <h1 className="m-0 font-serif text-[clamp(52px,6vw,78px)] font-semibold leading-[0.95] tracking-[-0.03em]">Return to What Matters.<em className="block font-medium italic text-[#274a3f]">Beautifully.</em></h1>
          <p className="m-0 max-w-[33ch] font-serif text-[22px] leading-[1.35] text-[#776d62]">A calm, curated dashboard for browsing meaningful poetry cards, revisiting saved pieces, and choosing what to share next.</p>
          <div className="mt-2 flex flex-wrap items-center gap-3.5"><Link to="/love-notes" className="inline-flex min-h-[54px] items-center justify-center gap-2.5 rounded-[10px] border border-transparent bg-[#17392f] px-[22px] text-[#f7f3ec] shadow-[0_12px_24px_rgba(23,57,47,0.18)] transition hover:-translate-y-px hover:shadow-[0_16px_32px_rgba(23,57,47,0.22)]"><span>Start Your Journey</span><svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></Link></div>
        </div>
        <div className="relative flex min-h-[470px] items-center justify-center overflow-hidden px-[60px] py-[46px] pb-[42px] pl-6 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_15%_50%,rgba(0,0,0,0.04),transparent_22%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.28),transparent_18%)] before:content-[''] max-[1180px]:px-7 max-[760px]:min-h-[360px] max-[760px]:px-[18px] max-[760px]:py-5 max-[760px]:pb-[34px]">
          <div className="absolute h-[260px] w-[340px] -rotate-[8deg] rounded-[18px] bg-[linear-gradient(180deg,#254836,#183227)] shadow-[0_28px_50px_rgba(16,39,31,0.22)] before:absolute before:left-0 before:right-0 before:top-0 before:m-auto before:h-0 before:w-0 before:rounded-[10px] before:border-l-[170px] before:border-r-[170px] before:border-t-[126px] before:border-l-transparent before:border-r-transparent before:border-t-white/5 before:content-[''] max-[760px]:h-[196px] max-[760px]:w-[258px] max-[760px]:before:border-l-[129px] max-[760px]:before:border-r-[129px] max-[760px]:before:border-t-[96px]"/>
          <div className="relative min-h-[248px] w-[360px] translate-x-10 -translate-y-1.5 rotate-[7deg] overflow-hidden rounded-lg border border-[rgba(73,58,45,0.08)] bg-[linear-gradient(180deg,#fbf7f1,#f4ece1)] px-8 py-[34px] pb-[26px] shadow-[0_26px_40px_rgba(41,30,21,0.18)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent_34%),repeating-linear-gradient(to_bottom,transparent_0_34px,rgba(90,74,59,0.04)_34px_35px)] before:content-[''] max-[760px]:min-h-[196px] max-[760px]:w-[280px] max-[760px]:translate-x-2 max-[760px]:-translate-y-1 max-[760px]:rotate-[6deg] max-[760px]:px-[22px] max-[760px]:py-6 max-[760px]:pb-5"><p className="relative z-[1] m-0 max-w-[11ch] whitespace-pre-line font-serif text-[29px] leading-[1.3] text-[#40362f] max-[760px]:text-[23px]">Some bonds don't need words.{"\n"}They live in the little things,{"\n"}in the way you understand,{"\n"}without needing to explain.</p><span className="absolute bottom-[18px] right-[22px] text-xs text-[#8e8070]">TM</span></div>
          <div className="absolute bottom-[84px] right-[88px] h-[190px] w-[3px] rotate-[25deg] rounded-full bg-[#7f8f72] opacity-[0.82] before:absolute before:left-[-9px] before:top-[38px] before:h-3 before:w-[22px] before:-rotate-[30deg] before:rounded-[18px_18px_18px_0] before:bg-[#9bac92] before:content-[''] after:absolute after:right-[-11px] after:top-[78px] after:h-3 after:w-[22px] after:rotate-[20deg] after:rounded-[18px_18px_18px_0] after:bg-[#9bac92] after:content-['']"/>
        </div>
      </section>

      <section className="grid grid-cols-3 border-b border-[rgba(57,47,39,0.12)] bg-[rgba(252,250,247,0.76)] max-[760px]:grid-cols-1">
        {[[savedCount,'Saved Cards','⌘','/library'],[orderCount,'Orders','♡','/orders'],[0,'Requests Submitted','✎','/library?tab=requests']].map(([value,label,icon,to],i)=><Link key={String(label)} to={String(to)}><div className={`flex cursor-pointer items-center justify-center gap-4 border-r border-[rgba(57,47,39,0.12)] px-[34px] py-[26px] max-[760px]:justify-start max-[760px]:border-b max-[760px]:border-r-0 max-[760px]:px-[18px] ${i===2?'border-r-0 max-[760px]:border-b-0':''}`}><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#f4ecdf] text-xl text-[#274a3f]">{icon}</div><div><strong className="block font-serif text-[32px] font-semibold leading-[0.95]">{value}</strong><span className="mt-1 block text-sm text-[#776d62]">{label}</span></div></div></Link>)}
      </section>

      <section className="px-16 pb-12 pt-10 max-[1180px]:px-7 max-[760px]:px-[18px] max-[760px]:pb-10">
        <section className="flex flex-col gap-5">
          <div><h2 className="font-serif text-[34px] font-semibold leading-none tracking-[-0.02em] text-charcoal">Collections</h2><p className="mt-2 max-w-[520px] text-sm leading-6 text-muted">Browse Laurentine notes for every meaningful moment.</p></div>
          {loading ? <p className="text-sm text-[#7d746b]">Loading collections…</p> : error ? <p className="text-sm text-[#7d746b]">{error}</p> : <>
            <div data-home-collections-scroll className="home-collections-scroller"><div className="home-collections-track">{collections.map(collection=><div key={collection.id} className="home-collection-slide"><Link to={`/love-notes/${encodeURIComponent(collection.id)}`}><article className="relative w-full overflow-hidden select-none rounded-[10px] ring-1 ring-[rgba(255,255,255,0.14)] card-tile-size before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(17,14,10,0.10)_100%)] before:content-[''] text-white" style={{backgroundImage:'radial-gradient(circle at 19% 33%,rgba(234,200,189,0.12) 0%,transparent 24%),radial-gradient(circle at 86% 77%,rgba(255,255,255,0.07) 0%,transparent 28%),linear-gradient(128deg,rgb(65,39,43) 0%,rgb(122,80,84) 46%,rgb(162,118,110) 100%)'}}><div aria-label="Locked preview" className="absolute right-3.5 top-3.5 z-[3] inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(251,248,244,0.92)] text-forest shadow-[0_6px_14px_rgba(23,57,47,0.12)]"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div><div className="absolute inset-0 z-[1] flex flex-col p-[16px_16px_18px]"><div className="flex max-w-[15ch] flex-1 flex-col justify-between gap-3"><h3 className="m-0 font-serif text-4xl font-semibold leading-[0.98]">{collection.name}</h3><p className="m-0 font-serif text-md leading-[1.28] md:text-lg">{collection.description}</p></div></div></article></Link></div>)}</div></div>
            <div className="home-collections-controls"><button type="button" data-home-collections-prev aria-label="Scroll collections left" title="Previous collection" className="home-collections-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg></button><button type="button" data-home-collections-next aria-label="Scroll collections right" title="Next collection" className="home-collections-arrow"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></button></div>
          </>}
        </section>
      </section>

      <section className="px-16 pt-[46px] max-[1180px]:px-7 max-[760px]:px-[18px]"><div className="relative grid min-h-[198px] place-items-center overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_15%_50%,rgba(106,136,110,0.28),transparent_18%),radial-gradient(circle_at_82%_42%,rgba(106,136,110,0.22),transparent_22%),linear-gradient(135deg,#183a31_0%,#0f241e_50%,#17392f_100%)] text-center text-[#f7f4ef] shadow-[0_22px_36px_rgba(19,43,35,0.16)] before:absolute before:left-[-20px] before:top-[-10px] before:h-[220px] before:w-[220px] before:rounded-full before:bg-[radial-gradient(circle,#8ea187_0%,transparent_62%)] before:opacity-[0.18] before:blur-lg before:content-[''] after:absolute after:bottom-[-20px] after:right-[-30px] after:h-[220px] after:w-[220px] after:rounded-full after:bg-[radial-gradient(circle,#8ea187_0%,transparent_62%)] after:opacity-[0.18] after:blur-lg after:content-['']"><div className="relative z-[1] flex flex-col items-center gap-2 p-[26px]"><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#d6be8a]">Ready to Begin?</div><h3 className="m-0 font-serif text-[54px] font-semibold leading-[0.95] tracking-[-0.03em] max-[760px]:text-[42px]">Make It Yours. Share Beauty.</h3><p className="m-0 text-base text-[rgba(247,244,239,0.86)]">Continue browsing, personalize your message, and use one of your remaining cards when the moment feels right.</p></div></div></section>
    </section>
  </main>
}

export function HomePage() {
  const { user } = useAuth()
  const [collections, setCollections] = useState<HomeCollection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [collectionsError, setCollectionsError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await getCollections()
        const visible = items
          .filter((collection) => collection.isActive !== false && Boolean(collection.id?.trim()))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        if (!cancelled) setCollections(visible)
      } catch (error) {
        if (!cancelled) setCollectionsError(error instanceof Error ? error.message : 'Unable to load collections.')
      } finally {
        if (!cancelled) setCollectionsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (collectionsLoading || collectionsError || !collections.length) return
    const nextButton = document.querySelector<HTMLButtonElement>('[data-home-collections-next]')
    const prevButton = document.querySelector<HTMLButtonElement>('[data-home-collections-prev]')
    const scroller = document.querySelector<HTMLElement>('[data-home-collections-scroll]')
    if (!nextButton || !prevButton || !scroller) return

    const getSlides = () => Array.from(scroller.querySelectorAll<HTMLElement>('.home-collection-slide'))
    const getCurrentIndex = () => {
      const slides = getSlides()
      if (!slides.length) return 0
      let nearest = 0
      let distance = Number.POSITIVE_INFINITY
      slides.forEach((slide, index) => {
        const delta = Math.abs(slide.offsetLeft - scroller.scrollLeft)
        if (delta < distance) { distance = delta; nearest = index }
      })
      return nearest
    }
    const scrollToIndex = (index: number) => {
      const slides = getSlides()
      if (!slides.length) return
      const normalized = (index + slides.length) % slides.length
      scroller.scrollTo({ left: slides[normalized].offsetLeft, behavior: 'smooth' })
    }
    const move = (direction: 1 | -1) => {
      const slides = getSlides()
      if (!slides.length) return
      const visibleCount = window.matchMedia('(max-width: 760px)').matches ? 1 : 5
      const maxStartIndex = Math.max(0, slides.length - visibleCount)
      const current = Math.min(getCurrentIndex(), maxStartIndex)
      const nextIndex = direction === 1
        ? (current >= maxStartIndex ? 0 : current + 1)
        : (current <= 0 ? maxStartIndex : current - 1)
      scrollToIndex(nextIndex)
    }
    const onNext = () => move(1)
    const onPrev = () => move(-1)

    nextButton.addEventListener('click', onNext)
    prevButton.addEventListener('click', onPrev)

    const interval = window.setInterval(() => {
      if (!document.hidden) move(1)
    }, 4000)

    return () => {
      window.clearInterval(interval)
      nextButton.removeEventListener('click', onNext)
      prevButton.removeEventListener('click', onPrev)
    }
  }, [collections, collectionsLoading, collectionsError, user])

  useEffect(() => {
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-controls^="landing-faq-answer-"]'))
    const cleanups: Array<() => void> = []

    buttons.forEach((button) => {
      const onClick = () => {
        const id = button.getAttribute('aria-controls')
        if (!id) return
        const panel = document.getElementById(id)
        const icon = button.querySelector('span:last-child')
        if (!panel) return
        const willOpen = button.getAttribute('aria-expanded') !== 'true'
        buttons.forEach((other) => {
          const otherId = other.getAttribute('aria-controls')
          const otherPanel = otherId ? document.getElementById(otherId) : null
          const otherIcon = other.querySelector('span:last-child')
          other.setAttribute('aria-expanded', 'false')
          otherPanel?.classList.remove('grid-rows-[1fr]')
          otherPanel?.classList.add('grid-rows-[0fr]')
          otherIcon?.classList.remove('rotate-180')
        })
        if (willOpen) {
          button.setAttribute('aria-expanded', 'true')
          panel.classList.remove('grid-rows-[0fr]')
          panel.classList.add('grid-rows-[1fr]')
          icon?.classList.add('rotate-180')
        }
      }
      button.addEventListener('click', onClick)
      cleanups.push(() => button.removeEventListener('click', onClick))
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [collectionsLoading])

  const markup = useMemo(() => HOME_REFERENCE_MARKUP.replace(
    '__DYNAMIC_COLLECTIONS__',
    collectionMarkup(collections, collectionsLoading, collectionsError),
  ), [collections, collectionsLoading, collectionsError])

  if (user) return <LoggedInHome collections={collections} loading={collectionsLoading} error={collectionsError} />
  return <main className="flex-1 flex flex-col" dangerouslySetInnerHTML={{ __html: markup }} />
}

export function AboutPage(){return <ContentPage eyebrow="About" title="About Me"><p>This route preserves the approved About Me section. Replace this placeholder copy with the existing approved website content when supplied.</p></ContentPage>}
export function LoveInActionPage(){return <main className="flex-1 bg-[#f7f4ef] text-[#2f2a25]">
  <section className="mx-auto w-[min(1120px,calc(100%-48px))] py-16 max-[760px]:w-[calc(100%-36px)] max-[760px]:py-10">
    <div className="mx-auto max-w-[850px] text-center"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7654]">Love in Action</span><h1 className="mt-3 font-serif text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.04em]">Love is something we live.</h1><div className="mx-auto mt-7 max-w-[760px] space-y-4 text-[1.02rem] leading-8 text-[#6f655c]"><p>Love is more than something we feel. It's something we choose, nurture, and put into action.</p><p>At Laurentine, we believe that relationships grow when couples intentionally make time for one another. Love in Action was created to inspire couples to step away from the routine, spend meaningful time together, and continue creating new memories.</p><p>Whether you're taking on one of our monthly challenges or creating a special surprise through our scavenger hunt, every experience is an opportunity to laugh together, connect, and strengthen the bond you share.</p></div></div>
    <div className="mt-14 grid grid-cols-2 gap-6 max-[820px]:grid-cols-1">
      <article className="rounded-[30px] border border-[rgba(57,47,39,.11)] bg-[#fcfaf7] p-8 shadow-[0_18px_45px_rgba(47,37,28,.05)] max-[600px]:p-6"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7654]">Monthly Challenges</span><h2 className="mt-3 font-serif text-[2.35rem] font-semibold leading-none">Make time for each other.</h2><p className="mt-5 leading-7 text-[#746a60]">Sometimes, all you need is a little inspiration to do something different together. Our monthly challenges are completely optional—but highly recommended.</p><p className="mt-3 leading-7 text-[#746a60]">Every challenge is simple, fun, affordable, and designed to build affection, strengthen your bond, and keep you creating meaningful memories together.</p><p className="mt-5 font-serif text-xl italic text-[#4f473f]">Make time. Build affection. Strengthen your bond. Keep dating each other.</p><Link to="/challenges" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#17392f] px-6 text-sm font-bold text-white">Explore Monthly Challenges</Link></article>
      <article className="rounded-[30px] border border-[rgba(57,47,39,.11)] bg-[#f2e7dc] p-8 shadow-[0_18px_45px_rgba(47,37,28,.05)] max-[600px]:p-6"><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7654]">Scavenger Hunt</span><h2 className="mt-3 font-serif text-[2.35rem] font-semibold leading-none">Let love be discovered.</h2><p className="mt-5 leading-7 text-[#746a60]">No one knows your partner better than you do. Choose a Laurentine love note and leave it somewhere you know your partner will surely find it.</p><p className="mt-3 leading-7 text-[#746a60]">A favorite chair. The bathroom mirror. Their car. Inside a book they're reading. Somewhere unexpected—but somewhere only you would know to choose.</p><p className="mt-5 font-serif text-xl italic text-[#4f473f]">Hide a note. Create a moment. Let love be discovered.</p><Link to="/scavenger-hunt" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#8d5758] px-6 text-sm font-bold text-white">Start a Scavenger Hunt</Link></article>
    </div>
    <p className="mx-auto mt-12 max-w-[760px] text-center font-serif text-[1.45rem] italic leading-8 text-[#5d534a]">Because love is beautiful when it's spoken—but it's even more powerful when it's lived.</p>
  </section>
</main>}
export function MonthlyChallengesPage(){return <ContentPage eyebrow="Monthly Challenges" title="Make time. Keep dating each other."><p>Our monthly challenges are completely optional—but highly recommended. Each one is designed to encourage couples to intentionally spend time together, build affection, strengthen their bond, and continue creating meaningful memories.</p><p>There won't be anything outlandish or expensive. Every challenge is designed to be simple, fun, and affordable, because meaningful moments don't have to come with a big price tag.</p><p>You don't have to complete every challenge. Just choose the ones that inspire you, make time for each other, and enjoy the experience.</p><Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#17392f] px-6 text-sm font-bold text-white" to="/challenges">View Current Challenge</Link></ContentPage>}
export function ScavengerHuntPage(){
 const fallback=['Favorite chair','Bathroom mirror','Their car','Inside a book they are reading','Nightstand','Coffee maker','Pillow','Lunch bag','Fridge','Bedroom door','Kitchen drawer','Office desk or favorite seat']
 const [locations,setLocations]=useState<ScavengerLocation[]>([])
 useEffect(()=>{let live=true;getScavengerLocations().then(items=>{if(live)setLocations(items)}).catch(()=>{});return()=>{live=false}},[])
 const display=locations.length?locations:fallback.map((name,index)=>({id:`fallback-${index}`,name,description:'',icon:'',imageUrl:null,isActive:true,sortOrder:index,createdAt:'',updatedAt:''}))
 return <main className="flex-1 bg-[#f7f4ef] text-[#2f2a25]"><section className="mx-auto w-[min(1060px,calc(100%-48px))] py-16 max-[760px]:w-[calc(100%-36px)] max-[760px]:py-10"><div className="mx-auto max-w-[800px] text-center"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a7654]">Love in Action · Scavenger Hunt</span><h1 className="mt-3 font-serif text-[clamp(3rem,7vw,5.3rem)] font-semibold leading-[0.92] tracking-[-0.04em]">Let love be discovered.</h1><p className="mt-6 text-[1.05rem] leading-8 text-[#6f655c]">No one knows your partner better than you do. You know the places they'll look, the routines they follow, and the little spaces where they're sure to discover something special.</p><p className="mt-4 text-[1.05rem] leading-8 text-[#6f655c]">Choose a Laurentine love note, personalize it, then leave it somewhere you know your partner will surely find it. Let the discovery become part of the experience.</p></div><div className="mt-12 rounded-[30px] border border-[rgba(57,47,39,.11)] bg-[#fcfaf7] p-8 max-[600px]:p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7654]">A little inspiration</span><h2 className="mt-2 font-serif text-[2.2rem] font-semibold">Where might they find it?</h2></div><Link to="/browse" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#8d5758] px-6 text-sm font-bold text-white">Choose a Love Note</Link></div><div className="mt-7 grid grid-cols-3 gap-3 max-[760px]:grid-cols-2 max-[480px]:grid-cols-1">{display.map((location,index)=><div key={location.id} className="overflow-hidden rounded-[18px] border border-[rgba(57,47,39,.09)] bg-[#f8f1e8]">{location.imageUrl&&<img src={location.imageUrl} alt="" className="h-[110px] w-full object-cover"/>}<div className="flex min-h-[70px] items-center gap-3 px-4 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eadbd0] text-xs font-extrabold text-[#8d5758]">{String(index+1).padStart(2,'0')}</span><span><b className="block text-sm text-[#4f473f]">{location.name}</b>{location.description&&<small className="mt-1 block leading-5 text-[#7b7066]">{location.description}</small>}</span></div></div>)}</div></div><div className="mx-auto mt-10 max-w-[760px] text-center"><p className="font-serif text-2xl italic leading-9">Because the best surprises aren't always about where you hide them. They're about knowing the person you love well enough to know exactly where they'll look.</p><p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-[#8d5758]">Hide a note. Create a moment. Let love be discovered.</p></div></section></main>
}

export function FaqPage(){return <ContentPage eyebrow="Help" title="Frequently Asked Questions"><div className="faq-list">{['How do Love Notes work?','What size is my downloaded card?','Is the downloaded PDF the same as my preview?','Are Love Notes single-sided?'].map((q,i)=><details key={q}><summary>{q}</summary><p>{i===1?'Every Love Note is 5 × 7 inches in landscape orientation.':i===2?'The current implementation previews the supplied card artwork and downloads the matching client-supplied PDF, avoiding a separately recreated design.':i===3?'Yes. Cards are front-side only, with one card per PDF page.':'Choose an approved collection and card, preview the supplied artwork, then download its matching PDF.'}</p></details>)}</div></ContentPage>}
