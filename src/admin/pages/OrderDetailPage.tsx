import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminGetOrder, adminSetOrderReviewed, adminSetOrderStatus, type AdminCardOrder } from '../../services/api'

const money=(n?:number|null)=>n==null?'Pending':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)
const dateFmt=(v?:string|null)=>v?new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(v)):'Not available'

export function OrderDetailPage(){
 const {orderId=''}=useParams(),[order,setOrder]=useState<AdminCardOrder|null>(null),[error,setError]=useState(''),[saving,setSaving]=useState(false)
 async function load(){try{setOrder(await adminGetOrder(orderId))}catch(e){setError(e instanceof Error?e.message:'Unable to load order')}}
 useEffect(()=>{load()},[orderId])
 async function setStatus(status:AdminCardOrder['status']){if(!order)return;setSaving(true);try{setOrder(await adminSetOrderStatus(order.id,status))}catch(e){setError(e instanceof Error?e.message:'Unable to update order')}finally{setSaving(false)}}
 async function toggleReviewed(){if(!order)return;setSaving(true);try{setOrder(await adminSetOrderReviewed(order.id,!order.reviewed))}catch(e){setError(e instanceof Error?e.message:'Unable to update order')}finally{setSaving(false)}}
 if(error&&!order)return <><AdminHero title="Order Details" copy="Review physical card order details and fulfillment progress." action={<Link className="hs-outline" to="/admin/orders">Back to Orders</Link>}/><div className="hs-error">{error}</div></>
 if(!order)return <div className="hs-empty">Loading order…</div>
 return <>
  <AdminHero title="Order Details" copy="Review physical card order details, shipping information, and fulfillment progress." action={<Link className="hs-outline" to="/admin/orders">← Back to Orders</Link>}/>
  <div className="hs-order-detail-grid"><Panel><span className="hs-eyebrow">ORDER</span><h2>{order.orderNumber}</h2><div className="hs-detail-grid"><div><span>CUSTOMER</span><b>{order.customerName}</b><small>{order.customerEmail}</small></div><div><span>CARD</span><b>{order.cardTitle}</b><small>{order.cardCategory||'Physical Card'}</small></div><div><span>QUANTITY</span><b>{order.quantity} card{order.quantity===1?'':'s'}</b></div><div><span>PLACED</span><b>{dateFmt(order.placedAt)}</b></div><div><span>SHIPPING FEE</span><b>{money(order.shippingFee)}</b></div><div><span>TOTAL AMOUNT</span><b>{money(order.totalAmount)}</b></div></div></Panel>
  <Panel><span className="hs-eyebrow">FULFILLMENT</span><h2>Order Status</h2><label className="hs-detail-select">Status<select disabled={saving} value={order.status} onChange={e=>setStatus(e.target.value as AdminCardOrder['status'])}><option value="PLACED">Placed</option><option value="QUOTED">Quoted</option><option value="IN_PROGRESS">In Progress</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select></label><button disabled={saving} onClick={toggleReviewed} className={order.reviewed?'hs-outline':'hs-btn'}>{order.reviewed?'Mark Unreviewed':'Mark Reviewed'}</button><div className="hs-order-dates"><p><span>Shipped</span><b>{dateFmt(order.shippedAt)}</b></p><p><span>Delivered</span><b>{dateFmt(order.deliveredAt)}</b></p></div></Panel></div>
  <Panel><span className="hs-eyebrow">SHIPPING</span><h2>Delivery Details</h2><div className="hs-detail-grid"><div><span>RECIPIENT</span><b>{order.shippingName||order.customerName}</b></div><div><span>TRACKING NUMBER</span><b>{order.trackingNumber||'Not available'}</b></div><div className="wide"><span>SHIPPING ADDRESS</span><b>{order.shippingAddress||'No shipping address stored yet.'}</b></div></div></Panel>
 </>
}
