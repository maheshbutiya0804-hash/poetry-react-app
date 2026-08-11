import { useEffect, useState } from 'react'
import { AdminHero, Panel, StatCard } from '../components/AdminLayout'
import { adminGetCommunity, adminModeratePost, type AdminCommunityPayload } from '../../services/api'

const initial:AdminCommunityPayload={summary:{totalPosts:0,reportedPosts:0,reportedResponses:0},posts:[]}
export function CommunityPage(){
 const [data,setData]=useState(initial),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[reportedOnly,setReportedOnly]=useState(false),[error,setError]=useState('')
 async function load(){try{setData(await adminGetCommunity({search,status,reportedOnly}));setError('')}catch(e){setError(e instanceof Error?e.message:'Unable to load community')}}
 useEffect(()=>{const t=setTimeout(load,160);return()=>clearTimeout(t)},[search,status,reportedOnly])
 async function act(id:string,status:'PUBLISHED'|'HIDDEN'|'REMOVED'){try{await adminModeratePost(id,{status,clearReport:status==='PUBLISHED'});await load()}catch(e){setError(e instanceof Error?e.message:'Unable to moderate post')}}
 return <>
  <AdminHero title="Community" copy="A refined review space for browsing active discussions and resolving reported posts and responses." action={<button className="hs-outline">□ Moderation</button>}/>
  <div className="hs-stats three"><StatCard label="TOTAL POSTS" value={data.summary.totalPosts} note="Published community conversations across the forum."/><StatCard label="REPORTED POSTS" value={data.summary.reportedPosts} note="Unique posts currently surfaced for careful review."/><StatCard label="REPORTED RESPONSES" value={data.summary.reportedResponses} note="Replies awaiting conversation-level review."/></div>
  <Panel><span className="hs-eyebrow">COMMUNITY</span><h2>Posts Management</h2><p>Browse active discussions and resolve reported posts and responses.</p><div className="hs-filter hs-community-filter"><label className="hs-search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by author, category, or post"/></label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Post Status</option><option>PUBLISHED</option><option>HIDDEN</option><option>REMOVED</option></select><label className="hs-switch-label">Show Reported Only <span className={`hs-switch ${reportedOnly?'on':''}`} onClick={()=>setReportedOnly(v=>!v)}><i/></span></label></div>{error&&<div className="hs-error">{error}</div>}
   {data.posts.length===0?<div className="hs-empty hs-community-empty"><div className="hs-empty-icon">▱</div><h2>No community posts found</h2><p>Forum posts will appear here once members start sharing stories.</p></div>:<div className="hs-community-list">{data.posts.map(p=><article key={p.id}><div><span className="hs-eyebrow">{p.category}</span><h3>{p.title}</h3><p>{p.body}</p><small>By {p.authorName} · {p.responses.length} response{p.responses.length===1?'':'s'}</small></div><div className="hs-community-actions"><em className={`hs-pill ${p.isReported?'danger':''}`}>{p.isReported?`${p.reportCount} REPORTS`:p.status}</em><button className="hs-outline" onClick={()=>act(p.id,'PUBLISHED')}>Publish</button><button className="hs-outline" onClick={()=>act(p.id,'HIDDEN')}>Hide</button><button className="hs-outline" onClick={()=>act(p.id,'REMOVED')}>Remove</button></div></article>)}</div>}
  </Panel>
 </>
}
