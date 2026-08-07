import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PageHeaderProps = { eyebrow?: string; title: string; copy?: string; action?: ReactNode }
export function PageHeader({ eyebrow, title, copy, action }: PageHeaderProps) {
  return <header className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action}</header>
}
export function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return <section className={`ui-panel ${className}`}>{title && <h2>{title}</h2>}{children}</section>
}
export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return <article className="stat-card"><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>
}
export function EmptyState({ title, copy, to, label }: { title: string; copy: string; to?: string; label?: string }) {
  return <div className="empty-state"><div className="empty-mark">✦</div><h2>{title}</h2><p>{copy}</p>{to && <Link className="button" to={to}>{label ?? 'Continue'}</Link>}</div>
}
export const samplePoems = [
  ['A Year More You', 'Another year unfolding softly into who you are.'],
  ['Still Choosing You', 'Every day, I choose you all over again.'],
  ['Quiet Celebration', 'May this year arrive with grace, depth, and light.'],
  ['Held in Light', 'A soft beginning for another beautiful turn around the sun.']
]
export function MiniCardGrid({ locked = false }: { locked?: boolean }) {
  return <div className="mini-card-grid">{samplePoems.map(([title, text], i) => <article className={`mini-poem theme-${['gold','forest','stone','plum'][i]} ${i === 1 || i === 3 ? 'inverse' : ''}`} key={title}><span className="pill">{locked ? 'Locked' : 'Poetry'}</span><div><h3>{title}</h3><p>{text}</p></div><small>™</small></article>)}</div>
}
