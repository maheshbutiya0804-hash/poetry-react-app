import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminDeleteChallenge, adminGetChallenges, adminSetChallengeStatus, type AdminChallengesResponse } from '../../services/api'

const initial:AdminChallengesResponse={summary:{total:0,drafts:0,published:0},challenges:[]}
const monthFmt=(v:string)=>new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(v))

export function ChallengesPage(){
 const [data,setData]=useState(initial),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[month,setMonth]=useState(''),[year,setYear]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('')
 async function load(){setLoading(true);setError('');try{setData(await adminGetChallenges({search,status,month,year}))}catch(e){setError(e instanceof Error?e.message:'Unable to load challenges')}finally{setLoading(false)}}
 useEffect(()=>{const t=setTimeout(load,160);return()=>clearTimeout(t)},[search,status,month,year])
 async function toggle(id:string,current:string){try{await adminSetChallengeStatus(id,current==='PUBLISHED'?'DRAFT':'PUBLISHED');await load()}catch(e){setError(e instanceof Error?e.message:'Unable to update challenge')}}
 async function remove(id:string){if(!confirm('Delete this challenge?'))return;try{await adminDeleteChallenge(id);await load()}catch(e){setError(e instanceof Error?e.message:'Unable to delete challenge')}}
 return <>
  <AdminHero title="Challenges" copy="Plan, publish, and maintain monthly challenge notes for subscribers, along with reminder schedules and release actions." action={<Link className="hs-btn" to="/admin/challenges/create">Create Challenge</Link>}/>
  <Panel>
   <span className="hs-eyebrow">MONTHLY</span><h2>Challenges Management</h2><p>Browse and manage monthly challenge cycles with status, date windows, and completion tracking.</p>
   <div className="hs-filter hs-challenge-filter"><label className="hs-search">⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search challenges"/></label><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Challenge Status</option><option>DRAFT</option><option>PUBLISHED</option></select><select value={month} onChange={e=>setMonth(e.target.value)}><option value="">Challenge Month</option>{Array.from({length:12},(_,i)=><option key={i} value={String(i+1)}>{new Intl.DateTimeFormat('en',{month:'long'}).format(new Date(2026,i,1))}</option>)}</select><input className="hs-year" value={year} onChange={e=>setYear(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="Year"/></div>
   {error&&<div className="hs-error">{error}</div>}
   {loading?<div className="hs-empty challenge-empty">Loading challenges…</div>:data.challenges.length===0?<div className="hs-empty challenge-empty"><h2>No challenges found</h2><p>Try a different search, status, or year filter.</p></div>:<div className="hs-challenge-list">{data.challenges.map(c=><article key={c.id} className="hs-challenge-item">{c.imageUrl?<img src={c.imageUrl}/>:<div className="hs-challenge-thumb"/>}<div><b>{c.title}</b><small>{monthFmt(c.challengeMonth)}</small></div><em className={`hs-pill ${c.status==='PUBLISHED'?'green':''}`}>{c.status}</em><span>{c.reminders.length} reminder{c.reminders.length===1?'':'s'}</span><div className="hs-row-actions"><button onClick={()=>toggle(c.id,c.status)} title="Toggle status">{c.status==='PUBLISHED'?'◌':'✓'}</button><button onClick={()=>remove(c.id)} title="Delete">⌫</button></div></article>)}</div>}
  </Panel>
 </>
}
