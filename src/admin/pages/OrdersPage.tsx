import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHero, Panel, StatCard } from '../components/AdminLayout'
import { adminGetOrders, type AdminOrdersResponse } from '../../services/api'

const initial:AdminOrdersResponse={summary:{total:0,placed:0,quoted:0,inProgress:0,shipped:0,delivered:0,cancelled:0},orders:[]}
const dateFmt=(v:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(v))
const statusLabel=(s:string)=>s.replaceAll('_',' ').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase())

export function OrdersPage(){
 const [data,setData]=useState(initial),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[reviewedOnly,setReviewedOnly]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('')
 async function load(){setLoading(true);setError('');try{setData(await adminGetOrders({search,status,reviewedOnly}))}catch(e){setError(e instanceof Error?e.message:'Unable to load orders')}finally{setLoading(false)}}
 useEffect(()=>{const t=setTimeout(load,160);return()=>clearTimeout(t)},[search,status,reviewedOnly])
 return <>
  <AdminHero title="Orders" copy="A refined view of physical card orders, shipping fees, and fulfillment progress across the platform." action={<span className="hs-outline">◇ Physical cards</span>}/>
  <div className="hs-stats seven hs-order-stats"><StatCard accent label="TOTAL ORDERS" value={data.summary.total} note="All physical card orders across the platform."/><StatCard label="ORDER PLACED" value={data.summary.placed} note="New orders awaiting shipping fee review."/><StatCard label="QUOTED" value={data.summary.quoted} note="Shipping fee has been added."/><StatCard label="IN PROGRESS" value={data.summary.inProgress} note="Confirmed or currently being prepared."/><StatCard label="SHIPPED" value={data.summary.shipped} note="Already dispatched and on the way."/><StatCard label="DELIVERED" value={data.summary.delivered} note="Successfully completed card deliveries."/><StatCard label="CANCELLED" value={data.summary.cancelled} note="Orders closed without fulfillment."/></div>
  <Panel>
   <span className="hs-eyebrow">ORDERS LIST</span><h2>All Orders</h2><p>Search across physical card orders and filter by fulfillment status. Shipping fee updates and status actions can continue from the order detail experience.</p>
   <div className="hs-filter hs-order-filter"><label className="hs-search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by order number, recipient, or card title"/></label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Order Status</option><option value="PLACED">Placed</option><option value="QUOTED">Quoted</option><option value="IN_PROGRESS">In Progress</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select><label className="hs-switch-label"><span className={`hs-switch ${reviewedOnly?'on':''}`} onClick={()=>setReviewedOnly(v=>!v)}><i/></span> Reviewed Only</label></div>
   {error&&<div className="hs-error">{error}</div>}
   {loading?<div className="hs-empty">Loading orders…</div>:data.orders.length===0?<div className="hs-empty"><h2>No orders found</h2><p>Physical card orders will appear here.</p></div>:<div className="hs-orders-table"><div className="hs-order-row head"><span>ORDER ID</span><span>CUSTOMER</span><span>NUMBER OF CARDS</span><span>SHIPPING FEE</span><span>STATUS</span><span>DATE</span><span>ACTION</span></div>{data.orders.map(o=><div className="hs-order-row" key={o.id}><span><code>{o.orderNumber.slice(0,9)}…</code></span><span><b>{o.customerName}</b><small>{o.cardTitle}{o.cardCategory?` – ${o.cardCategory}`:''}</small></span><span>{o.quantity} card{o.quantity===1?'':'s'}</span><span>{o.shippingFee==null?'Pending':`$${o.shippingFee.toFixed(2)}`}</span><span><em className={`hs-pill ${['DELIVERED','SHIPPED'].includes(o.status)?'green':''}`}>● {statusLabel(o.status)}</em></span><span>{dateFmt(o.placedAt)}</span><span className="hs-row-actions"><Link to={`/admin/orders/${o.id}`} title="View order">⌾</Link></span></div>)}</div>}
   {!loading&&data.orders.length>0&&<div className="hs-table-footer">Showing 1-{data.orders.length} of {data.orders.length}</div>}
  </Panel>
 </>
}
