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

export async function adminCreateCard(formData: FormData): Promise<LoveNoteCard> {
  const response = await apiFetch(`${API_BASE}/admin/cards`, { method: 'POST', body: formData })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to upload card')
  return body
}

export async function adminGetCards(): Promise<LoveNoteCard[]> {
  const response = await apiFetch(`${API_BASE}/admin/cards`)
  if (!response.ok) throw new Error('Unable to load admin cards')
  return response.json()
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
}

export async function adminGetUsers(params: {search?: string; role?: string; status?: string; subscription?: string} = {}): Promise<AdminUsersResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, value) })
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
}

export type AdminTransaction = {
  id: string
  providerTransactionId: string
  fullName: string
  date: string
  amount: number
  status: string
  description: string
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
}

export async function adminGetSubscriptions(params: {search?: string; status?: string} = {}): Promise<AdminSubscriptionsResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, value) })
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
}

export async function adminGetChallenges(params: {search?: string; status?: string; month?: string; year?: string} = {}): Promise<AdminChallengesResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, value) })
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
  occasion?: string | null
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
  requests: AdminPoetryRequest[]
}

export async function adminGetRequests(params: {search?: string; status?: string; category?: string} = {}): Promise<AdminRequestsResponse> {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value) qs.set(key, value) })
  const response = await apiFetch(`${API_BASE}/admin/requests${qs.size ? `?${qs}` : ''}`)
  if (!response.ok) throw new Error('Unable to load requests')
  return response.json()
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
  cardTitle: string
  cardCategory?: string | null
  quantity: number
  shippingFee?: number | null
  totalAmount?: number | null
  status: 'PLACED' | 'QUOTED' | 'IN_PROGRESS' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  reviewed: boolean
  shippingName?: string | null
  shippingAddress?: string | null
  trackingNumber?: string | null
  placedAt: string
  shippedAt?: string | null
  deliveredAt?: string | null
  createdAt: string
  updatedAt: string
}

export type AdminOrdersResponse = {
  summary: { total: number; placed: number; quoted: number; inProgress: number; shipped: number; delivered: number; cancelled: number }
  orders: AdminCardOrder[]
}

export async function adminGetOrders(params: {search?: string; status?: string; reviewedOnly?: boolean} = {}): Promise<AdminOrdersResponse> {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.status) qs.set('status', params.status)
  if (params.reviewedOnly) qs.set('reviewedOnly', 'true')
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

export async function adminSetOrderReviewed(orderId: string, reviewed: boolean): Promise<AdminCardOrder> {
  const response = await apiFetch(`${API_BASE}/admin/orders/${orderId}/reviewed`, {
    method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({reviewed}),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message ?? 'Unable to update order')
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

export async function adminGetNotifications(params:{search?:string;status?:string;audience?:string}={}):Promise<{jobs:AdminNotificationJob[]}> {
  const qs=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v)qs.set(k,v)})
  const response=await apiFetch(`${API_BASE}/admin/notifications${qs.size?`?${qs}`:''}`)
  if(!response.ok) throw new Error('Unable to load notification jobs')
  return response.json()
}

export async function adminCreateNotification(input:{channel:'EMAIL'|'SMS';audience:'SINGLE_USER'|'SUBSCRIBERS_ONLY'|'ALL_USERS';selectedUserId?:string|null;recipientEmail?:string|null;subject?:string|null;message:string}):Promise<AdminNotificationJob>{
  const response=await apiFetch(`${API_BASE}/admin/notifications`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})
  const body=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message??'Unable to create notification job')
  return body
}

export type AdminCommunityResponse={id:string;authorName:string;body:string;status:string;isReported:boolean;reportCount:number;createdAt:string}
export type AdminCommunityPost={id:string;authorName:string;category:string;title:string;body:string;status:string;isReported:boolean;reportCount:number;responses:AdminCommunityResponse[];createdAt:string}
export type AdminCommunityPayload={summary:{totalPosts:number;reportedPosts:number;reportedResponses:number};posts:AdminCommunityPost[]}

export async function adminGetCommunity(params:{search?:string;status?:string;reportedOnly?:boolean}={}):Promise<AdminCommunityPayload>{
  const qs=new URLSearchParams(); if(params.search)qs.set('search',params.search);if(params.status)qs.set('status',params.status);if(params.reportedOnly)qs.set('reportedOnly','true')
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

export type AdminSettings={id:string;defaultPrintingFee:number;orderFeedbackEmail:boolean;createdAt:string;updatedAt:string}
export async function adminGetSettings():Promise<AdminSettings>{const r=await apiFetch(`${API_BASE}/admin/settings`);if(!r.ok)throw new Error('Unable to load settings');return r.json()}
export async function adminSaveSettings(input:{defaultPrintingFee:number;orderFeedbackEmail:boolean}):Promise<AdminSettings>{
 const r=await apiFetch(`${API_BASE}/admin/settings`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.message??'Unable to save settings');return b
}

export type UserOrder = {
  id:string; orderNumber:string; cardTitle:string; cardCategory?:string|null; quantity:number; shippingFee:number|null; totalAmount:number|null; status:string;
  shippingName?:string|null; shippingAddress?:string|null; trackingNumber?:string|null; placedAt:string; shippedAt?:string|null; deliveredAt?:string|null;
  previewUrl?:string|null;
}
export type UserOrdersResponse = { summary:{activeOrders:number; totalCardsOrdered:number; deliveredTotal:number}; orders:UserOrder[] }
export async function getMyOrders(params:{search?:string;status?:string}={}):Promise<UserOrdersResponse>{
 const qs=new URLSearchParams(); Object.entries(params).forEach(([k,v])=>{if(v)qs.set(k,v)})
 return authJson<UserOrdersResponse>(`/orders${qs.size?`?${qs}`:''}`)
}
export async function getMyOrder(orderId:string):Promise<UserOrder>{ return authJson<UserOrder>(`/orders/${orderId}`) }
export async function cancelMyOrder(orderId:string):Promise<UserOrder>{ return authJson<UserOrder>(`/orders/${orderId}/cancel`,{method:'PATCH'}) }


export async function createSubscriptionCheckout(): Promise<{ sessionId?: string; url: string }> {
  const response = await apiFetch(`${API_BASE}/billing/subscription-checkout`, { method: 'POST' })
  const body = await response.json().catch(() => ({})) as { sessionId?: string; url?: string; message?: string }
  if (!response.ok || !body.url) throw new Error(body.message ?? 'Unable to start subscription checkout')
  return { sessionId: body.sessionId, url: body.url }
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
}
export async function adminStartBulkPdfImport(formData: FormData): Promise<{id:string,status:string}> {
  const response = await apiFetch(`${API_BASE}/admin/cards/bulk-import`, { method:'POST', body:formData })
  const body = await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message ?? 'Unable to start bulk import')
  return body
}
export async function adminGetBulkPdfImport(jobId:string): Promise<BulkImportJob> {
  const response = await apiFetch(`${API_BASE}/admin/cards/bulk-import/${jobId}`)
  const body = await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body.message ?? 'Unable to load import progress')
  return body
}
