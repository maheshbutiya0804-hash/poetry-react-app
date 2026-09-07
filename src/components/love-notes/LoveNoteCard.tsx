import type { LoveNoteCard as LoveNoteCardType } from '../../types/loveNote'

type Props = {
  card: LoveNoteCardType
  className?: string
  eager?: boolean
}

export function LoveNoteCard({ card, className = '', eager = false }: Props) {
  const isPdfPreview = card.previewImageUrl?.toLowerCase().includes('.pdf')

  return (
    <figure className={`love-note-card ${className}`} aria-label={`${card.title} preview`}>
      {(card.isNew || card.isMostBought) && (
        <div className="love-note-badges" aria-label={[card.isNew ? 'New' : '', card.isMostBought ? 'Most bought' : ''].filter(Boolean).join(', ')}>
          {card.isNew && <span className="love-note-badge love-note-badge-new">NEW</span>}
          {card.isMostBought && <span className="love-note-badge love-note-badge-most-bought">MOST BOUGHT</span>}
        </div>
      )}
      {isPdfPreview ? (
        <object className="love-note-art love-note-pdf-preview" data={`${card.previewImageUrl}#toolbar=0&navpanes=0&scrollbar=0`} type="application/pdf" aria-label={`${card.title} PDF preview`}>
          <span>PDF preview available on the card detail page.</span>
        </object>
      ) : (
        <img
          className="love-note-art"
          src={card.previewImageUrl}
          alt={`${card.title} card artwork`}
          loading={eager ? 'eager' : 'lazy'}
        />
      )}
    </figure>
  )
}
