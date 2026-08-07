import { NavLink, Outlet } from 'react-router-dom'

const userLinks = [
  ['/', 'Home'], ['/search', 'Search'], ['/categories', 'Categories'], ['/dashboard', 'Dashboard'],
  ['/library', 'Library'], ['/forum', 'Forum'], ['/poetry-requests', 'Requests'], ['/orders', 'Orders'], ['/profile', 'Profile']
]

export function AppShell() {
  return (
    <div className="application-shell">
      <header className="app-topbar">
        <NavLink className="brand" to="/">Verse & Feeling<sup>™</sup></NavLink>
        <nav className="app-nav" aria-label="Main navigation">
          {userLinks.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
        <NavLink className="button button-small" to="/sign-in">Sign In</NavLink>
      </header>
      <Outlet />
    </div>
  )
}

export function AdminShell() {
  const links = [
    ['/admin', 'Dashboard'], ['/admin/cards', 'Cards'], ['/admin/users', 'Users'],
    ['/admin/subscriptions', 'Subscriptions'], ['/admin/poetry-requests', 'Requests'],
    ['/admin/orders', 'Orders'], ['/admin/notifications', 'Notifications'],
    ['/admin/community', 'Community'], ['/admin/settings', 'Settings']
  ]
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="brand admin-brand" to="/admin">Verse & Feeling<sup>™</sup></NavLink>
        <nav>{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/admin'}>{label}</NavLink>)}</nav>
        <NavLink to="/">← User site</NavLink>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  )
}
