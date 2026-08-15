import { useEffect, useMemo, useState } from 'react'
import { getCollections, getLibrary, getMyOrders } from '../../services/api'
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
    <div class="min-w-0 flex-[0_0_250px] gap-[20px]">
      <a class="block w-full max-w-[15.625rem]" href="/love-notes/${encodeURIComponent(collection.id)}">
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
          <div class="flex items-center justify-between gap-6">
            <div>
              <h2 class="font-serif text-[34px] font-semibold leading-none tracking-[-0.02em] text-charcoal">Collections</h2>
              <p class="mt-2 max-w-[520px] text-sm leading-6 text-muted">Explore Laurentine Love Notes by collection.</p>
            </div>
            <div class="shrink-0">
              <button type="button" data-home-collections-next aria-label="Scroll collections right" title="Scroll collections" class="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#17392f] text-[#f7f3ec] shadow-[0_12px_24px_rgba(23,57,47,0.12)] transition hover:-translate-y-px hover:bg-[#102f28] focus:outline-none focus:ring-2 focus:ring-[#17392f]/25 focus:ring-offset-2 focus:ring-offset-[#f6f2ec]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
              </button>
            </div>
          </div>
          <div data-home-collections-scroll class="overflow-x-hidden overflow-y-hidden pb-2 [scrollbar-width:thin] scroll-smooth">
            <div class="flex touch-pan-y gap-8 w-max min-w-full">${tiles}</div>
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

  return <main className="flex-1 bg-[#f8f5ef] text-[#302b27]">
    <section className="border-b border-[#ded8cf] bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,.9),transparent_28%),linear-gradient(180deg,#fbf9f5,#f6f2ec)]">
      <div className="mx-auto grid min-h-[600px] w-[min(1400px,calc(100%_-_112px))] grid-cols-[1fr_1.02fr] items-center gap-14 py-8 max-[900px]:w-[calc(100%_-_40px)] max-[900px]:grid-cols-1 max-[900px]:py-16">
        <div className="max-w-[590px]">
          <p className="mb-7 text-[13px] font-semibold uppercase tracking-[.19em] text-[#b28b3f]">Your Poetry Library</p>
          <h1 className="m-0 font-serif text-[clamp(4.3rem,6.2vw,6.8rem)] font-medium leading-[.88] tracking-[-.045em]">Return to What<br/>Matters.<br/><em className="font-normal not-italic text-[#285247]">Beautifully.</em></h1>
          <p className="mt-7 max-w-[480px] font-serif text-[22px] leading-[1.55] text-[#81766d]">A calm, curated dashboard for browsing meaningful poetry cards, revisiting saved pieces, and choosing what to share next.</p>
          <Link to="/love-notes" className="mt-7 inline-flex min-h-14 items-center gap-6 rounded-[9px] bg-[#123e34] px-6 text-[15px] font-medium text-white shadow-[0_10px_22px_rgba(20,55,47,.16)]">Start Your Journey <span className="text-xl">›</span></Link>
        </div>
        <div className="relative min-h-[520px] max-[900px]:hidden" aria-hidden="true">
          <div className="absolute left-[18%] top-[31%] h-[250px] w-[310px] rotate-[-8deg] rounded-[24px_24px_8px_8px] bg-[#173f35] shadow-[0_24px_44px_rgba(34,30,25,.16)]"/>
          <div className="absolute left-[28%] top-[8%] h-[430px] w-[340px] rotate-[7deg] rounded-[9px] border border-[#e5ded4] bg-[#faf7f1] px-12 py-12 shadow-[0_25px_45px_rgba(35,28,22,.15)] before:absolute before:inset-0 before:bg-[repeating-linear-gradient(to_bottom,transparent_0_31px,rgba(80,68,55,.07)_31px_32px)] before:content-['']">
            <p className="relative z-10 font-serif text-[29px] italic leading-[1.42] text-[#514941]">Some bonds<br/>don't need<br/>words.<br/>They live in<br/>the little<br/>things,<br/>in the way<br/>you<br/>understand,<br/>without<br/>needing to<br/>explain.</p>
            <span className="absolute bottom-5 right-6 z-10 text-xs text-[#9a8879]">TM</span>
          </div>
          <div className="absolute bottom-[72px] right-[4%] h-[180px] w-[2px] rotate-[25deg] bg-[#82976f] before:absolute before:-left-4 before:top-9 before:h-4 before:w-8 before:rotate-[18deg] before:rounded-full before:bg-[#9aac8e] before:content-[''] after:absolute after:-left-5 after:top-[78px] after:h-4 after:w-8 after:rotate-[38deg] after:rounded-full after:bg-[#9aac8e] after:content-['']"/>
        </div>
      </div>
    </section>

    <section className="grid grid-cols-3 border-b border-[#ded8cf] bg-[#faf8f4] max-[700px]:grid-cols-1">
      {[[savedCount,'Saved Cards','⌘'],[orderCount,'Orders','♡'],[0,'Requests Submitted','✎']].map(([value,label,icon],i)=><div key={String(label)} className={`flex min-h-[92px] items-center justify-center gap-5 ${i<2?'border-r border-[#ded8cf] max-[700px]:border-r-0 max-[700px]:border-b':''}`}><span className="grid h-11 w-11 place-items-center rounded-full bg-[#f1e9dc] text-xl text-[#31584e]">{icon}</span><div><strong className="block font-serif text-[25px] font-normal">{value}</strong><span className="text-[14px] text-[#756b62]">{label}</span></div></div>)}
    </section>

    <section className="mx-auto min-h-[530px] w-[min(1400px,calc(100%_-_112px))] py-12 max-[900px]:w-[calc(100%_-_40px)]">
      {loading ? <p>Loading collections…</p> : error ? <p>{error}</p> : <>
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-[31px]">{collections[0]?.name ?? 'Love'}</h2><p className="mt-1 text-[14px] text-[#786f66]">{collections[0]?.description}</p></div><Link to="/love-notes" className="grid h-12 w-12 place-items-center rounded-full bg-[#123e34] text-2xl text-white shadow-lg">›</Link></div>
        <div className="flex gap-6 overflow-x-auto pb-3">
          {collections.map(c=><Link key={c.id} to={`/love-notes/${encodeURIComponent(c.id)}`} className="shrink-0"><article className="relative flex h-[370px] w-[220px] flex-col justify-between overflow-hidden rounded-[9px] bg-[linear-gradient(135deg,#59383d,#8c5c60_55%,#aa7770)] p-5 text-[#fff9f2] shadow-sm"><span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#f8f4ed] text-[#17392f]">♙</span><h3 className="max-w-[150px] font-serif text-[30px] leading-[.95]">{c.name}</h3><p className="font-serif text-[16px] leading-[1.25]">{c.description}</p></article></Link>)}
        </div>
      </>}
    </section>

    <section className="mx-auto mb-12 w-[min(1400px,calc(100%_-_112px))] rounded-[26px] bg-[radial-gradient(circle_at_8%_20%,#214c40,#103a31_48%,#17483d)] px-10 py-12 text-center text-white shadow-[0_16px_34px_rgba(23,57,47,.12)] max-[900px]:w-[calc(100%_-_40px)]">
      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#d9bd80]">Ready to Begin?</p><h2 className="mt-3 font-serif text-[42px]">Make It Yours. Share Beauty.</h2><p className="mx-auto mt-2 max-w-[760px] text-[14px] text-[#e0d8ce]">Continue browsing, personalize your message, and use one of your remaining cards when the moment feels right.</p>
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
    const scroller = document.querySelector<HTMLElement>('[data-home-collections-scroll]')
    if (!nextButton || !scroller) return

    const onNext = () => {
      const tile = scroller.querySelector<HTMLElement>('[class*="flex-[0_0_250px]"]')
      const gap = 32
      const step = (tile?.offsetWidth ?? 250) + gap
      const atEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 8
      scroller.scrollTo({ left: atEnd ? 0 : Math.min(scroller.scrollLeft + step, scroller.scrollWidth), behavior: 'smooth' })
    }

    nextButton.addEventListener('click', onNext)
    return () => nextButton.removeEventListener('click', onNext)
  }, [collections, collectionsLoading, collectionsError])

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
export function LoveInActionPage(){return <ContentPage eyebrow="Stories" title="Love In Action"><p>This route preserves the approved Love In Action section and is ready for the existing website content.</p></ContentPage>}
export function MonthlyChallengesPage(){return <ContentPage eyebrow="Monthly Challenges" title="A meaningful challenge each month"><p>The specification requires this feature to remain without major functional changes. Existing challenge rules/content should be migrated here.</p></ContentPage>}
export function ScavengerHuntPage(){return <ContentPage eyebrow="Scavenger Hunt" title="Scavenger Hunt"><p>The approved Scavenger Hunt customer flow belongs here. Existing rules, progress and completion behavior should be migrated rather than redesigned from assumptions.</p></ContentPage>}
export function FaqPage(){return <ContentPage eyebrow="Help" title="Frequently Asked Questions"><div className="faq-list">{['How do Love Notes work?','What size is my downloaded card?','Is the downloaded PDF the same as my preview?','Are Love Notes single-sided?'].map((q,i)=><details key={q}><summary>{q}</summary><p>{i===1?'Every Love Note is 5 × 7 inches in landscape orientation.':i===2?'The current implementation previews the supplied card artwork and downloads the matching client-supplied PDF, avoiding a separately recreated design.':i===3?'Yes. Cards are front-side only, with one card per PDF page.':'Choose an approved collection and card, preview the supplied artwork, then download its matching PDF.'}</p></details>)}</div></ContentPage>}
