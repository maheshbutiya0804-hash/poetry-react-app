import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import type { LoveNoteCard as LoveNoteCardType, LoveNoteCollection } from '../../types/loveNote'
import { confirmSubscriptionCheckout, createSubscriptionCheckout, downloadPersonalizedCard, getCard, getCollectionCards, getCollections, getProfile, saveCardToLibrary } from '../../services/api'
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

const FEATURED_WHERE_TO_LEAVE_IT=['Bathroom mirror','Nightstand','Fridge','Lunch bag','Car','TV area','Pillow','Bedroom door','Coffee maker','Book','Kitchen drawer','Office desk / favorite seat']

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
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [personalizing, setPersonalizing] = useState(false)

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

  async function downloadPersonalized() {
    if (!recipientName.trim() || !senderName.trim()) { setCheckoutError('Enter both recipient and sender names first.'); return }
    setPersonalizing(true); setCheckoutError('')
    try { await downloadPersonalizedCard(cardId, recipientName.trim(), senderName.trim()) }
    catch(error){ setCheckoutError(error instanceof Error?error.message:'Unable to create personalized PDF.') }
    finally{ setPersonalizing(false) }
  }

  function closeSuccess() {
    setSubscriptionModal(false)
    navigate(location.pathname,{replace:true})
  }

  if (notFound) return <Navigate to="/love-notes" replace />
  if (loading || !card) return <main className="reference-card-page"><LoadingBlock /></main>

  return (
    <main className="reference-card-page">
      <div className="reference-back-row">{searchParams.get('from') === 'challenge' ? <Link to="/challenges">← <span>Back to Challenge</span></Link> : <Link to={`/love-notes/${card.collectionId}`}>← <span>Back to Browse</span></Link>}</div>
      <section className="reference-card-detail">
        <div className="reference-preview-column">
          <div className="protected-card-shell personalized-card-preview"><LoveNoteCard card={card} eager />{!hasAccess && <><div className="protected-fade" aria-hidden="true"/><div className="protected-message"><strong>PROTECTED PREVIEW</strong><p>Subscribe to unlock the original print-ready PDF.</p></div></>}<div className="personalization-footer-preview"><span><small>For:</small>{recipientName.trim() || 'Recipient'}</span><span><small>With Love:</small>{senderName.trim() || 'Your Name'}</span></div></div>
          <p className="reference-card-spec">5 × 7 inches · landscape · personalized footer preview</p>
        </div>
        <aside className="reference-card-info">
          <span className="reference-category-pill">○ Laurentine Love Note</span>
          <h1>{card.title}</h1>
          <p className="reference-card-description">{card.excerpt}</p>
          <section className="personalization-panel" aria-labelledby="personalize-card-heading"><div className="personalization-panel-head"><div><span>PERSONALIZE YOUR CARD</span><h2 id="personalize-card-heading">Add the names that make it yours.</h2></div><em>Included</em></div><p>Names appear in a quiet footer so the poem and artwork stay untouched.</p><div className="personalization-fields"><label><span>RECIPIENT</span><input maxLength={120} value={recipientName} onChange={e=>setRecipientName(e.target.value)} placeholder="Brandi"/><small>Bottom left · “For: Brandi”</small></label><label><span>SENDER</span><input maxLength={120} value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Shawn"/><small>Bottom right · “With Love: Shawn”</small></label></div><div className="personalization-note"><span>✦</span><p>Your original card design is never edited. We create a personalized copy only when you download or order.</p></div>{hasAccess&&<button className="personalization-download" type="button" onClick={downloadPersonalized} disabled={personalizing||!recipientName.trim()||!senderName.trim()}>{personalizing?'Creating personalized PDF…':'Download Personalized PDF'}</button>}</section>
          {hasAccess ? <button className="reference-subscribe-button" type="button" onClick={saveToLibrary} disabled={saving||saved}>{saved?'Saved to Library':saving?'Saving…':'Save to Library'}</button> : <button className="reference-subscribe-button" type="button" onClick={subscribe} disabled={checkoutLoading || authLoading}>{checkoutLoading ? 'Opening secure checkout…' : 'Subscribe for Full Access – $8.99/month'}</button>}
          <Link className="reference-demo-download physical-order-button" to={`/cards/${card.id}/order?for=${encodeURIComponent(recipientName.trim())}&from=${encodeURIComponent(senderName.trim())}`}>Order Physical Card – $7.99</Link>
          {checkoutError && <p className="auth-error" role="alert">{checkoutError}</p>}
          <p className="reference-save-note">{hasAccess ? 'Downloads are available from your Saved Library. Physical cards can be ordered anytime.' : 'The original PDF is available only with an active subscription.'}</p>
        </aside>
      </section>
      {hasAccess && card.isFeatured && <section className="mx-auto mb-8 w-[calc(100%-64px)] max-w-[1220px] rounded-[28px] border border-[rgba(57,47,39,.11)] bg-[#f8f1e8] p-7 max-[760px]:w-[calc(100%-36px)] max-[760px]:p-5"><span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#aa7f38]">Love in Action · Scavenger List</span><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="m-0 font-serif text-[2.2rem] font-semibold leading-none text-[#2f2a25]">Where to Leave It</h2><p className="mt-2 max-w-[720px] text-sm leading-6 text-[#776d62]">Turn this featured note into a small surprise. Choose any place below and leave it somewhere your spouse can discover naturally.</p></div><span className="rounded-full bg-[#fcfaf7] px-3 py-2 text-xs font-bold text-[#776d62]">Optional · strongly encouraged</span></div><div className="mt-5 grid grid-cols-4 gap-3 max-[980px]:grid-cols-3 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1">{FEATURED_WHERE_TO_LEAVE_IT.map((location,index)=><div key={location} className="flex items-center gap-3 rounded-[16px] border border-[rgba(57,47,39,.09)] bg-[#fcfaf7] px-4 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(23,57,47,.08)] text-xs font-extrabold text-[#17392f]">{String(index+1).padStart(2,'0')}</span><span className="text-sm font-semibold text-[#4f473f]">{location}</span></div>)}</div></section>}
      {!!related.length&&<section className="reference-related"><p className="reference-related-label">RELATED CARDS</p><div className="reference-related-grid">{related.map(item=><Link key={item.id} to={`/cards/${item.id}`} className="reference-related-card"><LoveNoteCard card={item}/><h3>{item.title}</h3></Link>)}</div></section>}
      {subscriptionModal&&<div className="subscription-success-backdrop" role="dialog" aria-modal="true" aria-label="Subscription Active"><div className="subscription-success-modal"><div className="subscription-success-check">✓</div><h2>Subscription Active!</h2><p>Welcome to the library. Your full access is now unlocked, and you can save any cards to library now.</p><button type="button" onClick={closeSuccess}>Continue Exploring</button></div></div>}
    </main>
  )
}

