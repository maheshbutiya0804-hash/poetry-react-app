import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHero, AdminPagination, Panel, StatCard } from '../components/AdminLayout'
import { adminGetUsers, adminSetUserStatus, type AdminUser, type AdminUsersResponse } from '../../services/api'

const initial: AdminUsersResponse = { summary:{totalUsers:0,activeSubscribers:0,freeUsers:0,blockedUsers:0}, users:[], pagination:{page:1,pageSize:20,total:0,totalPages:1} }
function initials(name:string){return name.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase()}
function formatDate(value:string){return new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric'}).format(new Date(value))}
function pillClass(value:string){return ['ACTIVE','ADMIN'].includes(value)?'green':value==='BLOCKED'?'danger':''}

export function UsersPage(){
  const [data,setData]=useState(initial),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const [search,setSearch]=useState(''),[role,setRole]=useState(''),[status,setStatus]=useState(''),[subscription,setSubscription]=useState(''),[page,setPage]=useState(1)
  async function load(){setLoading(true);setError('');try{setData(await adminGetUsers({search,role,status,subscription,page,pageSize:20}))}catch(e){setError(e instanceof Error?e.message:'Unable to load users')}finally{setLoading(false)}}
  useEffect(()=>{const t=setTimeout(load,180);return()=>clearTimeout(t)},[search,role,status,subscription,page])
  useEffect(()=>setPage(1),[search,role,status,subscription])
  async function toggle(user:AdminUser){try{await adminSetUserStatus(user.id,user.status==='BLOCKED'?'ACTIVE':'BLOCKED');await load()}catch(e){setError(e instanceof Error?e.message:'Unable to update user')}}
  return <><AdminHero title="Users" copy="View user accounts, roles, subscription access, and account status."/><Panel>
    <span className="hs-eyebrow">ACCOUNTS</span><h2>Users Management</h2><p>Server-backed account rows for reviewing roles, status, subscription access, and admin actions.</p>
    <div className="hs-stats four inner"><StatCard label="TOTAL USERS" value={data.summary.totalUsers} note="All registered accounts."/><StatCard label="ACTIVE SUBSCRIBERS" value={data.summary.activeSubscribers} note="Users with active subscription access."/><StatCard label="FREE USERS" value={data.summary.freeUsers} note="Users without active paid access."/><StatCard label="BLOCKED USERS" value={data.summary.blockedUsers} note="Accounts currently blocked." accent/></div>
    <div className="hs-filter hs-user-filter"><label className="hs-search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users..."/></label><select value={role} onChange={e=>setRole(e.target.value)}><option value="">User Role</option><option>USER</option><option>ADMIN</option></select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">User Status</option><option>ACTIVE</option><option>BLOCKED</option></select><select value={subscription} onChange={e=>setSubscription(e.target.value)}><option value="">Subscription Status</option><option>ACTIVE</option><option>INCOMPLETE</option><option>PAYMENT_ISSUE</option><option>CANCELLED</option><option>NONE</option></select><button className="hs-outline" onClick={()=>{setSearch('');setRole('');setStatus('');setSubscription('')}}>Reset Filters</button></div>
    {error&&<div className="hs-error">{error}</div>}<div className="hs-table hs-users-table"><div className="hs-tr head"><span>USER</span><span>EMAIL</span><span>ROLE</span><span>STATUS</span><span>SUBSCRIPTION</span><span>JOINED</span><span>ACTIONS</span></div>{loading?<div className="hs-empty">Loading users…</div>:data.users.length===0?<div className="hs-empty">No users found</div>:data.users.map(user=><div className="hs-tr" key={user.id}><span className="hs-user-name"><i>{initials(user.fullName)}</i><b>{user.fullName}<small>Joined {formatDate(user.joinedAt)}</small></b></span><span>{user.email}</span><span><em className={`hs-pill ${pillClass(user.role)}`}>● {user.role}</em></span><span><em className={`hs-pill ${pillClass(user.status)}`}>● {user.status}</em></span><span><em className="hs-pill">● {user.subscriptionStatus}</em></span><span>{formatDate(user.joinedAt)}</span><span className="hs-row-actions"><Link to={`/admin/users/${user.id}`} title="View user">◉</Link><button onClick={()=>toggle(user)} title={user.status==='BLOCKED'?'Unblock user':'Block user'}>{user.status==='BLOCKED'?'✓':'⊘'}</button></span></div>)}</div>
    <AdminPagination {...data.pagination} onPageChange={setPage}/>
  </Panel></>
}
