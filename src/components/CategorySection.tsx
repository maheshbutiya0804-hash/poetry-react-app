import type { Category } from '../data/cards'

export function CategorySection({ category }: { category: Category }) {
  return (
    <section className="category-section section" id={category.name === 'Happy Birthday' ? 'categories' : undefined}>
      <div className="container">
        <div className="center category-heading">
          <p className="eyebrow">Category</p>
          <h2>{category.name}</h2>
          <p className="section-subtitle">{category.description}</p>
        </div>
        <div className="card-carousel">
          <button className="round-arrow" aria-label={`Previous ${category.name} cards`}>←</button>
          <div className="poetry-grid">
            {category.cards.map((card) => (
              <article className={`poetry-card theme-${card.theme} ${card.inverse ? 'inverse' : ''}`} key={`${category.name}-${card.title}`}>
                <span className="pill">○ {card.category}</span>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
                <small>TM</small>
              </article>
            ))}
          </div>
          <button className="round-arrow" aria-label={`Next ${category.name} cards`}>→</button>
        </div>
      </div>
    </section>
  )
}
