import type { ReactNode } from 'react'
import logo from '../../assets/branding/laurentine-logo.png'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const nav = [
  ['▦','Overview','Platform summary','/admin'], ['▣','Cards','Manage cards','/admin/cards'], ['◫','Collections','Browse groups','/admin/collections'], ['⌘','Categories','Card occasions','/admin/categories'], ['♙','Users','Profiles and Activity','/admin/users'],
  ['▤','Subscriptions and Payments','Revenue and issues','/admin/subscriptions'], ['✎','Requests','Custom poetry','/admin/requests'], ['▣','Challenges','Monthly notes','/admin/challenges'],
  ['◇','Orders','Manage Card Orders','/admin/orders'], ['♧','Notifications','Email and SMS','/admin/notifications'], ['□','Community','Moderation','/admin/community'], ['⚙','Settings','System Values','/admin/settings'],
]

export function AdminLayout(){
  const { user, logout } = useAuth(); const navigate = useNavigate()
  async function signOut(){ try { await logout() } finally { navigate('/login',{replace:true}) } }
  return <div className="hs-admin"><aside className="hs-sidebar">
    <div className="hs-brand"><img src={logo}/><div><strong>Laurentine</strong><span>Admin console</span></div></div>
    <div className="hs-nav-label">ADMIN</div><nav>{nav.map(([icon,title,sub,to])=><NavLink key={to} end={to==='/admin'} to={to} className={({isActive})=>`hs-nav-item ${isActive?'active':''}`}><i>{icon}</i><span><b>{title}</b><small>{sub}</small></span></NavLink>)}</nav>
    <div className="hs-admin-user"><b>{user?.fullName}</b><small>{user?.email}</small></div>
    <button className="hs-logout" onClick={signOut}><i>↪</i><span><b>Logout</b><small>Sign out securely</small></span></button>
  </aside><main className="hs-admin-main"><Outlet/></main></div>
}

export function AdminHero({eyebrow='ADMIN PANEL',title,copy,action}:{eyebrow?:string,title:string,copy:string,action?:ReactNode}){ return <header className="hs-admin-hero"><div><span className="hs-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{action}</header> }
export function StatCard({label,value,note,accent=false}:{label:string,value:string|number,note:string,accent?:boolean}){return <div className={`hs-stat ${accent?'accent':''}`}><span>{label}</span><strong>{value}</strong><p>{note}</p></div>}
export function Panel({children,className=''}:{children:ReactNode,className?:string}){return <section className={`hs-panel ${className}`}>{children}</section>}
