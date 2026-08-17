import type { LoveNoteCard, LoveNoteCollection } from '../types/loveNote'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

const apiFetch = (input: RequestInfo | URL, init: RequestInit = {}) => fetch(input, { ...init, credentials: 'include' })



export type AuthUser = {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: string
  status: string
  profileImageUrl?: string | null
  hasPassword?: boolean
}

export type RegisterInput = { fullName: string; email: string; phone?: string; password: string }

function normalizeAuthUser(user: AuthUser): AuthUser {
  if (user.profileImageUrl && !/^https?:/i.test(user.profileImageUrl)) {
    const serverBase = API_BASE.replace(/\/$/, '').replace(/\/api$/, '')
    user = {...user, profileImageUrl: `${serverBase}/uploads/${user.profileImageUrl.replace(/^\/+/, '')}`}
  }
  return user
}

async function authJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(`${API_BASE}${path}`, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Authentication request failed')
  return body as T
}

export async function authLogin(email: string, password: string): Promise<AuthUser> {
  const result = await authJson<{ user: AuthUser }>('/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
  return normalizeAuthUser(result.user)
}

export async function authRegister(input: RegisterInput): Promise<AuthUser> {
  const result = await authJson<{ user: AuthUser }>('/auth/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(input) })
  return normalizeAuthUser(result.user)
}

export async function authGoogle(credential: string): Promise<AuthUser> {
  const result = await authJson<{ user: AuthUser }>('/auth/google', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ credential }),
  })
  return normalizeAuthUser(result.user)
}

export async function authMe(): Promise<AuthUser> {
  const result = await authJson<{ user: AuthUser }>('/auth/me')
  return normalizeAuthUser(result.user)
}

export async function authLogout(): Promise<void> {
  const response = await apiFetch(`${API_BASE}/auth/logout`, { method: 'POST' })
  if (!response.ok && response.status !== 401) throw new Error('Could not sign out')
}


export function cardPdfUrl(cardId: string, download = false): string {
  return `${API_BASE}/cards/${encodeURIComponent(cardId)}/pdf${download ? '?download=1' : ''}`
}

