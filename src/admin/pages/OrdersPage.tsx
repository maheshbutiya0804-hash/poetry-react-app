import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPagination } from '../components/AdminLayout'
import { adminGetOrders, type AdminCardOrder, type AdminOrdersResponse } from '../../services/api'

const initial: AdminOrdersResponse = {
  summary: { total: 0, placed: 0, quoted: 0, inProgress: 0, shipped: 0, delivered: 0, cancelled: 0 },
  orders: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
}

const dateFmt = (value: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(value))

const statusLabel = (status: string) =>
  status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 text-[#5f5148]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8177]" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

function PackageCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22V12" />
      <path d="m16 17 2 2 4-4" />
      <path d="M21 11.127V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.729l7 4a2 2 0 0 0 2 .001l1.32-.753" />
      <path d="M3.29 7 12 12l8.71-5" />
      <path d="m7.5 4.27 8.997 5.148" />
    </svg>
  )
}

function OrderStatusBadge({ status }: { status: AdminCardOrder['status'] }) {
  const success = status === 'SHIPPED' || status === 'DELIVERED'
  const warning = status === 'QUOTED' || status === 'IN_PROGRESS'
  const cancelled = status === 'CANCELLED'
  const className = cancelled
    ? 'border-[rgba(125,74,74,0.18)] bg-[#fff4f2] text-[#7a4a4a]'
    : success
      ? 'border-[rgba(23,57,47,0.15)] bg-[#edf4ef] text-[#17392f]'
      : warning
        ? 'border-[rgba(170,127,56,0.18)] bg-[#fbf5e9] text-[#8a682d]'
        : 'border-[rgba(119,109,98,0.16)] bg-[rgba(119,109,98,0.1)] text-[#675d55]'
  return (
    <span className={`inline-flex min-h-[34px] items-center gap-2 whitespace-nowrap rounded-full border px-3 text-[0.84rem] font-bold ${className}`}>
      <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-current opacity-85" />
      {statusLabel(status)}
    </span>
  )
}

function SummaryCard({ label, value, note, active = false }: { label: string; value: number; note: string; active?: boolean }) {
  return (
    <article className={`min-w-0 rounded-[26px] border p-5 shadow-[0_10px_22px_rgba(47,37,28,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(47,37,28,0.06)] ${active ? 'border-[rgba(23,57,47,0.35)] bg-[linear-gradient(160deg,rgba(23,57,47,0.98),rgba(39,74,63,0.94))] shadow-[0_18px_32px_rgba(23,57,47,0.14)]' : 'border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] hover:border-[rgba(23,57,47,0.14)]'}`} style={active ? { color: '#ffffff' } : undefined}>
      <span className={`mb-3 inline-flex items-center gap-2 text-[0.74rem] font-semibold uppercase tracking-[0.14em] ${active ? '!text-white' : 'text-[#776d62]'}`} style={active ? { color: '#ffffff' } : undefined}>{label}</span>
      <h2 className={`m-0 text-4xl font-bold leading-none tracking-[-0.04em] ${active ? '!text-white' : 'text-[#17392f]'}`} style={active ? { color: '#ffffff' } : undefined}>{value}</h2>
      <p className={`mt-2.5 text-sm ${active ? '!text-white' : 'text-[#776d62]'}`} style={active ? { color: 'rgba(255,255,255,0.88)' } : undefined}>{note}</p>
    </article>
  )
}

