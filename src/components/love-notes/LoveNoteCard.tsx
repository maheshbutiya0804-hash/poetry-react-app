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
