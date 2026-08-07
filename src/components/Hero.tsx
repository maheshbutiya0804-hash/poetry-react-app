export function Hero() {
  return (
    <>
      <section className="hero" id="top">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Poetry that connects</p>
            <h1>Say What Matters.<br /><em>Beautifully.</em></h1>
            <p className="hero-description">A curated library of poetry greeting cards for life’s most meaningful moments.</p>
            <a className="button" href="#categories">Start Your Journey <span>→</span></a>
            <small>Monthly Subscription · Cancel Anytime</small>
          </div>
          <div className="hero-art" aria-label="Envelope with a poetry card">
            <div className="abstract abstract-one" />
            <div className="abstract abstract-two" />
            <div className="stem stem-one" />
            <div className="stem stem-two" />
            <div className="envelope">
              <div className="envelope-flap" />
              <div className="poem-note">
                <p>Some bonds don’t need words,<br />They live in the little things,<br />In the way you understand<br />without needing to explain.</p>
                <span>TM</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="trust-strip">
        <div className="container trust-grid">
          <div><span className="trust-icon">▣</span><strong>20,000+</strong><small>Curated Poetry Cards</small></div>
          <div><span className="trust-icon">♙</span><strong>Yours to Personalize</strong><small>Add Your Own Touch</small></div>
        </div>
      </section>
    </>
  )
}
