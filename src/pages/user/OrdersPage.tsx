import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cancelMyOrder, getMyOrder, getMyOrders, UserOrder } from '../../services/api'

const money = (n: number | null | undefined) => n == null ? 'Pending' : `$${n.toFixed(2)}`
const short = (s: string) => s.length > 9 ? `${s.slice(0, 8)}...` : s

const statusText: Record<string, string> = {
  PLACED: 'We are reviewing shipping and will email you when the final price is ready.',
  QUOTED: 'Your shipping quote is ready for review.',
  CONFIRMED: 'Your order has been confirmed and is moving to preparation.',
  PREPARING: 'Your order is being prepared.',
  IN_PROGRESS: 'Your order is being prepared.',
  SHIPPED: 'Your order is on the way.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'This order was cancelled.',
  REJECTED: 'This order could not be fulfilled.',
}

const statusLabel = (status: string) => status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

function statusStyle(status: string) {
  switch (status) {
    case 'DELIVERED':
      return { backgroundColor: '#e7f0ea', color: '#2f6b4f' }
    case 'SHIPPED':
      return { backgroundColor: '#e8eef4', color: '#42617b' }
    case 'CONFIRMED':
      return { backgroundColor: '#eaf0ee', color: '#17392f' }
    case 'PREPARING':
    case 'IN_PROGRESS':
      return { backgroundColor: '#eee9f3', color: '#6b5277' }
    case 'CANCELLED':
    case 'REJECTED':
      return { backgroundColor: '#f5e8e6', color: '#8a5550' }
    case 'QUOTED':
      return { backgroundColor: '#edf0df', color: '#6c743b' }
    case 'PLACED':
    default:
      return { backgroundColor: '#f3ece0', color: '#a77b34' }
  }
}

function statusClasses(status: string) {
  switch (status) {
    case 'DELIVERED': return 'bg-[#e7f0ea] text-[#2f6b4f]'
    case 'SHIPPED': return 'bg-[#e8eef4] text-[#42617b]'
    case 'CONFIRMED': return 'bg-[#eaf0ee] text-[#17392f]'
    case 'PREPARING':
    case 'IN_PROGRESS': return 'bg-[#eee9f3] text-[#6b5277]'
    case 'CANCELLED':
    case 'REJECTED': return 'bg-[#f5e8e6] text-[#8a5550]'
    case 'QUOTED': return 'bg-[#edf0df] text-[#6c743b]'
    default: return 'bg-[#f3ece0] text-[#a77b34]'
  }
}

