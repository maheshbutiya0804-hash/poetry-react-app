import { NavLink, Outlet } from 'react-router-dom'

const links = [
  ['/', 'Home'],
  ['/about', 'About Me'],
  ['/love-in-action', 'Love In Action'],
  ['/monthly-challenges', 'Monthly Challenges'],
  ['/scavenger-hunt', 'Scavenger Hunt'],
  ['/love-notes', 'Love Notes'],
  ['/faq', 'FAQ'],
]

export function SiteLayout() {
  return (
    <div className="hs-site">
      <header className="hs-header">
        <NavLink to="/" className="hs-brand">HeartString Notes</NavLink>
        <nav className="hs-nav" aria-label="Primary navigation">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        </nav>
      </header>
      <Outlet />
      <footer className="hs-footer">
        <div><strong>HeartString Notes</strong><p>Meaningful notes designed to be previewed, personalized, downloaded and printed.</p></div>
        <nav>{links.slice(1).map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      </footer>
    </div>
  )
}