export type ProfileData = {
  user: AuthUser
  subscription: { planName: string; status: string; monthlyPrice: number; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null
}
export async function getProfile(): Promise<ProfileData> { const d=await authJson<ProfileData>('/profile'); return {...d,user:normalizeAuthUser(d.user)} }
export async function updateProfile(input: {fullName:string; phone:string}): Promise<AuthUser> {
  const result = await authJson<{user:AuthUser}>('/profile', {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  return normalizeAuthUser(result.user)
}
export async function updatePassword(input: {currentPassword?:string; newPassword:string}): Promise<void> {
  await authJson('/profile/password', {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
}
export async function uploadProfilePhoto(file: File): Promise<AuthUser> {
  const fd = new FormData(); fd.append('photo', file)
  const result = await authJson<{user:AuthUser}>('/profile/photo', {method:'POST',body:fd})
  return normalizeAuthUser(result.user)
}
export async function removeProfilePhoto(): Promise<AuthUser> {
  const result = await authJson<{user:AuthUser}>('/profile/photo', {method:'DELETE'})
  return normalizeAuthUser(result.user)
}


export type TaxonomyItem = {
  id: string
  name: string
  slug: string
  description?: string | null
  isActive: boolean
  sortOrder: number
  cardCount?: number
}

export type CardCategory = TaxonomyItem
export type AdminCollection = TaxonomyItem

export async function getCategories(): Promise<CardCategory[]> {
  const response = await apiFetch(`${API_BASE}/categories`)
  if (!response.ok) throw new Error('Unable to load categories')
  return response.json()
}

async function adminTaxonomyJson(path: string, init: RequestInit = {}) {
  const response = await apiFetch(`${API_BASE}${path}`, init)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to save item')
  return body
}

export async function adminGetCollections(): Promise<AdminCollection[]> {
  return adminTaxonomyJson('/admin/collections')
}
export async function adminCreateCollection(input: Omit<AdminCollection, 'id' | 'cardCount'>): Promise<AdminCollection> {
  return adminTaxonomyJson('/admin/collections', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(input) })
}
export async function adminUpdateCollection(id:string, input: Omit<AdminCollection, 'id' | 'cardCount'>): Promise<AdminCollection> {
  return adminTaxonomyJson(`/admin/collections/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(input) })
}
export async function adminDeleteCollection(id:string): Promise<void> {
  const response=await apiFetch(`${API_BASE}/admin/collections/${id}`,{method:'DELETE'})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to delete collection')
}

export async function adminGetCategories(): Promise<CardCategory[]> {
  return adminTaxonomyJson('/admin/categories')
}
export async function adminCreateCategory(input: Omit<CardCategory, 'id' | 'cardCount'>): Promise<CardCategory> {
  return adminTaxonomyJson('/admin/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(input) })
}
export async function adminUpdateCategory(id:string, input: Omit<CardCategory, 'id' | 'cardCount'>): Promise<CardCategory> {
  return adminTaxonomyJson(`/admin/categories/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(input) })
}
export async function adminDeleteCategory(id:string): Promise<void> {
  const response=await apiFetch(`${API_BASE}/admin/categories/${id}`,{method:'DELETE'})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to delete category')
}

export async function getCollections(): Promise<LoveNoteCollection[]> {
  const response = await apiFetch(`${API_BASE}/collections`)
  if (!response.ok) throw new Error('Unable to load collections')
  return response.json()
}

export async function getCollectionCards(collectionId: string): Promise<LoveNoteCard[]> {
  const response = await apiFetch(`${API_BASE}/collections/${collectionId}/cards`)
  if (!response.ok) throw new Error('Unable to load cards')
  return response.json()
}

export async function getCard(cardId: string): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/cards/${cardId}`)
  if (!response.ok) throw new Error('Unable to load card')
  return response.json()
}

export async function searchCards(query: string, signal?: AbortSignal): Promise<LoveNoteCard[]> {
  const q = query.trim()
  if (!q) return []
  const params = new URLSearchParams({ q })
  const response = await apiFetch(`${API_BASE}/cards/search?${params.toString()}`, { signal })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to search cards')
  return Array.isArray(body) ? body : []
}

export async function adminCreateCard(formData: FormData): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/admin/cards`, { method: 'POST', body: formData })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to upload card')
  return body
}

export type AdminPagination = { page:number; pageSize:number; total:number; totalPages:number }

export type AdminCardsResponse = {
  summary:{total:number;drafts:number;published:number;featured:number}
  cards:LoveNoteCard[]
  pagination:AdminPagination
}

export async function adminGetCards(params:{search?:string;status?:string;collectionId?:string;featured?:boolean;page?:number;pageSize?:number}={}): Promise<AdminCardsResponse> {
  const qs=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v!==undefined&&v!==''&&v!==null)qs.set(k,String(v))})
  const response = await apiFetch(`${API_BASE}/admin/cards${qs.size?`?${qs}`:''}`)
  if (!response.ok) throw new Error('Unable to load admin cards')
  const body = await response.json()
  if (Array.isArray(body)) {
    const cards = body as LoveNoteCard[]
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    return {
      summary:{
        total:cards.length,
        drafts:cards.filter(card=>!card.published).length,
        published:cards.filter(card=>card.published).length,
        featured:cards.filter(card=>card.isFeatured).length,
      },
      cards,
      pagination:{page,pageSize,total:cards.length,totalPages:Math.max(1,Math.ceil(cards.length/pageSize))},
    }
  }
  return body as AdminCardsResponse
}

export async function adminGetCard(cardId: string): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/admin/cards/${cardId}`)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to load card')
  return body
}

export async function adminUpdateDesignedCard(cardId: string, formData: FormData): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/admin/cards/${cardId}/design`, { method: 'PUT', body: formData })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update card')
  return body
}

export async function adminSetPublished(cardId: string, published: boolean): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/admin/cards/${cardId}/publish`, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({published})})
  if (!response.ok) throw new Error('Unable to update card status')
  return response.json()
}

export async function adminDeleteCard(cardId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/admin/cards/${cardId}`, {method:'DELETE'})
  if (!response.ok) throw new Error('Unable to delete card')
}

export type AdminUser = {
  id: string
  fullName: string
  email: string
  phone?: string | null
  role: string
  status: string
  joinedAt: string
  subscriptionStatus: string
  paymentStatus: string
}

export type AdminUsersResponse = {
  summary: {
    totalUsers: number
    activeSubscribers: number
    freeUsers: number
    blockedUsers: number
  }
  users: AdminUser[]
  pagination: AdminPagination
}

