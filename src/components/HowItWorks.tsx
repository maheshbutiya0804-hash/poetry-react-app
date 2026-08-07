const steps = [
  ['1', 'Choose a Card', 'Browse by feeling or moment.'],
  ['2', 'Make It Yours', 'Add your personal message.'],
  ['3', 'Share & Connect', 'Download and share what matters.'],
]

export function HowItWorks() {
  return (
    <section className="how section">
      <div className="container">
        <div className="center">
          <p className="eyebrow">How it works</p>
          <h2>Simple. Personal. Meaningful.</h2>
        </div>
        <div className="steps">
          {steps.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
