import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loveNoteCards, loveNoteCollections } from '../../data/loveNotes'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import { downloadLoveNotePdf } from '../../utils/downloadLoveNotePdf'

export function LoveNotesPage() {
  return <main className="hs-page"><section className="hs-page-hero"><p>Love Notes</p><h1>Choose a collection.</h1><span>The requirement confirms nine approved collections. Their final client-approved names and designs should be loaded as content, not recreated by developers.</span></section><section className="hs-content"><div className="collection-grid">{loveNoteCollections.map(c=><Link key={c.id} className="collection-card" to={`/love-notes/${c.id}`}><span>Love Note Collection</span><h2>{c.name}</h2><p>{c.description}</p></Link>)}</div></section></main>
}

export function CollectionPage() {
  const { collectionId = '' } = useParams()
  const collection = loveNoteCollections.find(c => c.id === collectionId)
  const cards = loveNoteCards.filter(c => c.collectionId === collectionId && c.published)
  return <main className="hs-page"><section className="hs-page-hero"><p>Love Notes</p><h1>{collection?.name ?? 'Collection'}</h1><span>{collection?.description}</span></section><section className="hs-content"><div className="note-product-grid">{cards.length ? cards.map(card=><Link to={`/love-notes/${collectionId}/${card.id}`} className="note-product" key={card.id}><LoveNoteCard card={card}/><h3>{card.title}</h3><span>Preview & personalize →</span></Link>) : <div className="empty-product"><h2>Designs not uploaded yet</h2><p>The client provides the approved Love Note designs. Add them through the card data/admin upload flow.</p></div>}</div></section></main>
}

export function LoveNoteDetailPage() {
  const { cardId = '' } = useParams()
  const card = useMemo(() => loveNoteCards.find(c => c.id === cardId) ?? loveNoteCards[0], [cardId])
  const [message, setMessage] = useState(card.message)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  async function download() {
    if (!cardRef.current) return
    try {
      setDownloading(true)
      await downloadLoveNotePdf(cardRef.current, card.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    } finally {
      setDownloading(false)
    }
  }

  return <main className="hs-page"><section className="hs-page-hero"><p>Love Note Preview</p><h1>{card.title}</h1><span>Your PDF uses this exact preview renderer at the required 7 × 5 inch landscape size.</span></section><section className="hs-content love-note-editor"><div className="preview-stage"><LoveNoteCard ref={cardRef} card={card} message={message}/><p className="ratio-note">Preview ratio: 7:5 landscape · front side only</p></div><aside className="editor-panel"><h2>Personalize your note</h2><label>Card message<textarea rows={8} value={message} onChange={e=>setMessage(e.target.value)}/></label><button className="button" type="button" onClick={download} disabled={downloading}>{downloading?'Generating PDF…':'Download 5 × 7 PDF'}</button><p className="helper-copy">The generated file is one landscape 7 × 5 inch PDF page and captures the same card element shown in the preview.</p></aside></section></main>
}
