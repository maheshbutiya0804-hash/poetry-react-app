import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHero, Panel, StatCard } from '../components/AdminLayout'
import { adminGetOverview, type AdminOverview } from '../../services/api'

const empty:AdminOverview={totalUsers:0,activeSubscribers:0,revenueThisMonth:0,pendingRequests:0,ordersInProgress:0,recentRequests:[],recentOrders:[]}
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)
const dateFmt=(v:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(v))

export function OverviewPage(){
 const [stats,setStats]=useState(empty)
 useEffect(()=>{adminGetOverview().then(setStats).catch(()=>{})},[])
 return <>
 <AdminHero eyebrow="ADMIN DASHBOARD" title="Overview" copy="A clear editorial view of members, subscriptions, requests, orders, and card activity across the platform."/>
 <div className="hs-stats five"><StatCard label="TOTAL USERS" value={stats.totalUsers} note="Registered members across the platform."/><StatCard accent label="ACTIVE SUBSCRIBERS" value={stats.activeSubscribers} note="Members with an active subscription right now."/><StatCard label="REVENUE THIS MONTH" value={money(stats.revenueThisMonth)} note="Current month revenue in the dashboard currency."/><StatCard label="PENDING REQUESTS" value={stats.pendingRequests} note="Custom poetry requests still awaiting work."/><StatCard label="ORDERS IN PROGRESS" value={stats.ordersInProgress} note="Physical orders not yet delivered or closed."/></div>
 <div className="hs-overview-grid"><Panel><div className="hs-panel-head"><div><span className="hs-eyebrow">REQUESTS</span><h2>Recent Requests</h2><p>Personalized poem requests moving through pending, in-progress, and completed states.</p></div><Link to="/admin/requests">View all →</Link></div>{stats.recentRequests?.length?<div className="hs-overview-list">{stats.recentRequests.map(r=><div key={r.id}><span><b>{r.requesterName}</b><small>{r.category}</small></span><em className="hs-pill">{r.status.replaceAll('_',' ')}</em><small>{dateFmt(r.createdAt)}</small></div>)}</div>:<div className="hs-empty-line">No recent poetry requests yet.</div>}</Panel>
 <Panel><span className="hs-eyebrow">ACTIONS</span><h2>Quick Actions</h2><p>Direct operational shortcuts for common admin work.</p><div className="hs-actions"><Link className="primary" to="/admin/cards/new"><b>Create New Card</b><small>Open the card editor and prepare a new premium design.</small><em>→</em></Link><Link to="/admin/cards"><b>Manage Cards</b><small>Review the published collection and update existing entries.</small><em>→</em></Link><Link to="/admin/cards"><b>Bulk Upload Cards</b><small>Prepare imports for larger card and poem batches.</small><em>→</em></Link><Link to="/admin/settings"><b>Update Printing Fee</b><small>Adjust the current printing fee from admin settings.</small><em>→</em></Link></div></Panel></div>
 <Panel><div className="hs-panel-head"><div><span className="hs-eyebrow">ORDERS</span><h2>Recent Orders</h2><p>Physical card orders with quantity-based shipping and status tracking.</p></div><Link to="/admin/orders">View all →</Link></div>{stats.recentOrders?.length?<div className="hs-overview-orders"><div className="head"><span>ORDER ID</span><span>USER</span><span>QUANTITY</span><span>STATUS</span><span>SHIPPING FEE</span><span>TOTAL AMOUNT</span><span>DATE</span></div>{stats.recentOrders.map(o=><div key={o.id}><span>#{o.orderNumber}</span><span>{o.customerName}</span><span>{o.quantity} card{o.quantity===1?'':'s'}</span><span><em className="hs-pill">{o.status.replaceAll('_',' ')}</em></span><span>{o.shippingFee==null?'Pending':money(o.shippingFee)}</span><span>{o.totalAmount==null?'–':money(o.totalAmount)}</span><span>{dateFmt(o.placedAt)}</span></div>)}</div>:<div className="hs-empty-line">No recent orders yet.</div>}</Panel>
 </>
}