export function UserOrdersPage() {
  const [data, setData] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState('')

  const load = () => {
    setLoading(true)
    getMyOrders({ search, status }).then(setData).finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = window.setTimeout(load, 180)
    return () => window.clearTimeout(t)
  }, [search, status])

  async function cancel(order: UserOrder) {
    if (!confirm('Cancel this order?')) return
    try {
      await cancelMyOrder(order.id)
      load()
    } catch (error: any) {
      alert(error.message)
    }
  }

  async function copyOrderId(order: UserOrder) {
    try {
      await navigator.clipboard.writeText(order.orderNumber || order.id)
      setCopiedId(order.id)
      window.setTimeout(() => setCopiedId(current => current === order.id ? '' : current), 1500)
    } catch {
      // Clipboard can be unavailable on non-secure development origins.
    }
  }

  return (
    <main className="flex-1 flex flex-col">
      <section className="flex flex-1 flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_18%),linear-gradient(180deg,#fbf8f3_0%,#f6f2ec_100%)] px-16 pb-16 pt-10 text-[#2b2621] max-[1180px]:px-7 max-[760px]:px-[18px]">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-7">
          <div>
            <div className="mb-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#a98643]">Order Tracking</div>
            <h1 className="m-0 font-serif text-[64px] font-semibold leading-[0.94] tracking-[-0.04em] max-[760px]:text-[48px] max-[480px]:text-[40px]">Your Card Orders</h1>
            <p className="mt-3 max-w-[48ch] text-base leading-7 text-muted">Follow each poetry card order from request to delivery, with a clear view of shipping fees, status, and where things stand.</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <Stat n={data?.summary.activeOrders ?? 0} t="Active orders" />
            <Stat n={data?.summary.totalCardsOrdered ?? 0} t="Total cards ordered" />
            <Stat n={data?.summary.deliveredTotal ?? 0} t="Delivered total" />
          </div>
        </header>

        <section className="mb-5 flex items-center justify-between gap-4 rounded-[26px] border border-[rgba(57,47,39,0.12)] bg-[linear-gradient(180deg,rgba(249,245,239,0.88),rgba(252,250,247,0.95))] p-5 max-[980px]:flex-wrap max-[720px]:p-[18px]" aria-label="Orders filters">
          <div className="hs-orders-filter-row flex min-w-0 flex-1 items-center gap-3 max-[980px]:flex-wrap">
            <div className="relative mx-auto w-full flex-1 min-w-0">
              <svg aria-hidden="true" className="hs-orders-search-icon absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#877b70]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search by order number, recipient, or card title"
                className="h-[58px] w-full text-charcoal outline-none"
                style={{
                  padding: '13px 40px',
                  borderRadius: '3.40282e38px',
                  borderStyle: 'solid',
                  borderWidth: '1px',
                  borderColor: '#392f271a',
                  backgroundColor: '#f4eee5',
                }}
                type="search"
              />
            </div>
            <label
              className="relative flex min-h-[58px] min-w-[250px] items-center overflow-hidden max-[760px]:w-full"
              style={{
                padding: '0px 0px',
                borderRadius: '3.40282e38px',
                borderStyle: 'solid',
                borderWidth: '1px',
                borderColor: '#392f271a',
                backgroundColor: '#f4eee5',
              }}
            >
              <select style={{ background: 'rgb(244, 238, 229)', padding: '16px 14px'}} value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter orders by status" className="h-full min-h-[32px] flex-1 appearance-none bg-transparent p-0 pr-5 text-sm font-semibold text-[#433a32] outline-none">
                <option value="">Order Status</option>
                {['PLACED', 'QUOTED', 'CONFIRMED', 'PREPARING', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REJECTED'].map(value => <option key={value} value={value}>{statusLabel(value)}</option>)}
              </select>
              <svg aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8177]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
            </label>
          </div>
        </section>

        {loading ? (
          <section className="flex min-h-[280px] items-center justify-center text-muted">Loading orders...</section>
        ) : !data?.orders.length ? (
          <section className="mx-auto flex min-h-[320px] w-full max-w-2xl flex-col items-center justify-center gap-3 text-center">
            <h2 className="font-serif text-4xl font-semibold">No card orders yet</h2>
            <p className="text-muted">Your physical card orders will appear here.</p>
          </section>
        ) : (
          <section className="flex flex-col gap-[18px]">
            {data.orders.map((order: UserOrder) => (
              <article className="hs-order-card overflow-hidden rounded-[24px] border border-[rgba(74,60,47,0.08)] bg-white/50 shadow-[0_14px_34px_rgba(36,28,20,0.07)]" key={order.id}>
                <div className="hs-order-grid grid grid-cols-[230px_minmax(0,1fr)_220px] items-stretch gap-[22px] p-[22px] max-[1180px]:grid-cols-[220px_1fr] max-[820px]:grid-cols-1">
                  <div className="hs-order-preview-wrap flex justify-center">
                    {order.cardId ? (
                      <Link className="hs-order-preview-link block w-full max-w-[15.625rem]" to={`/cards/${order.cardId}`}>
                        <OrderPreview order={order} />
                      </Link>
                    ) : <div className="hs-order-preview-link block w-full max-w-[15.625rem]"><OrderPreview order={order} /></div>}
                  </div>

                  <div className="hs-order-main mt-4 flex h-full min-w-0 flex-col md:mt-0">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="m-0 font-serif text-[32px] font-semibold leading-none tracking-[-0.02em]">{order.cardTitle}</h2>
                        <div className="mt-3 flex flex-wrap items-center gap-2.5">
                          <button type="button" title="Copy full order ID" onClick={() => copyOrderId(order)} className="inline-flex min-h-10 max-w-full cursor-pointer items-center gap-2 rounded-full border border-forest/15 bg-[#f3f7f4] px-4 text-sm font-extrabold text-forest transition hover:-translate-y-px hover:bg-[#edf4ef] focus:outline-none focus:ring-2 focus:ring-forest/25 focus:ring-offset-2 focus:ring-offset-ivory">
                            <span className="truncate">{copiedId === order.id ? 'Copied!' : short(order.orderNumber || order.id)}</span>
                            <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                          </button>
                          <span className="text-sm text-muted">Placed {new Date(order.placedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-2.5 max-[640px]:ml-0 max-[640px]:items-start">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold ${statusClasses(order.status)}`}><span className="h-2 w-2 rounded-full bg-current" />{statusLabel(order.status)}</span>
                      </div>
                    </div>

                    <div className="mb-1 grid gap-2">
                      <div className="space-y-2 rounded-2xl border border-[rgba(74,60,47,0.08)] bg-[#fbf8f3]/70 px-4 py-3 text-sm leading-6 text-[#5f554c]"><span className="mr-2 font-semibold text-charcoal">Current status:</span>{statusText[order.status] || statusLabel(order.status)}</div>
                    </div>

                    <div className="mt-1 grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                      <OrderFact label="Recipient" value={order.shippingName || order.personalizationRecipient || 'Not provided'} />
                      <OrderFact label="Quantity" value={`${order.quantity} card${order.quantity === 1 ? '' : 's'}`} />
                      <OrderFact label="Shipping" value={order.shippingFee == null ? 'Awaiting quote' : money(order.shippingFee)} />
                    </div>

                    <div className="mt-auto pt-4 max-[820px]:hidden">
                      <OrderActions order={order} onCancel={cancel} />
                    </div>
                  </div>

                  <aside className="hs-order-aside flex flex-col gap-3 max-[1180px]:col-span-2 max-[1180px]:grid max-[1180px]:grid-cols-2 max-[820px]:col-span-1 max-[820px]:grid-cols-1">
                    <div className="rounded-2xl border border-[rgba(74,60,47,0.08)] bg-white/40 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8d8277]">Shipping Address</div>
                      <div className="whitespace-pre-line text-sm leading-6 text-charcoal">{order.shippingAddress || 'Not provided'}</div>
                    </div>
                    <div className="rounded-2xl border border-[rgba(74,60,47,0.08)] bg-white/40 p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8d8277]">Order Summary</div>
                      <div className="text-sm leading-6 text-charcoal">
                        <SummaryRow label="Card price" value={order.cardPrice == null ? 'Pending' : `${money(order.cardPrice)} each`} />
                        <SummaryRow label="Cards subtotal" value={money(order.subtotal)} />
                        <SummaryRow label="Printing Fees" value={money(order.printingFee ?? 7)} />
                        <SummaryRow label="Shipping" value={money(order.shippingFee)} pending={order.shippingFee == null} />
                        <SummaryRow label="Total" value={money(order.totalAmount)} pending={order.totalAmount == null} total />
                      </div>
                    </div>
                  </aside>

                  <div className="hs-order-mobile-actions hidden grid-cols-2 gap-2.5 max-[820px]:grid max-[420px]:grid-cols-1">
                    <OrderActions order={order} onCancel={cancel} />
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  )
}

function Stat({ n, t }: { n: number; t: string }) {
  return <div className="min-w-[150px] rounded-[18px] border border-[rgba(74,60,47,0.08)] bg-white/50 px-[18px] py-4 shadow-[0_10px_24px_rgba(36,28,20,0.05)] max-[560px]:flex-1"><strong className="block font-serif text-[32px] font-semibold leading-none">{String(n).padStart(2, '0')}</strong><span className="mt-1 block text-sm text-muted">{t}</span></div>
}

function OrderPreview({ order }: { order: UserOrder }) {
  if (order.previewUrl) {
    return (
      <div className="hs-order-preview-card card-tile-size overflow-hidden rounded-[10px] bg-[#eee7de] shadow-[0_10px_24px_rgba(36,28,20,0.05)] ring-1 ring-[rgba(255,255,255,0.14)]">
        <img
          src={order.previewUrl}
          alt={`${order.cardTitle} preview`}
          className="hs-order-preview-image"
        />
      </div>
    )
  }

  return (
    <article className="hs-order-preview-card card-tile-size relative overflow-hidden select-none rounded-[10px] bg-[linear-gradient(135deg,#352d5b_0%,#4b416f_38%,#9d6a61_100%)] text-white shadow-[0_10px_24px_rgba(36,28,20,0.05)] ring-1 ring-[rgba(255,255,255,0.14)]">
      <div className="absolute inset-0 z-[1] flex flex-col p-[16px_16px_18px]">
        <div className="flex max-w-[15ch] flex-1 flex-col justify-between gap-3">
          <h3 className="m-0 font-serif text-4xl font-semibold leading-[0.98]">{order.cardTitle}</h3>
          <p className="m-0 font-serif text-lg leading-[1.28]">Poetry card preview</p>
        </div>
      </div>
    </article>
  )
}

function OrderFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[14px] border border-[rgba(74,60,47,0.08)] bg-white/40 px-3.5 py-3"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#8d8277]">{label}</span><div className="text-sm leading-6 text-charcoal">{value}</div></div>
}

function SummaryRow({ label, value, pending = false, total = false }: { label: string; value: string; pending?: boolean; total?: boolean }) {
  return <div className={`flex items-start justify-between gap-3 py-1 text-sm leading-5 ${total ? 'mt-1 border-t border-[rgba(74,60,47,0.1)] pt-2' : ''}`}><span className="text-[#71665c]">{label}</span>{pending ? <span className="text-right text-xs italic text-[#9a8f84]">Pending</span> : <strong className="text-right font-semibold text-charcoal">{value}</strong>}</div>
}

function OrderActions({ order, onCancel }: { order: UserOrder; onCancel: (order: UserOrder) => void }) {
  const canCancel = ['PLACED', 'QUOTED'].includes(order.status)
  return <div className={`hs-order-actions grid gap-2.5 ${canCancel ? 'grid-cols-2 max-[420px]:grid-cols-1' : 'grid-cols-1'}`}>
    <Link className="hs-order-action-view inline-flex min-h-11 w-full items-center justify-center rounded-[10px] border border-forest/15 bg-[#fbf8f3] px-3 text-center text-sm font-semibold leading-5 text-forest transition hover:-translate-y-px hover:bg-[#eff3f0] max-[380px]:text-xs" to={`/orders/${order.id}`}>View Order Details</Link>
    {canCancel && <button type="button" onClick={() => onCancel(order)} className="hs-order-action-cancel inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[rgba(125,74,74,0.22)] bg-[#fffaf4] px-3 text-center text-sm font-semibold leading-5 text-[#7a4a4a] transition hover:-translate-y-px hover:bg-[#fff4ed]"><svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>Cancel Order</button>}
  </div>
}

export function UserOrderDetailPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<UserOrder | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getMyOrder(orderId)
      .then(setOrder)
      .catch(error => setError(error instanceof Error ? error.message : 'Unable to load order'))
  }, [orderId])

  async function copyDetailOrderId() {
    if (!order) return
    try {
      await navigator.clipboard.writeText(order.orderNumber || order.id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable on non-secure dev origins.
    }
  }

  if (error) {
    return <main className="flex-1 flex items-center justify-center min-h-[360px] text-muted">{error}</main>
  }

  if (!order) {
    return <main className="flex-1 flex items-center justify-center min-h-[360px] text-muted">Loading order...</main>
  }

  const placedDate = new Date(order.placedAt)
  const updatedDate = new Date((order as any).updatedAt || order.placedAt)
  const quantityLabel = `${order.quantity} ${order.quantity === 1 ? 'poetry card' : 'poetry cards'}`
  const category = (order as any).categoryName || (order as any).category || 'Not provided'
  const deliveryDate = (order as any).deliveryDate
    ? new Date((order as any).deliveryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '-'

  const stages = [
    { key: 'PLACED', label: 'Order Placed' },
    { key: 'QUOTED', label: 'Shipping Quoted' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
  ]

  const normalizedStatus = order.status === 'IN_PROGRESS' ? 'PREPARING' : order.status
  const currentStage = Math.max(0, stages.findIndex(stage => stage.key === normalizedStatus))
  const isTerminalFailure = ['CANCELLED', 'REJECTED'].includes(order.status)

  return (
    <main className="flex-1 flex flex-col">
      <main className="flex flex-1 flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_18%),linear-gradient(180deg,#fbf8f3_0%,#f6f2ec_100%)] text-[#2b2621]">
        <section className="hs-detail-shell mx-auto w-[min(1240px,calc(100%_-_56px))] py-10 max-[760px]:w-[min(100%,calc(100%_-_24px))]">
          <header className="mb-7">
            <Link className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-forest" to="/orders">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
              Back to Orders
            </Link>

            <section className="flex flex-col gap-5 justify-between items-center md:flex-row">
              <div className="flex gap-1 flex-col">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#a98643]">Order Detail</div>
                <h1 className="font-serif text-[62px] font-semibold leading-[0.94] tracking-[-0.04em] max-[760px]:text-[45px] max-[480px]:text-[38px]">Order Details</h1>
                <p className="mt-3 max-w-[56ch] text-base leading-7 text-muted">Review the details of your order and its delivery progress.</p>
              </div>

              <a className="inline-flex min-h-12 h-fit items-center justify-center gap-2 rounded-full border border-[rgba(74,60,47,0.12)] bg-white/70 px-5 text-sm font-semibold text-forest shadow-[0_10px_24px_rgba(36,28,20,0.05)] transition hover:-translate-y-px hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#17392f]/20" href="mailto:support@laurentine.co">
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                Contact Support
              </a>
            </section>
          </header>

          <section className="hs-detail-summary mb-6 rounded-[26px] border border-[rgba(74,60,47,0.08)] bg-white/55 p-6 shadow-[0_14px_34px_rgba(36,28,20,0.07)]">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-[36px] font-semibold leading-none tracking-[-0.02em]">Order Summary</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Placed on {placedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - {statusText[order.status] || statusLabel(order.status)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold" style={statusStyle(order.status)}>
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {statusLabel(order.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
              <div className="rounded-2xl border border-[rgba(74,60,47,0.08)] bg-white/50 p-4">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#8d8277]">Order ID</span>
                <button type="button" title="Copy full order ID" onClick={copyDetailOrderId} className="inline-flex min-h-10 max-w-full cursor-pointer items-center gap-2 rounded-full border border-forest/15 bg-[#f3f7f4] px-4 text-sm font-extrabold text-forest transition hover:-translate-y-px hover:bg-[#edf4ef]">
                  <span className="truncate">{copied ? 'Copied!' : short(order.orderNumber || order.id)}</span>
                  <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                </button>
              </div>
              <DetailFact label="Date Placed" value={placedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} />
              <DetailFact label="Last Updated" value={updatedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} />
              <DetailFact label="Items" value={quantityLabel} />
            </div>
          </section>

          <div className="hs-detail-columns grid grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)] items-start gap-5 max-[980px]:grid-cols-1">
            <div className="hs-detail-left grid gap-5">
              <section className="hs-detail-panel hs-detail-items rounded-[24px] border border-[rgba(74,60,47,0.08)] bg-white/50 p-[22px] shadow-[0_10px_24px_rgba(36,28,20,0.05)]">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[32px] font-semibold leading-none tracking-[-0.02em]">Ordered Items</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">A refined view of the card included in this order.</p>
                  </div>
                </div>

                <article className="hs-detail-item-card grid grid-cols-[250px_minmax(0,1fr)] gap-4 rounded-[18px] border border-[rgba(74,60,47,0.08)] bg-white/45 p-4 max-[700px]:grid-cols-1">
                  <div className="flex justify-center">
                    {order.cardId ? (
                      <Link className="block w-full max-w-[15.625rem]" to={`/cards/${order.cardId}`}>
                        <OrderPreview order={order} />
                      </Link>
                    ) : (
                      <div className="block w-full max-w-[15.625rem]"><OrderPreview order={order} /></div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div><h3 className="font-serif text-[30px] font-semibold leading-none tracking-[-0.02em]">{order.cardTitle}</h3></div>
                      <span className="inline-flex rounded-full border border-[rgba(74,60,47,0.08)] bg-[#f3ece2] px-3.5 py-2 text-sm font-semibold text-[#5e5347]">Qty {order.quantity}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-[900px]:grid-cols-1">
                      <DetailFact label="Recipient" value={order.shippingName || order.personalizationRecipient || 'Not provided'} compact />
                      <DetailFact label="Category" value={category} compact />
                      <DetailFact label="From" value={order.personalizationSender || 'Not Provided'} compact />
                      <DetailFact label="To" value={order.personalizationRecipient || order.shippingName || 'Not Provided'} compact />
                    </div>

                    <div className="mt-3 flex flex-1 flex-col rounded-[18px] border border-[rgba(57,47,39,0.1)] bg-[#fcfaf7] px-4 py-3">
                      <span className="mb-2 block text-[0.73rem] font-semibold uppercase tracking-[0.14em] text-[#776d62]">Custom Message</span>
                      <p className="m-0 overflow-hidden text-ellipsis whitespace-pre-line text-[0.95rem] leading-6 text-[#655a4f] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                        {(order as any).customMessage || (order as any).personalizationMessage || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </article>
              </section>

              <section className="hs-detail-panel hs-detail-delivery rounded-[24px] border border-[rgba(74,60,47,0.08)] bg-white/50 p-[22px] shadow-[0_10px_24px_rgba(36,28,20,0.05)]">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[32px] font-semibold leading-none tracking-[-0.02em]">Delivery Progress</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">A simple view of where your order is now.</p>
                  </div>
                </div>

                {!isTerminalFailure && (
                  <>
                    <div className="relative w-full max-[640px]:hidden">
                      <div className="absolute h-[3px] bg-[#e9e1d6]" style={{ top: 7, left: 0, right: 0 }} />
                      <div className="relative mb-3" style={{ height: 16 }}>
                        {stages.map((stage, index) => {
                          const done = index <= currentStage
                          return <span key={stage.key} className={`absolute z-10 h-4 w-4 -translate-x-1/2 rounded-full border-2 transition-colors ${done ? 'border-forest bg-forest' : 'border-[rgba(57,47,39,0.2)] bg-[#efe8de]'}`} style={{ left: `${(index / (stages.length - 1)) * 100}%`, top: 0 }} />
                        })}
                      </div>
                      <div className="relative" style={{ height: '3rem' }}>
                        {stages.map((stage, index) => {
                          const pct = (index / (stages.length - 1)) * 100
                          const active = index <= currentStage
                          return (
                            <div key={stage.key} className="absolute" style={{ left: `${pct}%`, transform: index === 0 ? 'translateX(0)' : index === stages.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)', maxWidth: '20.6667%' }}>
                              <span className={`block text-[0.8rem] leading-[1.3] ${index === 0 ? 'text-left' : index === stages.length - 1 ? 'text-right' : 'text-center'} ${active ? 'font-semibold text-charcoal' : 'text-[#8c8175]'}`}>{stage.label}</span>
                              {index === 0 && <span className="mt-0.5 block text-[0.72rem] text-[#9a8f84] text-left">{placedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="hidden max-[640px]:block">
                      <div className="grid gap-0">
                        {stages.map((stage, index) => {
                          const done = index <= currentStage
                          const last = index === stages.length - 1
                          return (
                            <div key={stage.key} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3">
                              <div className="relative flex justify-center">
                                {!last && <span className={`absolute top-4 h-full w-[2px] ${done ? 'bg-forest' : 'bg-[#e9e1d6]'}`} />}
                                <span className={`relative z-10 mt-1 h-4 w-4 rounded-full border-2 ${done ? 'border-forest bg-forest' : 'border-[rgba(57,47,39,0.2)] bg-[#efe8de]'}`} />
                              </div>
                              <div className="pb-4">
                                <div className={`text-sm leading-5 ${done ? 'font-semibold text-charcoal' : 'text-[#8c8175]'}`}>{stage.label}</div>
                                {index === 0 && <div className="mt-0.5 text-xs leading-5 text-[#9a8f84]">{placedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-2 rounded-[14px] border border-[rgba(74,60,47,0.08)] bg-[#fbf8f3] px-4 py-3 text-sm leading-6 text-[#5f554c]">
                  <span className="mr-2 font-semibold text-charcoal">{statusLabel(order.status)}:</span>{statusText[order.status] || statusLabel(order.status)}
                </div>
              </section>
            </div>

            <div className="hs-detail-right grid gap-5">
              <section className="hs-detail-panel hs-detail-shipping rounded-[24px] border border-[rgba(74,60,47,0.08)] bg-white/50 p-[22px] shadow-[0_10px_24px_rgba(36,28,20,0.05)]">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[32px] font-semibold leading-none tracking-[-0.02em]">Shipping Information</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">Recipient and delivery details for this order.</p>
                  </div>
                </div>
                <div className="grid gap-3.5">
                  <DetailFact label="Recipient" value={order.shippingName || order.personalizationRecipient || 'Not provided'} compact />
                  <DetailFact label="Shipping Address" value={order.shippingAddress || 'Not provided'} compact />
                  <DetailFact label="Delivery Date" value={deliveryDate} compact />
                  {order.trackingNumber && <DetailFact label="Tracking Number" value={order.trackingNumber} compact />}
                </div>
              </section>

              <section className="hs-detail-panel hs-detail-billing rounded-[24px] border border-[rgba(74,60,47,0.08)] bg-white/50 p-[22px] shadow-[0_10px_24px_rgba(36,28,20,0.05)]">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-[32px] font-semibold leading-none tracking-[-0.02em]">Billing Summary</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">A minimal view of your payment details.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  <BillingRow label="Card price" value={order.cardPrice == null ? 'Pending' : `${money(order.cardPrice)} each`} />
                  <BillingRow label="Quantity" value={String(order.quantity)} />
                  <BillingRow label="Cards subtotal" value={money(order.subtotal)} />
                  <BillingRow label="Printing fee" value={money(order.printingFee ?? 7)} />
                  <BillingRow label="Shipping" value={money(order.shippingFee)} pending={order.shippingFee == null} />
                  <BillingRow label="Total" value={money(order.totalAmount)} pending={order.totalAmount == null} total />
                </div>
              </section>
            </div>
          </div>

          <div className="mt-5" />
        </section>
      </main>
    </main>
  )
}

function DetailFact({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className={compact ? 'rounded-2xl border border-[rgba(74,60,47,0.08)] bg-white/45 p-4' : 'rounded-2xl border border-[rgba(74,60,47,0.08)] bg-white/50 p-4'}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#8d8277]">{label}</span>
      <div className="overflow-hidden text-ellipsis whitespace-pre-line text-sm leading-6 text-charcoal">{value}</div>
    </div>
  )
}

function BillingRow({ label, value, pending = false, total = false }: { label: string; value: string; pending?: boolean; total?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 text-sm text-[#584f45] ${total ? 'mt-1 border-t border-[rgba(74,60,47,0.12)] pt-4 font-semibold' : ''}`}>
      <span>{label}</span>
      {pending ? <span className="text-right text-xs italic text-[#9a8f84]">Pending</span> : <span className="text-right font-semibold text-charcoal">{value}</span>}
    </div>
  )
}