export async function adminGetUsers(params: {search?: string; role?: string; status?: string; subscription?: string; page?:number; pageSize?:number} = {}): Promise<AdminUsersResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, String(value)) })
  const response = await apiFetch(`${API_BASE}/admin/users${qs.size ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error('Unable to load users')
  return response.json()
}

export async function adminSetUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED'): Promise<AdminUser> {
  const response = await apiFetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({status}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update user')
  return body
}

export type AdminSubscriber = {
  id: string
  userId: string
  fullName: string
  email: string
  planName: string
  status: string
  paymentStatus: string
  monthlyPrice: number
  startedAt?: string | null
  currentPeriodEnd?: string | null
  createdAt: string
  stripeDashboardUrl?: string | null
}

export type AdminTransaction = {
  id: string
  providerTransactionId: string
  fullName: string
  date: string
  amount: number
  status: string
  description: string
  stripeDashboardUrl?: string | null
}

export type AdminFailedPayment = {
  id: string
  fullName: string
  email: string
  date: string
  amount: number
  status: string
}

export type AdminSubscriptionsResponse = {
  summary: {
    totalSubscribers: number
    monthlyRevenue: number
    activeSubscriptions: number
    monthlyPrice: number
  }
  subscribers: AdminSubscriber[]
  transactions: AdminTransaction[]
  failedPayments: AdminFailedPayment[]
  pagination: AdminPagination
  transactionPagination: AdminPagination
}

export async function adminGetSubscriptions(params: {search?: string; status?: string; page?:number; pageSize?:number; transactionPage?:number; transactionPageSize?:number} = {}): Promise<AdminSubscriptionsResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, String(value)) })
  const response = await apiFetch(`${API_BASE}/admin/subscriptions${qs.size ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error('Unable to load subscriptions')
  return response.json()
}

export type AdminOverview = {
  totalUsers: number
  activeSubscribers: number
  revenueThisMonth: number
  pendingRequests: number
  ordersInProgress: number
  recentRequests?: Array<{id:string; requesterName:string; category:string; status:string; createdAt:string}>
  recentOrders?: Array<{id:string; orderNumber:string; customerName:string; quantity:number; status:string; shippingFee?:number|null; totalAmount?:number|null; placedAt:string}>
}

export async function adminGetOverview(): Promise<AdminOverview> {
  const response = await apiFetch(`${API_BASE}/admin/overview`)
  if (!response.ok) throw new Error('Unable to load admin overview')
  return response.json()
}

export type AdminUserDetail = AdminUser & {
  updatedAt: string
  subscription: null | {
    id: string
    planName: string
    status: string
    paymentStatus: string
    monthlyPrice: number
    startedAt?: string | null
    currentPeriodEnd?: string | null
    cancelledAt?: string | null
    cancelAtPeriodEnd: boolean
    hasAccess: boolean
  }
  payments: Array<{
    id: string
    providerTransactionId: string
    description: string
    amount: number
    currency: string
    status: string
    occurredAt: string
  }>
}

export async function adminGetUser(userId: string): Promise<AdminUserDetail> {
  const response = await apiFetch(`${API_BASE}/admin/users/${userId}`)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to load user')
  return body
}

export type AdminChallengeReminder = {
  id?: string
  dayOfMonth: number
  timeOfDay: string
  channel: 'EMAIL' | 'SMS'
  isActive: boolean
  emailSubject?: string | null
  emailMessage?: string | null
  smsMessage?: string | null
}

export type AdminChallenge = {
  id: string
  title: string
  challengeMonth: string
  overview: string
  goal: string
  howToComplete: string
  relationshipBenefit: string
  imageUrl?: string | null
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt?: string | null
  reminders: AdminChallengeReminder[]
  createdAt: string
  updatedAt: string
}

export type AdminChallengesResponse = {
  summary: { total: number; drafts: number; published: number }
  challenges: AdminChallenge[]
  pagination: AdminPagination
}

export async function adminGetChallenges(params: {search?: string; status?: string; month?: string; year?: string; page?:number; pageSize?:number} = {}): Promise<AdminChallengesResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, String(value)) })
  const response = await apiFetch(`${API_BASE}/admin/challenges${qs.size ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error('Unable to load challenges')
  return response.json()
}

export async function adminCreateChallenge(formData: FormData): Promise<AdminChallenge> {
  const response = await apiFetch(`${API_BASE}/admin/challenges`, { method: 'POST', body: formData })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to create challenge')
  return body
}

export async function adminSetChallengeStatus(challengeId: string, status: 'DRAFT' | 'PUBLISHED'): Promise<AdminChallenge> {
  const response = await apiFetch(`${API_BASE}/admin/challenges/${challengeId}/status`, {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update challenge')
  return body
}

export async function adminDeleteChallenge(challengeId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/admin/challenges/${challengeId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Unable to delete challenge')
}

export type AdminPoetryRequest = {
  id: string
  userId?: string | null
  requesterName: string
  requesterEmail: string
  category: string
  collectionId?: string | null
  occasion?: string | null
  recipientName?: string | null
  relationship?: string | null
  tone?: string | null
  prompt: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  adminNotes?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type AdminRequestsResponse = {
  summary: { total: number; pending: number; inProgress: number; completed: number; cancelled: number }
  categories: string[]
  collections: { id: string; name: string; slug: string }[]
  requests: AdminPoetryRequest[]
  pagination: AdminPagination
}

export async function adminGetRequests(params: {search?: string; status?: string; category?: string; collection?: string; page?:number; pageSize?:number} = {}): Promise<AdminRequestsResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, String(value)) })
  const response = await apiFetch(`${API_BASE}/admin/requests${qs.size ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error('Unable to load requests')
  const body = await response.json()
  return {
    summary: body?.summary ?? { total: 0, pending: 0, inProgress: 0, completed: 0, cancelled: 0 },
    categories: Array.isArray(body?.categories) ? body.categories : [],
    collections: Array.isArray(body?.collections) ? body.collections : [],
    requests: Array.isArray(body?.requests) ? body.requests : [],
    pagination: body?.pagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  }
}

export async function adminSetRequestStatus(requestId: string, status: AdminPoetryRequest['status']): Promise<AdminPoetryRequest> {
  const response = await apiFetch(`${API_BASE}/admin/requests/${requestId}/status`, {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update request')
  return body
}

export type AdminCardOrder = {
  id: string
  orderNumber: string
  userId?: string | null
  customerName: string
  customerEmail: string
  cardId?: string | null
  cardTitle: string
  cardCategory?: string | null
  quantity: number
  cardPrice?: number
  printingFee?: number
  subtotal?: number | null
  shippingFee?: number | null
  totalAmount?: number | null
  status: 'PLACED' | 'QUOTED' | 'IN_PROGRESS' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  reviewed: boolean
  shippingName?: string | null
  personalizationRecipient?: string | null
  personalizationSender?: string | null
  shippingAddress?: string | null
  shippingNote?: string | null
  trackingNumber?: string | null
  placedAt: string
  shippedAt?: string | null
  deliveredAt?: string | null
  estimatedDeliveryDate?: string | null
  feedbackRating?: number | null
  feedbackText?: string | null
  paymentStatus?: string
  paymentReceipt?: string | null
  paymentDate?: string | null
  paymentMethod?: string | null
  refundStatus?: string | null
  stripePaymentId?: string | null
  createdAt: string
  updatedAt: string
}

export type AdminOrdersResponse = {
  summary: { total: number; placed: number; quoted: number; inProgress: number; shipped: number; delivered: number; cancelled: number }
  orders: AdminCardOrder[]
  pagination: AdminPagination
}

export async function adminGetOrders(params: {search?: string; status?: string; reviewedOnly?: boolean; page?:number; pageSize?:number} = {}): Promise<AdminOrdersResponse> {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.status) qs.set('status', params.status)
  if (params.reviewedOnly) qs.set('reviewedOnly', 'true')
  if (params.page) qs.set('page', String(params.page))
  if (params.pageSize) qs.set('pageSize', String(params.pageSize))
  const response = await apiFetch(`${API_BASE}/admin/orders${qs.size ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error('Unable to load orders')
  return response.json()
}

export async function adminGetOrder(orderId: string): Promise<AdminCardOrder> {
  const response = await apiFetch(`${API_BASE}/admin/orders/${orderId}`)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to load order')
  return body
}

export async function adminSetOrderStatus(orderId: string, status: AdminCardOrder['status']): Promise<AdminCardOrder> {
  const response = await apiFetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update order')
  return body
}

export async function adminSetOrderQuote(orderId:string,shippingFee:number):Promise<AdminCardOrder>{
  const response=await apiFetch(`${API_BASE}/admin/orders/${orderId}/quote`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({shippingFee})})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to update shipping quote')
  return body
}

export async function adminSetOrderReviewed(orderId: string, reviewed: boolean): Promise<AdminCardOrder> {
  const response = await apiFetch(`${API_BASE}/admin/orders/${orderId}/reviewed`, {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({reviewed}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update order')
  return body
}

export async function adminSetOrderDeliveryDate(orderId: string, estimatedDeliveryDate: string | null): Promise<AdminCardOrder> {
  const response = await apiFetch(`${API_BASE}/admin/orders/${orderId}/delivery-date`, {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({estimatedDeliveryDate}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update estimated delivery date')
  return body
}

export async function adminCreateDesignedCard(formData: FormData): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/admin/cards/design`, { method: 'POST', body: formData })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to save designed card')
  return body
}

export type AdminNotificationJob = {
  id: string
  channel: 'EMAIL' | 'SMS'
  audience: 'SINGLE_USER' | 'SUBSCRIBERS_ONLY' | 'ALL_USERS'
  selectedUserId?: string | null
  recipientEmail?: string | null
  subject?: string | null
  message: string
  status: string
  totalRecipients: number
  sentCount: number
  failedCount: number
  createdAt: string
  sentAt?: string | null
  selectedUser?: {id:string;fullName:string;email:string;phone?:string|null} | null
}

export async function adminGetNotifications(params:{search?:string;status?:string;audience?:string;page?:number;pageSize?:number}={}):Promise<{jobs:AdminNotificationJob[];pagination:AdminPagination}> {
  const qs=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v)qs.set(k,String(v))})
  const response=await apiFetch(`${API_BASE}/admin/notifications${qs.size?`?${qs}`:''}`)
  if(!response.ok) throw new Error('Unable to load notification jobs')
  return response.json()
}

