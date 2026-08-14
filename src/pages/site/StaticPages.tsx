import { useEffect, useMemo, useState } from 'react'
import { getCollections } from '../../services/api'
import type { LoveNoteCollection } from '../../types/loveNote'
import { HOME_REFERENCE_MARKUP } from './homeReferenceMarkup'

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

export function HomePage() {
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

  return <main className="flex-1 flex flex-col" dangerouslySetInnerHTML={{ __html: markup }} />
}

export function AboutPage(){return <ContentPage eyebrow="About" title="About Me"><p>This route preserves the approved About Me section. Replace this placeholder copy with the existing approved website content when supplied.</p></ContentPage>}
export function LoveInActionPage(){return <ContentPage eyebrow="Stories" title="Love In Action"><p>This route preserves the approved Love In Action section and is ready for the existing website content.</p></ContentPage>}
export function MonthlyChallengesPage(){return <ContentPage eyebrow="Monthly Challenges" title="A meaningful challenge each month"><p>The specification requires this feature to remain without major functional changes. Existing challenge rules/content should be migrated here.</p></ContentPage>}
export function ScavengerHuntPage(){return <ContentPage eyebrow="Scavenger Hunt" title="Scavenger Hunt"><p>The approved Scavenger Hunt customer flow belongs here. Existing rules, progress and completion behavior should be migrated rather than redesigned from assumptions.</p></ContentPage>}
export function FaqPage(){return <ContentPage eyebrow="Help" title="Frequently Asked Questions"><div className="faq-list">{['How do Love Notes work?','What size is my downloaded card?','Is the downloaded PDF the same as my preview?','Are Love Notes single-sided?'].map((q,i)=><details key={q}><summary>{q}</summary><p>{i===1?'Every Love Note is 5 × 7 inches in landscape orientation.':i===2?'The current implementation previews the supplied card artwork and downloads the matching client-supplied PDF, avoiding a separately recreated design.':i===3?'Yes. Cards are front-side only, with one card per PDF page.':'Choose an approved collection and card, preview the supplied artwork, then download its matching PDF.'}</p></details>)}</div></ContentPage>}
