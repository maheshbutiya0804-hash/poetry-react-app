import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const secondaryLinks=[['/about','About'],['/love-in-action','Love In Action'],['/monthly-challenges','Monthly Challenges'],['/scavenger-hunt','Scavenger Hunt'],['/faq','FAQ']]
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()

export function SiteLayout(){
  const [open,setOpen]=useState(false)
  const [accountOpen,setAccountOpen]=useState(false)
  const {user,logout}=useAuth()
  const navigate=useNavigate()
  const location=useLocation()
  const isHome=location.pathname==='/'

  async function signOut(){await logout();setAccountOpen(false);navigate('/login')}

  if (isHome) {
    return (
      <div className="flex min-h-screen flex-col font-sans bg-ivory text-charcoal">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-7 border-b border-[rgba(57,47,39,0.12)] bg-[rgba(252,250,247,0.9)] px-16 py-4 max-[760px]:gap-3.5 max-[760px]:px-4.5 max-[760px]:py-4">
          <Link className="flex items-center gap-2.5" to="/" onClick={()=>setOpen(false)}>
            <img alt="Laurentine" className="h-10 w-auto object-contain" src="/assets/branding/laurentine-logo.png"/>
            <span className="whitespace-nowrap font-serif text-[24px] font-semibold leading-none text-[#2f2a25]">Laurentine<sup className="ml-px align-super text-[46%] text-[#9f8d79]">™</sup></span>
          </Link>

          <nav aria-label="Primary navigation" className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-8.5 text-base text-[#53493f] max-[1024px]:hidden">
            <Link className="relative py-1.5 text-[#53493f]" to="/love-notes">Browse</Link>
            <Link className="relative py-1.5 text-[#53493f]" to="/love-notes">Categories</Link>
            {user&&<><Link className="relative py-1.5 text-[#53493f]" to="/library">Library</Link><Link className="relative py-1.5 text-[#53493f]" to="/forum">Forum</Link><Link className="relative py-1.5 text-[#53493f]" to="/orders">Orders</Link></>}
          </nav>

          <div className="flex flex-wrap items-center gap-3.5 max-[1024px]:hidden">
            {user ? (
              <div className="relative">
                <button type="button" className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f4eee5] text-sm font-semibold text-[#2f2a25]" onClick={()=>setAccountOpen(v=>!v)}>
                  {user.profileImageUrl?<img src={user.profileImageUrl} alt="" className="h-full w-full object-cover"/>:initials(user.fullName)}
                </button>
                {accountOpen&&<div className="absolute right-0 top-[calc(100%+10px)] min-w-55 flex flex-col gap-2 rounded-2xl border border-[rgba(57,47,39,0.1)] bg-[rgba(252,250,247,0.98)] p-2.5 shadow-[0_18px_30px_rgba(42,31,21,0.1)]"><Link className="rounded-xl px-3.5 py-3 hover:bg-[#f4eee5]" to="/profile" onClick={()=>setAccountOpen(false)}>Profile &amp; Settings</Link><button className="rounded-xl px-3.5 py-3 text-left hover:bg-[#f4eee5]" onClick={signOut}>Logout</button></div>}
              </div>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-[#17392f] py-2 px-4 text-[#f7f3ec] shadow-[0_12px_24px_rgba(23,57,47,0.12)]" to="/register">Start Access</Link>
              </>
            )}
          </div>

          <div className="relative ml-auto hidden max-[1024px]:inline-flex">
            <button type="button" aria-expanded={open} aria-controls="public-menu-panel" aria-label="Open navigation options" className="inline-flex min-h-11.5 cursor-pointer items-center gap-2.5 rounded-full border border-[rgba(57,47,39,0.1)] bg-[rgba(244,238,229,0.92)] px-4 text-[#2f2a25] shadow-browse" onClick={()=>setOpen(v=>!v)}>
              <span className="whitespace-nowrap text-sm hidden sm:inline-block">Menu</span>
              <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
            </button>
            <div id="public-menu-panel" className={`absolute right-0 top-[calc(100%+10px)] min-w-55 flex-col gap-2 rounded-2xl border border-[rgba(57,47,39,0.1)] bg-[rgba(252,250,247,0.98)] p-2.5 shadow-[0_18px_30px_rgba(42,31,21,0.1)] ${open?'flex':'hidden'}`}>
              <Link className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[#2f2a25] transition hover:-translate-y-px hover:bg-[#f4eee5] focus:-translate-y-px focus:bg-[#f4eee5] focus:outline-none" to="/love-notes" onClick={()=>setOpen(false)}>Browse</Link>
              <Link className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[#2f2a25] transition hover:-translate-y-px hover:bg-[#f4eee5] focus:-translate-y-px focus:bg-[#f4eee5] focus:outline-none" to="/love-notes" onClick={()=>setOpen(false)}>Categories</Link>
              {user ? (
                <>
                  <Link className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[#2f2a25] transition hover:bg-[#f4eee5]" to="/profile" onClick={()=>setOpen(false)}>Profile</Link>
                  <button className="flex items-center justify-between gap-3 rounded-xl bg-[#17392f] px-3.5 py-3 text-[#f7f3ec]" onClick={signOut}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[#2f2a25] transition hover:-translate-y-px hover:bg-[#f4eee5] focus:-translate-y-px focus:bg-[#f4eee5] focus:outline-none" to="/login" onClick={()=>setOpen(false)}><span>Sign In</span><svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></Link>
                  <Link className="flex items-center justify-between gap-3 rounded-xl bg-[#17392f] px-3.5 py-3 text-[#f7f3ec] shadow-[0_12px_24px_rgba(23,57,47,0.12)]" to="/register" onClick={()=>setOpen(false)}><span>Start Access</span><svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></Link>
                </>
              )}
            </div>
          </div>
        </header>

        <Outlet/>

        <footer className="border-t border-[rgba(57,47,39,0.12)] bg-[#faf7f2] px-16 py-5 max-[760px]:px-4.5">
          <div className="flex items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start">
            <div className="flex flex-col items-baseline-last">
              <Link className="flex items-center gap-2.5" to="/">
                <img alt="Laurentine" className="h-10 w-auto object-contain" src="/assets/branding/laurentine-logo.png"/>
                <span className="whitespace-nowrap font-serif text-[24px] font-semibold leading-none text-[#2f2a25]">Laurentine<sup className="ml-px align-super text-[46%] text-[#9f8d79]">™</sup></span>
              </Link>
              <p className="text-[13px] leading-relaxed text-[#776d62]">Poetry that speaks. Moments that last.</p>
            </div>
            <div className="flex items-center gap-3.5 text-[0.9rem] font-medium">
              <Link className="text-[#5f554b] transition hover:text-[#17392f]" to="/about">About</Link>
              <a className="text-[#5f554b] transition hover:text-[#17392f]" href="mailto:support@laurentine.co" aria-label="Email">✉</a>
              <a className="text-[#5f554b] transition hover:text-[#17392f]" href="#" aria-label="Instagram">◎</a>
              <a className="text-[#5f554b] transition hover:text-[#17392f]" href="#" aria-label="Facebook">●</a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return <div className="hs-site"><header className="reference-header"><Link to="/" className="reference-brand" onClick={()=>setOpen(false)}><div className="brand-logo"><img src="/assets/branding/laurentine-logo.png" className="brand-logo-icon" alt="Laurentine"/><div className="brand-wordmark"><span>Laurentine</span><sup className="brand-tm">TM</sup></div></div></Link>
    <nav className="reference-center-nav" aria-label="Browse navigation"><NavLink to="/love-notes">Browse</NavLink><NavLink to="/love-notes">Categories</NavLink>{user&&<><NavLink to="/library">Library</NavLink><NavLink to="/forum">Forum</NavLink><NavLink to="/orders">Orders</NavLink></>}</nav>
    <div className="reference-auth-nav">{user?<div className="account-menu-wrap"><button className="header-avatar" onClick={()=>setAccountOpen(v=>!v)}>{user.profileImageUrl?<img src={user.profileImageUrl} alt=""/>:initials(user.fullName)}</button>{accountOpen&&<div className="account-popover"><Link to="/profile" onClick={()=>setAccountOpen(false)}>Profile &amp; Settings</Link><button onClick={signOut}>Logout &nbsp; ⇥</button></div>}</div>:<><Link to="/login">Sign In</Link><Link to="/register" className="start-access-button">Start Access</Link></>}<button className="reference-menu-button" type="button" aria-label="Toggle menu" onClick={()=>setOpen(v=>!v)}><span/><span/><span/></button></div>
    {open&&<nav className="reference-mobile-menu"><NavLink to="/love-notes" onClick={()=>setOpen(false)}>Browse</NavLink><NavLink to="/love-notes" onClick={()=>setOpen(false)}>Categories</NavLink>{secondaryLinks.map(([to,label])=><NavLink key={to} to={to} onClick={()=>setOpen(false)}>{label}</NavLink>)}{user?<><NavLink to="/profile" onClick={()=>setOpen(false)}>Profile</NavLink><button onClick={signOut}>Logout</button></>:<><NavLink to="/login" onClick={()=>setOpen(false)}>Sign In</NavLink><NavLink to="/register" onClick={()=>setOpen(false)}>Start Access</NavLink></>}</nav>}</header><Outlet/><footer className="reference-footer"><div className="reference-footer-brand"><div className="brand-logo"><img src="/assets/branding/laurentine-logo.png" className="footer-brand brand-logo-icon" alt="Laurentine"/><div className="footer-brand brand-wordmark"><span>Laurentine</span><sup className="footer-brand brand-tm">TM</sup></div></div><p>Poetry that speaks. Moments that last.</p></div><nav className="reference-footer-nav"><Link to="/about">About</Link><a href="mailto:support@laurentine.co">✉</a><a href="#">◎</a><a href="#">●</a></nav></footer></div>
}