export async function adminCreateNotification(input:{channel:'EMAIL'|'SMS';audience:'SINGLE_USER'|'SUBSCRIBERS_ONLY'|'ALL_USERS';selectedUserId?:string|null;recipientEmail?:string|null;recipientPhone?:string|null;subject?:string|null;message:string}):Promise<AdminNotificationJob>{
  const response=await apiFetch(`${API_BASE}/admin/notifications`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to create notification job')
  return body
}

export type AdminCommunityResponse={id:string;authorName:string;body:string;status:string;isReported:boolean;reportCount:number;createdAt:string}
export type AdminCommunityPost={id:string;authorName:string;category:string;title:string;body:string;status:string;isReported:boolean;reportCount:number;responses:AdminCommunityResponse[];createdAt:string}
export type AdminCommunityPayload={summary:{totalPosts:number;reportedPosts:number;reportedResponses:number};posts:AdminCommunityPost[];pagination:AdminPagination}

export async function adminGetCommunity(params:{search?:string;status?:string;reportedOnly?:boolean;page?:number;pageSize?:number}={}):Promise<AdminCommunityPayload>{
  const qs=new URLSearchParams(); if(params.search)qs.set('search',params.search);if(params.status)qs.set('status',params.status);if(params.reportedOnly)qs.set('reportedOnly','true');if(params.page)qs.set('page',String(params.page));if(params.pageSize)qs.set('pageSize',String(params.pageSize))
  const response=await apiFetch(`${API_BASE}/admin/community${qs.size?`?${qs}`:''}`)
  if(!response.ok) throw new Error('Unable to load community')
  return response.json()
}

export async function adminModeratePost(postId:string,input:{status?:'PUBLISHED'|'HIDDEN'|'REMOVED';clearReport?:boolean}){
  const response=await apiFetch(`${API_BASE}/admin/community/posts/${postId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to moderate post')
  return body
}

export async function adminModerateResponse(responseId:string,input:{status?:'PUBLISHED'|'HIDDEN'|'REMOVED';clearReport?:boolean}){
  const response=await apiFetch(`${API_BASE}/admin/community/responses/${responseId}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to moderate response')
  return body
}

export type AdminSettings={id:string;defaultPrintingFee:number;orderFeedbackEmail:boolean;automaticSmsEnabled:boolean;smsPoetryRequestReceived:boolean;smsPoetryRequestCompleted:boolean;smsCardOrderUpdates:boolean;smsChallengeReminders:boolean;smsSubscriptionNotifications:boolean;createdAt:string;updatedAt:string}
export type AdminSettingsInput=Pick<AdminSettings,'defaultPrintingFee'|'orderFeedbackEmail'|'automaticSmsEnabled'|'smsPoetryRequestReceived'|'smsPoetryRequestCompleted'|'smsCardOrderUpdates'|'smsChallengeReminders'|'smsSubscriptionNotifications'>
export async function adminGetSettings():Promise<AdminSettings>{const r=await apiFetch(`${API_BASE}/admin/settings`);if(!r.ok)throw new Error('Unable to load settings');return r.json()}
export async function adminSaveSettings(input:AdminSettingsInput):Promise<AdminSettings>{
 const r=await apiFetch(`${API_BASE}/admin/settings`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.message??'Unable to save settings');return b
}

export type UserOrder = {
  id:string; orderNumber:string; cardId?:string|null; cardTitle:string; cardCategory?:string|null; quantity:number; cardPrice?:number; printingFee?:number; subtotal?:number|null; shippingFee:number|null; totalAmount:number|null; status:string;
  shippingName?:string|null; personalizationRecipient?:string|null; personalizationSender?:string|null; shippingAddress?:string|null; shippingNote?:string|null; trackingNumber?:string|null; placedAt:string; shippedAt?:string|null; deliveredAt?:string|null;
  previewUrl?:string|null;
}
export type UserOrdersResponse = { summary:{activeOrders:number; totalCardsOrdered:number; deliveredTotal:number}; orders:UserOrder[] }
export async function getMyOrders(params:{search?:string;status?:string}={}):Promise<UserOrdersResponse>{
 const qs=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v)qs.set(k,String(v))})
 return authJson<UserOrdersResponse>(`/orders${qs.size?`?${qs}`:''}`)
}
export async function getMyOrder(orderId:string):Promise<UserOrder>{ return authJson<UserOrder>(`/orders/${orderId}`) }
export async function cancelMyOrder(orderId:string):Promise<UserOrder>{ return authJson<UserOrder>(`/orders/${orderId}/cancel`,{method:'PATCH'}) }


