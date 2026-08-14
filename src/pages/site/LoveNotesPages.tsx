import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import type { LoveNoteCard as LoveNoteCardType, LoveNoteCollection } from '../../types/loveNote'
import { confirmSubscriptionCheckout, createSubscriptionCheckout, getCard, getCollectionCards, getCollections, getProfile, saveCardToLibrary } from '../../services/api'
import { useAuth } from '../../auth/AuthContext'

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
        <span>Browse Laurentine Love Notes by collection.</span>
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
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [hasAccess, setHasAccess] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subscriptionModal, setSubscriptionModal] = useState(false)
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

  useEffect(() => {
    if (!user) { setHasAccess(false); return }
    getProfile().then(profile => setHasAccess(profile.subscription?.status === 'ACTIVE')).catch(() => setHasAccess(false))
  }, [user])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!user || searchParams.get('checkout') !== 'success' || !sessionId) return
    let cancelled = false
    ;(async()=>{
      try {
        const result = await confirmSubscriptionCheckout(sessionId)
        if (!cancelled && result.active) {
          setHasAccess(true)
          setSubscriptionModal(true)
        }
      } catch (error) {
        if (!cancelled) setCheckoutError(error instanceof Error ? error.message : 'Unable to confirm subscription.')
      }
    })()
    return ()=>{cancelled=true}
  }, [user, searchParams])

  const related = useMemo(() => collectionCards.filter(item => item.id !== card?.id).slice(0, 3), [collectionCards, card])

  async function subscribe() {
    if (authLoading) return
    if (!user) {
      navigate('/login', { state: { from: `/cards/${cardId}` } })
      return
    }
    setCheckoutError('')
    setCheckoutLoading(true)
    try {
      const checkout = await createSubscriptionCheckout(`/cards/${cardId}`)
      window.location.assign(checkout.url)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to start checkout.')
      setCheckoutLoading(false)
    }
  }

  async function saveToLibrary() {
    if (!user) return navigate('/login', { state:{ from:`/cards/${cardId}` } })
    setSaving(true); setCheckoutError('')
    try { await saveCardToLibrary(cardId); setSaved(true) }
    catch(error){ setCheckoutError(error instanceof Error?error.message:'Unable to save card.') }
    finally{ setSaving(false) }
  }

  function closeSuccess() {
    setSubscriptionModal(false)
    navigate(location.pathname,{replace:true})
  }

  if (notFound) return <Navigate to="/love-notes" replace />
  if (loading || !card) return <main className="reference-card-page"><LoadingBlock /></main>

  return (
    <main className="reference-card-page">
      <div className="reference-back-row"><Link to={`/love-notes/${card.collectionId}`}>← <span>Back to Browse</span></Link></div>
      <section className="reference-card-detail">
        <div className="reference-preview-column">
          <div className="protected-card-shell"><LoveNoteCard card={card} eager />{!hasAccess && <><div className="protected-fade" aria-hidden="true"/><div className="protected-message"><strong>PROTECTED PREVIEW</strong><p>Subscribe to unlock the original print-ready PDF.</p></div></>}</div>
          <p className="reference-card-spec">5 × 7 inches · landscape · front only</p>
        </div>
        <aside className="reference-card-info">
          <span className="reference-category-pill">○ Laurentine Love Note</span>
          <h1>{card.title}</h1>
          <p className="reference-card-description">{card.excerpt}</p>
          {hasAccess ? <button className="reference-subscribe-button" type="button" onClick={saveToLibrary} disabled={saving||saved}>{saved?'Saved to Library':saving?'Saving…':'Save to Library'}</button> : <button className="reference-subscribe-button" type="button" onClick={subscribe} disabled={checkoutLoading || authLoading}>{checkoutLoading ? 'Opening secure checkout…' : 'Subscribe for Full Access – $8.99/month'}</button>}
          <Link className="reference-demo-download physical-order-button" to={`/cards/${card.id}/order`}>Order Physical Card – $7.99</Link>
          {checkoutError && <p className="auth-error" role="alert">{checkoutError}</p>}
          <p className="reference-save-note">{hasAccess ? 'Downloads are available from your Saved Library. Physical cards can be ordered anytime.' : 'The original PDF is available only with an active subscription.'}</p>
        </aside>
      </section>
      {!!related.length&&<section className="reference-related"><p className="reference-related-label">RELATED CARDS</p><div className="reference-related-grid">{related.map(item=><Link key={item.id} to={`/cards/${item.id}`} className="reference-related-card"><LoveNoteCard card={item}/><h3>{item.title}</h3></Link>)}</div></section>}
      {subscriptionModal&&<div className="subscription-success-backdrop" role="dialog" aria-modal="true" aria-label="Subscription Active"><div className="subscription-success-modal"><div className="subscription-success-check">✓</div><h2>Subscription Active!</h2><p>Welcome to the library. Your full access is now unlocked, and you can save any cards to library now.</p><button type="button" onClick={closeSuccess}>Continue Exploring</button></div></div>}
    </main>
  )
}

