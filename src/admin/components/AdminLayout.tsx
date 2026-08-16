import type { ReactNode } from 'react'
import logo from '../../assets/branding/laurentine-logo.png'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

const nav = [
  ['▦','Overview','Platform summary','/admin'], ['▣','Cards','Manage cards','/admin/cards'], ['◫','Collections','Browse groups','/admin/collections'], ['♙','Users','Profiles and Activity','/admin/users'],
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

export function AdminPagination({page,totalPages,total,onPageChange,pageSize=10}:{page:number;totalPages:number;total:number;onPageChange:(page:number)=>void;pageSize?:number}){
  if(totalPages<=1&&total<=pageSize)return <div className="hs-pagination single"><span>{total} record{total===1?'':'s'}</span></div>
  const start=total===0?0:(page-1)*pageSize+1, end=Math.min(total,page*pageSize)
  return <div className="hs-pagination"><span>Showing <b>{start}-{end}</b> of <b>{total}</b></span><div><button disabled={page<=1} onClick={()=>onPageChange(page-1)}>← Previous</button><span>Page <b>{page}</b> of <b>{totalPages}</b></span><button disabled={page>=totalPages} onClick={()=>onPageChange(page+1)}>Next →</button></div></div>
}
