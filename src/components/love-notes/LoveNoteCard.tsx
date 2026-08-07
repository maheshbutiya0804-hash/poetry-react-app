import { forwardRef } from 'react'
import type { LoveNoteCard as LoveNoteCardType } from '../../types/loveNote'

type Props = {
  card: LoveNoteCardType
  message?: string
  className?: string
}

export const LoveNoteCard = forwardRef<HTMLDivElement, Props>(function LoveNoteCard(
  { card, message, className = '' },
  ref,
) {
  const x = card.textXPercent ?? 50
  const y = card.textYPercent ?? 50
  const width = card.textWidthPercent ?? 70
  return (
    <div ref={ref} className={`love-note-card ${className}`} aria-label={`${card.title} preview`}>
      {card.designImageUrl ? <img className="love-note-art" src={card.designImageUrl} alt="" /> : <div className="love-note-art love-note-placeholder" />}
      <div
        className="love-note-copy"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          color: card.textColor ?? '#3d2d31',
          textAlign: card.textAlign ?? 'center',
        }}
      >
        {message || card.message}
      </div>
    </div>
  )
})
