import { useEffect, useState } from 'react'
import { AdminHero, Panel, StatCard } from '../components/AdminLayout'
import { adminGetSubscriptions, type AdminSubscriptionsResponse } from '../../services/api'

const initial:AdminSubscriptionsResponse={summary:{totalSubscribers:0,monthlyRevenue:0,activeSubscriptions:0,monthlyPrice:8.99},subscribers:[],transactions:[],failedPayments:[]}
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)
const date=(v:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(v))
function badge(v:string){return v==='SUCCESS'?'green':v==='FAILED'||v==='PAYMENT_ISSUE'?'danger':''}

export function SubscriptionsPage(){
 const [data,setData]=useState(initial),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{const t=setTimeout(async()=>{setLoading(true);setError('');try{setData(await adminGetSubscriptions({search,status}))}catch(e){setError(e instanceof Error?e.message:'Unable to load subscriptions')}finally{setLoading(false)}},180);return()=>clearTimeout(t)},[search,status])
 return <>
  <AdminHero eyebrow="ADMIN SECTION" title="Subscriptions & Payments" copy="A calm operational view of subscriber records, payment activity, and overall subscription health for the single monthly plan."/>
  <div className="hs-stats four">
   <StatCard label="TOTAL SUBSCRIBERS" value={data.summary.totalSubscribers} note="All records across active, cancelled, and payment issue accounts."/>
   <StatCard label="MONTHLY REVENUE" value={money(data.summary.monthlyRevenue)} note="Successful subscription payments recorded this month." accent/>
   <StatCard label="ACTIVE SUBSCRIPTIONS" value={data.summary.activeSubscriptions} note="Steady monthly access across the full card library."/>
   <StatCard label="MONTHLY PRICE" value={money(data.summary.monthlyPrice)} note="Configured monthly subscription price."/>
  </div>
  <Panel>
   <span className="hs-eyebrow">SUBSCRIBER RECORDS</span><h2>Subscriber List</h2><p>A premium operational view of member records, subscription status, billing rhythm, and recent payment standing.</p>
   <div className="hs-sub-filter"><label><span>SEARCH SUBSCRIBERS</span><div className="hs-search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email"/></div></label><label><span>FILTER BY STATUS</span><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All subscription statuses</option><option>ACTIVE</option><option>INCOMPLETE</option><option>PAYMENT_ISSUE</option><option>CANCELLED</option></select></label></div>
   {error&&<div className="hs-error">{error}</div>}
   <div className="hs-sub-table">
    <div className="hs-sub-row head"><span>USER NAME</span><span>EMAIL</span><span>PLAN</span><span>SUBSCRIPTION STATUS</span><span>NEXT BILLING DATE</span><span>PAYMENT STATUS</span><span>ACTIONS</span></div>
    {loading?<div className="hs-empty">Loading subscriber records…</div>:data.subscribers.length===0?<div className="hs-empty">No subscriber records found.</div>:data.subscribers.map(s=><div className="hs-sub-row" key={s.id}><span><b>{s.fullName}</b><small>Subscriber since {date(s.createdAt)}</small></span><span>{s.email}</span><span>{s.planName}</span><span><em className={`hs-pill ${badge(s.status)}`}>{s.status}</em></span><span>{s.currentPeriodEnd?date(s.currentPeriodEnd):'Not available'}</span><span><em className={`hs-pill ${badge(s.paymentStatus)}`}>{s.paymentStatus}</em></span><span><button className="hs-mini-btn">View Details</button></span></div>)}
   </div>
  </Panel>
  <div className="hs-sub-grid">
   <Panel><span className="hs-eyebrow">PAYMENT ACTIVITY</span><h2>Recent Transactions</h2><p>A clean, recent view of subscription payment activity.</p><div className="hs-simple-table"><div className="hs-simple-row head"><span>TRANSACTION ID</span><span>USER NAME</span><span>DATE</span><span>AMOUNT</span><span>STATUS</span></div>{data.transactions.length===0?<div className="hs-empty">No transactions found.</div>:data.transactions.map(t=><div className="hs-simple-row" key={t.id}><span><b>{t.providerTransactionId}</b><small>{t.description}</small></span><span>{t.fullName}</span><span>{date(t.date)}</span><span>{money(t.amount)}</span><span><em className={`hs-pill ${badge(t.status)}`}>{t.status}</em></span></div>)}</div></Panel>
   <Panel><span className="hs-eyebrow">ATTENTION NEEDED</span><h2>Failed Payments</h2><p>A focused list of subscriber accounts with recent payment issues that may need closer review.</p>{data.failedPayments.length===0?<div className="hs-empty">No failed payments found.</div>:<div className="hs-failed-list">{data.failedPayments.map(p=><div key={p.id}><b>{p.fullName}</b><span>{p.email}</span><em>{money(p.amount)}</em></div>)}</div>}</Panel>
  </div>
 </>
}
