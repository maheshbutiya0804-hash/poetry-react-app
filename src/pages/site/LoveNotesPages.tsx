import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import type { LoveNoteCard as LoveNoteCardType, LoveNoteCollection } from '../../types/loveNote'
import { getCard, getCollectionCards, getCollections } from '../../services/api'

function LoadingBlock({ text = 'Loading…' }: { text?: string }) {
  return <div className="empty-product"><p>{text}</p></div>
}

export function LoveNotesPage() {
  const [collections, setCollections] = useState<LoveNoteCollection[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    getCollections().then(setCollections).catch(error => setError(error instanceof Error ? error.message : 'Unable to load collections'))
  }, [])

  return (
    <main className="hs-page">
      <section className="hs-page-hero">
        <p>Love Notes</p>
        <h1>Choose a collection.</h1>
        <span>The catalog below is now loaded from the HeartString database.</span>
      </section>
      <section className="hs-content">
        {error ? <LoadingBlock text={error} /> : !collections.length ? <LoadingBlock /> : (
          <div className="collection-grid">
            {collections.map(collection => (
              <Link key={collection.id} className="collection-card" to={`/love-notes/${collection.id}`}>
                <span>Love Note Collection</span>
                <h2>{collection.name}</h2>
                <p>{collection.description}</p>
                <small>{collection.cardCount ? `${collection.cardCount} cards available` : 'Awaiting client designs'}</small>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export function CollectionPage() {
  const { collectionId = '' } = useParams()
  const [collections, setCollections] = useState<LoveNoteCollection[]>([])
  const [cards, setCards] = useState<LoveNoteCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getCollections(), getCollectionCards(collectionId)])
      .then(([collectionItems, cardItems]) => {
        setCollections(collectionItems)
        setCards(cardItems)
      })
      .catch(error => setError(error instanceof Error ? error.message : 'Unable to load collection'))
      .finally(() => setLoading(false))
  }, [collectionId])

  const collection = collections.find(c => c.id === collectionId)
  if (!loading && collections.length && !collection) return <Navigate to="/love-notes" replace />

  return (
    <main className="hs-page">
      <section className="hs-page-hero">
        <p>Love Notes</p>
        <h1>{collection?.name ?? 'Collection'}</h1>
        <span>{collection?.description ?? 'Client-approved Love Note cards.'}</span>
      </section>
      <section className="hs-content">
        {loading ? <LoadingBlock /> : error ? <LoadingBlock text={error} /> : (
          <div className="note-product-grid">
            {cards.length ? cards.map(card => (
              <Link to={`/cards/${card.id}`} className="note-product" key={card.id}>
                <LoveNoteCard card={card} />
                <div className="note-product-copy">
                  <h3>{card.title}</h3>
                  <p>{card.excerpt}</p>
                  <span>Preview card →</span>
                </div>
              </Link>
            )) : (
              <div className="empty-product">
                <h2>Designs not uploaded yet</h2>
                <p>Use the admin upload page to add client-approved Love Note products.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export function LoveNoteDetailPage() {
  const { cardId = '' } = useParams()
  const [card, setCard] = useState<LoveNoteCardType | null>(null)
  const [collectionCards, setCollectionCards] = useState<LoveNoteCardType[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    getCard(cardId)
      .then(async item => {
        setCard(item)
        const related = await getCollectionCards(item.collectionId)
        setCollectionCards(related)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [cardId])

  const related = useMemo(() => collectionCards.filter(item => item.id !== card?.id).slice(0, 3), [collectionCards, card])

  if (notFound) return <Navigate to="/love-notes" replace />
  if (loading || !card) return <main className="reference-card-page"><LoadingBlock /></main>

  return (
    <main className="reference-card-page">
      <div className="reference-back-row">
        <Link to={`/love-notes/${card.collectionId}`}>← <span>Back to Browse</span></Link>
      </div>

      <section className="reference-card-detail">
        <div className="reference-preview-column">
          <div className="protected-card-shell">
            <LoveNoteCard card={card} eager />
            <div className="protected-fade" aria-hidden="true" />
            <div className="protected-message">
              <strong>PROTECTED PREVIEW</strong>
              <p>This poem is softly protected in preview mode.<br/>Subscribe to view the full card and unlock clean downloads.</p>
            </div>
          </div>
          <p className="reference-card-spec">5 × 7 inches · landscape · front only</p>
        </div>

        <aside className="reference-card-info">
          <span className="reference-category-pill">○ Love</span>
          <h1>{card.title}</h1>
          <p className="reference-card-description">{card.excerpt}</p>
          <Link className="reference-subscribe-button" to="/register">Subscribe for Full Access – $8.99/month</Link>
          <p className="reference-save-note">Customization and downloads are available after saving, from the Saved Library page.</p>
          {card.pdfUrl&&<a className="reference-demo-download" href={card.pdfUrl} download={`${card.slug ?? card.id}.pdf`}>Developer preview: download source PDF</a>}
        </aside>
      </section>

      {!!related.length && (
        <section className="reference-related">
          <p className="reference-related-label">RELATED CARDS</p>
          <div className="reference-related-grid">
            {related.map(item => (
              <Link key={item.id} to={`/cards/${item.id}`} className="reference-related-card">
                <LoveNoteCard card={item} />
                <h3>{item.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