export function OrdersPage() {
  const [data, setData] = useState(initial)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [reviewedOnly, setReviewedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      setData(await adminGetOrders({ search, status, reviewedOnly, page, pageSize: 10 }))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 160)
    return () => clearTimeout(timer)
  }, [search, status, reviewedOnly, page])

  useEffect(() => setPage(1), [search, status, reviewedOnly])

  async function copyOrderId(order: AdminCardOrder) {
    const value = order.orderNumber || order.id
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(order.id)
      window.setTimeout(() => setCopiedId(''), 1300)
    } catch {
      setCopiedId('')
    }
  }

  const start = data.pagination.total === 0 ? 0 : (data.pagination.page - 1) * data.pagination.pageSize + 1
  const end = Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)

  return (
    <main className="min-w-0 px-8 py-7 pb-[42px] max-[760px]:px-[18px]">
      <div className="mx-auto max-w-[1540px]">
        <div className="space-y-6">
          <header className="mb-6 rounded-[30px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-[30px] shadow-[0_18px_40px_rgba(47,37,28,0.06)] max-[980px]:p-6 max-[760px]:p-5">
            <span className="mb-2 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-[#776d62]">Admin panel</span>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="m-0 font-serif text-[clamp(2.7rem,4vw,3.7rem)] font-semibold leading-[0.94] tracking-[-0.03em] text-[#2f2a25] max-[760px]:text-[2.5rem]">Orders</h1>
                <p className="mt-2.5 max-w-[760px] text-base text-[#776d62]">A refined view of physical card orders, shipping fees, and fulfillment progress across the platform.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-[18px] border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] px-4 py-3 text-[#17392f] shadow-[0_10px_22px_rgba(47,37,28,0.04)] sm:inline-flex">
                <PackageCheckIcon />
                <span className="text-sm font-bold">Physical cards</span>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-7 gap-4 max-[1540px]:grid-cols-4 max-[1180px]:grid-cols-3 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1" aria-label="Order summary">
            <SummaryCard active label="Total Orders" value={data.summary.total} note="All physical card orders across the platform." />
            <SummaryCard label="Order Placed" value={data.summary.placed} note="New orders awaiting shipping fee review." />
            <SummaryCard label="Quoted" value={data.summary.quoted} note="Shipping fee has been added." />
            <SummaryCard label="In Progress" value={data.summary.inProgress} note="Confirmed or currently being prepared." />
            <SummaryCard label="Shipped" value={data.summary.shipped} note="Already dispatched and on the way." />
            <SummaryCard label="Delivered" value={data.summary.delivered} note="Successfully completed card deliveries." />
            <SummaryCard label="Cancelled" value={data.summary.cancelled} note="Orders closed without fulfillment." />
          </section>

          <section className="min-w-0 rounded-[30px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-6 shadow-[0_18px_40px_rgba(47,37,28,0.06)] max-[760px]:p-5" aria-labelledby="orders-list-title">
            <div className="mb-[18px] flex items-start justify-between gap-[18px]">
              <div>
                <span className="mb-2 inline-block text-[0.72rem] uppercase tracking-[0.18em] text-[#776d62]">Orders list</span>
                <h2 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#2f2a25] max-[760px]:text-[1.72rem]" id="orders-list-title">All Orders</h2>
                <p id="ordersListDescription" className="mt-2 max-w-[760px] text-[0.95rem] text-[#776d62]">Search across physical card orders and filter by fulfillment status. Shipping fee updates and status actions can continue from the order detail experience.</p>
              </div>
            </div>

            <section className="mb-5 flex items-center justify-between gap-4 rounded-[26px] border border-[rgba(57,47,39,0.12)] bg-[linear-gradient(180deg,rgba(249,245,239,0.88),rgba(252,250,247,0.95))] p-5 max-[980px]:flex-wrap max-[720px]:p-[18px]" aria-label="Orders filters">
              <div className="flex min-w-0 flex-1 items-center gap-3 max-[980px]:flex-wrap">
                <div className="relative min-w-0 flex-1 max-[980px]:w-full max-[980px]:flex-none">
                  <SearchIcon />
                  <input
                    placeholder="Search by order number, recipient, or card title"
                    className="h-[58px] w-full rounded-[3.40282e38px] border border-[rgba(57,47,39,0.1)] bg-[#f4eee5] py-0 pl-[58px] pr-[22px] text-charcoal outline-none transition placeholder:text-[#8c8175] focus:border-forest/25 focus:bg-[#faf7f2] focus:ring-4 focus:ring-forest/5"
                    type="search"
                    style={{ borderRadius: '3.40282e38px' }}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <label style={{ borderRadius: '3.40282e38px' }} className="relative flex min-h-[58px] min-w-[250px] items-center overflow-hidden rounded-[3.40282e38px] border border-[rgba(74,60,47,0.1)] bg-[#f4eee5] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition focus-within:border-forest/25 focus-within:bg-[#faf7f2] focus-within:ring-4 focus-within:ring-forest/5 max-[760px]:w-full">
                  <select aria-label="Filter orders by status" className="h-full min-h-[58px] flex-1 appearance-none bg-transparent py-0 pl-4 pr-11 text-sm font-semibold text-[#433a32] outline-none" value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="">Order Status</option>
                    <option value="PLACED">Placed</option>
                    <option value="QUOTED">Quoted</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <ChevronDownIcon />
                </label>
                <label style={{ borderRadius: '3.40282e38px' }} className="relative flex min-h-[54px] shrink-0 cursor-pointer items-center gap-3 rounded-[3.40282e38px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-5 outline-none transition hover:border-[rgba(23,57,47,0.18)] hover:bg-[#fffdfa] focus-within:border-[rgba(23,57,47,0.26)] focus-within:bg-[#fffdfa] focus-within:ring-4 focus-within:ring-[rgba(23,57,47,0.06)] max-[640px]:w-full">
                  <span className="relative flex items-center">
                    <input className="peer sr-only" aria-label="Toggle reviewed orders only" type="checkbox" checked={reviewedOnly} onChange={(event) => setReviewedOnly(event.target.checked)} />
                    <span className="h-[22px] w-10 rounded-full bg-[rgba(57,47,39,0.2)] transition-colors duration-300 peer-checked:bg-[#17392f]" />
                    <span className="absolute left-[2px] top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-[18px]" />
                  </span>
                  <span className="select-none text-[0.94rem] text-[#2f2a25]">Reviewed Only</span>
                </label>
              </div>
            </section>

            {error && <div className="mb-5 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            {loading ? (
              <div className="grid min-h-[280px] place-items-center text-[#776d62]">Loading orders…</div>
            ) : data.orders.length === 0 ? (
              <section className="mx-auto flex min-h-[280px] max-w-2xl flex-col items-center justify-center gap-4 text-center">
                <h3 className="m-0 font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em] text-[#2f2a25] md:text-5xl">No orders found</h3>
                <p className="m-0 text-sm text-[#776d62] md:text-base">Physical card orders will appear here.</p>
              </section>
            ) : (
              <>
                <div className="overflow-x-auto rounded-[24px] border border-[rgba(57,47,39,0.12)] bg-[rgba(252,250,247,0.88)] max-[760px]:hidden">
                  <table className="w-full min-w-[1180px] table-fixed border-collapse" aria-describedby="ordersListDescription">
                    <colgroup>
                      <col className="w-[17%]" />
                      <col className="w-[23%]" />
                      <col className="w-[12%]" />
                      <col className="w-[13%]" />
                      <col className="w-[13%]" />
                      <col className="w-[13%]" />
                      <col className="w-[9%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-[rgba(241,235,226,0.45)]">
                        {['Order ID', 'Customer', 'Number of Cards', 'Shipping Fee', 'Status', 'Date', 'Action'].map((heading) => (
                          <th key={heading} className="whitespace-nowrap border-b border-[rgba(57,47,39,0.12)] px-5 py-[18px] text-left text-[0.74rem] font-bold uppercase tracking-[0.16em] text-[#776d62]">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => (
                        <tr key={order.id} className="border-b border-[rgba(57,47,39,0.09)] transition last:border-b-0 hover:bg-[rgba(23,57,47,0.028)]">
                          <td className="px-5 py-[18px] align-middle text-[0.95rem]">
                            <button type="button" title="Copy full order ID" onClick={() => copyOrderId(order)} className="inline-flex min-h-10 max-w-full cursor-pointer items-center gap-2 rounded-full border border-forest/15 bg-[#f3f7f4] px-4 text-sm font-extrabold text-forest transition hover:-translate-y-px hover:bg-[#edf4ef] focus:outline-none focus:ring-2 focus:ring-forest/25 focus:ring-offset-2 focus:ring-offset-ivory">
                              <span className="truncate">{copiedId === order.id ? 'Copied!' : `${(order.orderNumber || order.id).slice(0, 9)}…`}</span>
                              <CopyIcon />
                            </button>
                          </td>
                          <td className="px-5 py-[18px] align-middle text-[0.95rem]">
                            <span className="block truncate font-bold tracking-[-0.01em] text-[#2f2a25]">{order.customerName}</span>
                            <span className="mt-1 block truncate text-[0.86rem] text-[#776d62]">{order.cardTitle}{order.cardCategory ? ` - ${order.cardCategory}` : ''}</span>
                          </td>
                          <td className="px-5 py-[18px] align-middle text-[0.95rem] text-[#2f2a25]">{order.quantity} card{order.quantity === 1 ? '' : 's'}</td>
                          <td className="px-5 py-[18px] align-middle text-[0.95rem] text-[#2f2a25]">{order.shippingFee == null ? 'Pending' : `$${order.shippingFee.toFixed(2)}`}</td>
                          <td className="px-5 py-[18px] align-middle text-[0.95rem]"><OrderStatusBadge status={order.status} /></td>
                          <td className="px-5 py-[18px] align-middle text-[0.95rem] text-[#2f2a25]">{dateFmt(order.placedAt)}</td>
                          <td className="px-5 py-[18px] align-middle text-[0.95rem]">
                            <Link aria-label="View order" title="View order" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] text-[#17392f] shadow-[0_10px_22px_rgba(47,37,28,0.04)] transition hover:-translate-y-px hover:border-[rgba(23,57,47,0.16)] hover:bg-[#fbf8f3]" to={`/admin/orders/${order.id}`}>
                              <EyeIcon />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(57,47,39,0.12)] px-5 py-4">
                    <div className="text-[0.9rem] text-[#776d62]">Showing <span className="font-bold text-[#2f2a25]">{start}-{end}</span> of <span className="font-bold text-[#2f2a25]">{data.pagination.total}</span></div>
                    <AdminPagination {...data.pagination} onPageChange={setPage} />
                  </footer>
                </div>

                <div className="hidden gap-3.5 max-[760px]:grid">
                  {data.orders.map((order) => (
                    <article key={order.id} className="rounded-[22px] border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] p-[18px] shadow-[0_10px_22px_rgba(47,37,28,0.04)] max-[560px]:p-5">
                      <div className="mb-4 flex items-start justify-between gap-3.5 max-[560px]:mb-[18px] max-[560px]:flex-col">
                        <div className="flex min-w-0 flex-col gap-5">
                          <button type="button" title="Copy full order ID" onClick={() => copyOrderId(order)} className="inline-flex min-h-10 max-w-full cursor-pointer items-center gap-2 self-start rounded-full border border-forest/15 bg-[#f3f7f4] px-4 text-sm font-extrabold text-forest transition hover:-translate-y-px hover:bg-[#edf4ef]">
                            <span className="truncate">{copiedId === order.id ? 'Copied!' : `${(order.orderNumber || order.id).slice(0, 9)}…`}</span>
                            <CopyIcon />
                          </button>
                          <div className="min-w-0">
                            <span className="block truncate font-bold tracking-[-0.01em] text-[#2f2a25]">{order.customerName}</span>
                            <span className="mt-1 block truncate text-[0.86rem] text-[#776d62]">{order.cardTitle}{order.cardCategory ? ` - ${order.cardCategory}` : ''}</span>
                          </div>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="grid gap-[11px] max-[560px]:grid-cols-2 max-[560px]:gap-x-[18px] max-[560px]:gap-y-3.5">
                        {[
                          ['Cards', `${order.quantity} card${order.quantity === 1 ? '' : 's'}`],
                          ['Shipping Fee', order.shippingFee == null ? 'Pending' : `$${order.shippingFee.toFixed(2)}`],
                          ['Date', dateFmt(order.placedAt)],
                          ['Card', order.cardTitle],
                        ].map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[110px_minmax(0,1fr)] items-start gap-3 max-[560px]:grid-cols-1 max-[560px]:gap-1.5 max-[560px]:rounded-[18px] max-[560px]:border max-[560px]:border-[rgba(57,47,39,0.08)] max-[560px]:bg-[rgba(252,250,247,0.82)] max-[560px]:px-3.5 max-[560px]:py-3">
                            <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[#776d62]">{label}</span>
                            <span className="text-[0.93rem] text-[#2f2a25]">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 max-[560px]:mt-[18px]">
                        <Link className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-3.5 text-sm font-bold text-[#17392f] transition hover:-translate-y-px hover:border-[rgba(23,57,47,0.16)] hover:bg-[rgba(23,57,47,0.06)]" to={`/admin/orders/${order.id}`}>
                          View Order <ArrowRightIcon />
                        </Link>
                      </div>
                    </article>
                  ))}
                  <footer className="mt-1 flex flex-wrap items-center justify-between gap-4 border-t border-[rgba(57,47,39,0.12)] px-1 py-4">
                    <div className="text-[0.9rem] text-[#776d62]">Showing <span className="font-bold text-[#2f2a25]">{start}-{end}</span> of <span className="font-bold text-[#2f2a25]">{data.pagination.total}</span></div>
                    <AdminPagination {...data.pagination} onPageChange={setPage} />
                  </footer>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
