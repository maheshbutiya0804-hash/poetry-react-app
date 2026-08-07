const benefits = [
  ['Unlimited Viewing', 'Browse and open cards without restriction across the full collection.'],
  ['Unlimited Downloads', 'Keep, share, and revisit the cards that speak to your moment.'],
  ['Full Category Access', 'Unlock every occasion, every feeling, and every curated collection.'],
]

export function Subscription() {
  return (
    <section className="subscription section" id="access">
      <div className="container narrow center">
        <p className="eyebrow">Subscription</p>
        <h2>One Plan. Full Access.</h2>
        <p className="section-subtitle">Designed to feel simple, generous, and quietly premium.</p>
        <div className="pricing-card">
          <p className="eyebrow">Membership</p>
          <h3>Poetry for every meaningful moment.</h3>
          <div className="price"><span>$8.99</span> / month</div>
          <p className="pricing-copy">Subscribers receive unlimited access to explore the full poetry library, download what they love, and move freely through every card category and collection.</p>
          <div className="benefit-grid">
            {benefits.map(([title, text]) => (
              <article key={title}>
                <h4>{title}</h4>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <a className="button button-small" href="#signin">Start Access</a>
          <small>Cancel anytime</small>
        </div>
      </div>
    </section>
  )
}
