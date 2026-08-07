import { useState } from 'react'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#top">Verse &amp; Feeling<sup>™</sup></a>
        <button className="menu-button" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span />
          <span />
        </button>
        <nav className={open ? 'main-nav open' : 'main-nav'}>
          <a href="#browse" onClick={() => setOpen(false)}>Browse</a>
          <a href="#categories" onClick={() => setOpen(false)}>Categories</a>
          <a href="#signin" onClick={() => setOpen(false)}>Sign In</a>
          <a className="button button-small" href="#access" onClick={() => setOpen(false)}>Start Access</a>
        </nav>
      </div>
    </header>
  )
}
