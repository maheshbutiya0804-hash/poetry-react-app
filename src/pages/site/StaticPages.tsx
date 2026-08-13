import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCollections } from '../../services/api'
import type { LoveNoteCollection } from '../../types/loveNote'

function ContentPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <main className="hs-page"><section className="hs-page-hero"><p>{eyebrow}</p><h1>{title}</h1></section><section className="hs-content">{children}</section></main>
}

export function HomePage() {
  const [collections, setCollections] = useState<LoveNoteCollection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [collectionsError, setCollectionsError] = useState('')

  useEffect(() => {
    getCollections()
      .then(setCollections)
      .catch(error => setCollectionsError(error instanceof Error ? error.message : 'Unable to load collections'))
      .finally(() => setCollectionsLoading(false))
  }, [])

  return <main>
    <section className="hs-home-hero"><div><p className="hs-kicker">Laurentine</p><h1>Love notes that feel as meaningful as the words inside.</h1><p>Discover Laurentine Love Notes for the moments that deserve more than ordinary words.</p><div className="hs-actions"><Link className="button" to="/love-notes">Browse Love Notes</Link><Link className="secondary-button" to="/love-in-action">Love In Action</Link></div></div><div className="hero-card-demo"><span>5 × 7 landscape</span><strong>Your Love Note</strong><small>single-sided · print-ready</small></div></section>
    <section className="hs-home-section"><p className="hs-kicker">Collections</p><h2>Explore Love Note collections</h2>{collectionsLoading?<div className="hs-empty">Loading collections…</div>:collectionsError?<div className="hs-error">{collectionsError}</div>:collections.length?<div className="collection-grid">{collections.map(c => <Link key={c.id} to={`/love-notes/${c.id}`} className="collection-card"><span>Collection</span><h3>{c.name}</h3><p>{c.description}</p></Link>)}</div>:<div className="hs-empty">No collections are available yet.</div>}</section>
  </main>
}

export function AboutPage(){return <ContentPage eyebrow="About" title="About Me"><p>This route preserves the approved About Me section. Replace this placeholder copy with the existing approved website content when supplied.</p></ContentPage>}
export function LoveInActionPage(){return <ContentPage eyebrow="Stories" title="Love In Action"><p>This route preserves the approved Love In Action section and is ready for the existing website content.</p></ContentPage>}
export function MonthlyChallengesPage(){return <ContentPage eyebrow="Monthly Challenges" title="A meaningful challenge each month"><p>The specification requires this feature to remain without major functional changes. Existing challenge rules/content should be migrated here.</p></ContentPage>}
export function ScavengerHuntPage(){return <ContentPage eyebrow="Scavenger Hunt" title="Scavenger Hunt"><p>The approved Scavenger Hunt customer flow belongs here. Existing rules, progress and completion behavior should be migrated rather than redesigned from assumptions.</p></ContentPage>}
export function FaqPage(){return <ContentPage eyebrow="Help" title="Frequently Asked Questions"><div className="faq-list">{['How do Love Notes work?','What size is my downloaded card?','Is the downloaded PDF the same as my preview?','Are Love Notes single-sided?'].map((q,i)=><details key={q}><summary>{q}</summary><p>{i===1?'Every Love Note is 5 × 7 inches in landscape orientation.':i===2?'The current implementation previews the supplied card artwork and downloads the matching client-supplied PDF, avoiding a separately recreated design.':i===3?'Yes. Cards are front-side only, with one card per PDF page.':'Choose an approved collection and card, preview the supplied artwork, then download its matching PDF.'}</p></details>)}</div></ContentPage>}
