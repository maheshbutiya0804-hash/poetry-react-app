import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { LoveNoteCard } from '../../types/loveNote'
import { searchCards } from '../../services/api'
import { LoveNoteCard as CardPreview } from '../../components/love-notes/LoveNoteCard'

export function BrowsePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LoveNoteCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setLoading(false)
      setError('')
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const cards = await searchCards(q, controller.signal)
        setResults(cards)
      } catch (error) {
        if (controller.signal.aborted) return
        setResults([])
        setError(error instanceof Error ? error.message : 'Unable to search cards.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  return (
    <main className="flex-1 flex flex-col">
      <section className="flex flex-1 flex-col px-16 max-[1180px]:px-7 max-[760px]:px-[18px]">
        <div className="flex items-center justify-center pt-6">
          <div className="relative mx-auto w-full max-w-3xl">
            <svg aria-hidden="true" className="absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#877b70]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              placeholder="Search cards, occasions, or feelings"
              className="h-[58px] w-full border border-[rgba(57,47,39,0.1)] bg-[#f4eee5] text-charcoal outline-none" style={{ borderRadius: "3.40282e38px", padding: "13px 54px", backgroundColor: "#f4eee5" }}
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              autoComplete="off"
              aria-label="Search cards, occasions, or feelings"
            />
          </div>
        </div>

        {!query.trim() ? (
          <section className="mx-auto flex flex-1 w-full max-w-2xl flex-col items-center justify-center gap-6 py-12 text-center">
            <h1 className="font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em] md:text-5xl">Search for a feeling, occasion, or quiet thought.</h1>
            <p className="max-w-[80%] text-sm md:text-base text-muted">Type a word like love, birthday, mother, anniversary, or gratitude to discover poetry cards made for that moment.</p>
          </section>
        ) : (
          <div className="flex flex-col flex-1 gap-6 pb-10" aria-live="polite" aria-busy={loading}>
            <section className="mt-8 flex flex-col gap-2">
              <h1 className="m-0 font-serif text-[56px] font-semibold leading-[0.96] tracking-[-0.03em] max-[760px]:text-[42px]">Search Results</h1>
              <p className="text-[17px] leading-[1.65] text-muted">Showing results for “{query.trim()}”</p>
            </section>

            {loading ? (
              <section className="mx-auto flex min-h-[220px] w-full max-w-2xl items-center justify-center text-center text-muted">Searching cards…</section>
            ) : error ? (
              <section className="mx-auto flex min-h-[220px] w-full max-w-2xl items-center justify-center text-center text-sm text-red-700">{error}</section>
            ) : results.length ? (
              <div className="note-product-grid">
                {results.map(card => (
                  <Link key={card.id} className="note-product" to={`/cards/${card.id}`} aria-label={`View ${card.title}`}>
                    <CardPreview card={card} />
                    <div className="note-product-copy">
                      <h3>{card.title}</h3>
                      <p>{card.excerpt}</p>
                      <span>Preview card →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <section className="mx-auto flex min-h-[240px] w-full max-w-2xl flex-col items-center justify-center gap-3 text-center">
                <h2 className="font-serif text-3xl font-semibold text-charcoal">No cards found</h2>
                <p className="max-w-[80%] text-sm md:text-base text-muted">Try another feeling, occasion, or keyword.</p>
              </section>
            )}

            <span className="sr-only">
              {loading ? 'Searching cards.' : error ? error : `${results.length} card${results.length === 1 ? '' : 's'} found.`}
            </span>
          </div>
        )}
      </section>
    </main>
  )
}