export async function createSubscriptionCheckout(returnPath = '/love-notes'): Promise<{ sessionId?: string; url: string }> {
  const response = await apiFetch(`${API_BASE}/billing/subscription-checkout`, { method: 'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({returnPath}) })
  const body = await response.json().catch(() => ({})) as { sessionId?: string; url?: string; message?: string }
  if (!response.ok || !body.url) throw new Error(body.message ?? 'Unable to start subscription checkout')
  return { sessionId: body.sessionId, url: body.url }
}

export async function confirmSubscriptionCheckout(sessionId: string): Promise<{active:boolean; subscription?:{status:string;currentPeriodEnd?:string|null;monthlyPrice:number}}> {
  return authJson(`/billing/confirm-subscription?session_id=${encodeURIComponent(sessionId)}`)
}

export async function openBillingPortal(): Promise<{url:string}> {
  return authJson('/billing/portal',{method:'POST'})
}

export type SavedLibraryCard = { id:string; savedAt:string; usedAt?:string|null; card:LoveNoteCard }
export async function getLibrary():Promise<SavedLibraryCard[]>{ return authJson('/library') }
export async function saveCardToLibrary(cardId:string):Promise<void>{ await authJson(`/library/${encodeURIComponent(cardId)}`,{method:'POST'}) }
export async function removeCardFromLibrary(cardId:string):Promise<void>{ const r=await apiFetch(`${API_BASE}/library/${encodeURIComponent(cardId)}`,{method:'DELETE'}); if(!r.ok) throw new Error('Unable to remove saved card') }
export async function setLibraryCardUsed(cardId:string,used:boolean):Promise<void>{ await authJson(`/library/${encodeURIComponent(cardId)}/used`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({used})}) }

export type PoetryRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type UserPoetryRequest = {
  id:string; userId?:string|null; requesterName:string; requesterEmail:string; category:string; collectionId?:string|null; occasion?:string|null; recipientName?:string|null; relationship?:string|null; tone?:string|null; prompt:string; status:PoetryRequestStatus; adminNotes?:string|null; completedAt?:string|null; createdAt:string; updatedAt:string
}
export type CreatePoetryRequestInput = { occasion:string; recipientName:string; relationship:string; description:string; tone:string }
export async function getMyPoetryRequests():Promise<UserPoetryRequest[]>{ return authJson('/poetry-requests') }
export async function createPoetryRequest(input:CreatePoetryRequestInput):Promise<UserPoetryRequest>{ return authJson('/poetry-requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}) }

export type PhysicalOrderPricing={cardPrice:number;printingFee:number}
export type PhysicalOrderInput={cardId:string;quantity:number;personalizationRecipient:string;personalizationSender:string;recipientName:string;address1:string;address2?:string;city:string;state:string;postalCode:string;country:string;shippingNote?:string}
export async function getPhysicalOrderPricing():Promise<PhysicalOrderPricing>{ return authJson('/orders/pricing') }
export async function createPhysicalOrder(input:PhysicalOrderInput):Promise<UserOrder>{ return authJson('/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}) }

export async function downloadPersonalizedCard(cardId:string,recipient:string,sender:string):Promise<void>{
 const qs=new URLSearchParams({recipient,sender}); const r=await apiFetch(`${API_BASE}/cards/${encodeURIComponent(cardId)}/personalized-pdf?${qs}`); if(!r.ok){const b=await r.json().catch(()=>({}));throw new Error(b.message??'Unable to generate personalized PDF')} const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='laurentine-personalized-card.pdf'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}

export async function adminDownloadPersonalizedOrderPdf(orderId:string):Promise<void>{
 const r=await apiFetch(`${API_BASE}/admin/orders/${encodeURIComponent(orderId)}/personalized-pdf`); if(!r.ok){const b=await r.json().catch(()=>({}));throw new Error(b.message??'Unable to generate print PDF')} const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='laurentine-order-print.pdf'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}

export type BulkImportItem = {
  id: string
  originalFilename: string
  title: string
  cardId?: string | null
  pageCount?: number | null
  status: string
  errorMessage?: string | null
}
export type BulkImportJob = {
  id: string
  collectionId: string
  originalZipName: string
  totalFiles: number
  processedFiles: number
  successCount: number
  failedCount: number
  status: string
  errorMessage?: string | null
  items: BulkImportItem[]
  pagination: AdminPagination
}
export async function adminStartBulkPdfImport(formData: FormData): Promise<{id:string,status:string}> {
  const response = await apiFetch(`${API_BASE}/admin/cards/bulk-import`, { method:'POST', body:formData })
  const body = await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message ?? 'Unable to start bulk import')
  return body
}
export async function adminGetBulkPdfImport(jobId:string,page=1,pageSize=10): Promise<BulkImportJob> {
  const response = await apiFetch(`${API_BASE}/admin/cards/bulk-import/${jobId}?page=${page}&pageSize=${pageSize}`)
  const body = await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message ?? 'Unable to load import progress')
  return body
}

export type CommunityPost = {
  id: string
  authorName: string
  anonymous: boolean
  title: string
  body: string
  category: string
  collectionId?: string | null
  collection?: { id:string; name:string; slug?:string; description?:string | null } | null
  card?: LoveNoteCard | null
  createdAt: string
}

export async function getCommunityPosts(params:{search?:string; collectionId?:string}={}):Promise<CommunityPost[]> {
  const qs=new URLSearchParams()
  if(params.search) qs.set('search',params.search)
  if(params.collectionId) qs.set('collectionId',params.collectionId)
  const response=await apiFetch(`${API_BASE}/community${qs.size?`?${qs}`:''}`)
  if(!response.ok) throw new Error('Unable to load community stories')
  return response.json()
}

export async function createCommunityPost(input:{cardId:string;title:string;body:string;anonymous:boolean}):Promise<CommunityPost>{
  return authJson<CommunityPost>('/community',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
}


export type UserChallengePreferences = {
  challengeEmailEnabled: boolean
  challengeSmsEnabled: boolean
}

export type UserMonthlyChallenge = {
  id: string
  title: string
  challengeMonth: string
  overview: string
  goal: string
  howToComplete: string
  relationshipBenefit: string
  imageUrl?: string | null
  status: string
  publishedAt?: string | null
}

export type CurrentChallengeResponse = {
  challenge: UserMonthlyChallenge | null
  preferences: UserChallengePreferences
}

export async function getCurrentChallenge(): Promise<CurrentChallengeResponse> {
  return authJson<CurrentChallengeResponse>('/challenges/current')
}

export async function updateChallengePreferences(input: UserChallengePreferences): Promise<UserChallengePreferences> {
  const result = await authJson<{preferences: UserChallengePreferences}>('/challenges/preferences', {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(input),
  })
  return result.preferences
}
