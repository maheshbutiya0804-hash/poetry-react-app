import { Link } from 'react-router-dom'

export function SubscriptionSuccessPage() {
  return (
    <main className="hs-page">
      <section className="hs-page-hero">
        <p>Laurentine Love Notes</p>
        <h1>Thank you for subscribing.</h1>
        <span>Your Stripe checkout was completed. We’ll confirm your membership securely before unlocking full access.</span>
        <div style={{marginTop:24}}><Link className="reference-subscribe-button" to="/profile">View your profile</Link></div>
      </section>
    </main>
  )
}

export function SubscriptionCancelledPage() {
  return (
    <main className="hs-page">
      <section className="hs-page-hero">
        <p>Laurentine Love Notes</p>
        <h1>Checkout cancelled.</h1>
        <span>No charge was made. You can return to the Love Notes collection whenever you’re ready.</span>
        <div style={{marginTop:24}}><Link className="reference-subscribe-button" to="/love-notes">Return to Love Notes</Link></div>
      </section>
    </main>
  )
}
