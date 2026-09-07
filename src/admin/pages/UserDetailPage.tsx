import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminGetUser, type AdminUserDetail } from '../../services/api'

const fmtDate=(v?:string|null)=>v?new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(v)):'Not available'
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)
const initials=(name:string)=>name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()

export function UserDetailPage(){
 const {userId=''}=useParams()
 const [user,setUser]=useState<AdminUserDetail|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{let live=true;(async()=>{setLoading(true);try{const x=await adminGetUser(userId);if(live)setUser(x)}catch(e){if(live)setError(e instanceof Error?e.message:'Unable to load user')}finally{if(live)setLoading(false)}})();return()=>{live=false}},[userId])
 if(loading)return <><AdminHero title="User Details" copy="" action={<Link to="/admin/users" className="hs-outline">← Back to Users</Link>}/><Panel><div className="hs-empty">Loading user…</div></Panel></>
 if(error||!user)return <><AdminHero title="User Details" copy="" action={<Link to="/admin/users" className="hs-outline">← Back to Users</Link>}/><Panel><div className="hs-error">{error||'User not found'}</div></Panel></>
 return <>
  <AdminHero title="User Details" copy="" action={<Link to="/admin/users" className="hs-outline">← Back to Users</Link>}/>
  <Panel>
   <span className="hs-eyebrow">PROFILE</span><h2>User Overview</h2><p>Core account identity, permissions, and lifecycle dates.</p>
   <div className="hs-profile-row"><div className="hs-profile-avatar">{initials(user.fullName)}</div><div><h2>{user.fullName}</h2><p>{user.email}</p><div className="hs-badges"><em className="hs-pill green">● {user.role}</em><em className="hs-pill green">● {user.status}</em><em className="hs-pill green">● Joined {fmtDate(user.joinedAt)}</em><em className="hs-pill green">● Updated {fmtDate(user.updatedAt)}</em></div></div></div>
  </Panel>
  <Panel>
   <span className="hs-eyebrow">SUBSCRIPTION</span><h2>Subscription Details</h2><p>Current access, billing period, and cancellation status.</p>
   <div className="hs-detail-grid">
    <div><span>STATUS</span><b><em className={`hs-pill ${user.subscription?.status==='ACTIVE'?'green':''}`}>● {user.subscription?.status??'NONE'}</em></b></div>
    <div><span>HAS ACCESS</span><b>{user.subscription?.hasAccess?'Yes':'No'}</b></div>
    <div><span>CURRENT PERIOD END</span><b>{fmtDate(user.subscription?.currentPeriodEnd)}</b></div>
    <div><span>CANCEL AT PERIOD END</span><b>{user.subscription?.cancelAtPeriodEnd?'Yes':'No'}</b></div>
   </div>
  </Panel>
  <Panel>
   <span className="hs-eyebrow">PAYMENTS</span><h2>Payment History</h2><p>A light transaction list fetched securely from the database.</p>
   {user.payments.length===0?<div className="hs-empty plain">No payment history found.</div>:<div className="hs-payment-history">
    <div className="hs-pay-row head"><span>TRANSACTION</span><span>DATE</span><span>AMOUNT</span><span>STATUS</span></div>
    {user.payments.map(p=><div className="hs-pay-row" key={p.id}><span><b>{p.providerTransactionId}</b><small>{p.description}</small></span><span>{fmtDate(p.occurredAt)}</span><span>{money(p.amount)}</span><span><em className={`hs-pill ${p.status==='SUCCESS'?'green':'danger'}`}>{p.status}</em></span></div>)}
   </div>}
  </Panel>
 </>
}
