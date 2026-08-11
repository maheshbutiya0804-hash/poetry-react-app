import { useEffect, useMemo, useState } from 'react'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminCreateNotification, adminGetNotifications, adminGetUsers, type AdminNotificationJob, type AdminUser } from '../../services/api'

const fmt=(v:string)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'2-digit',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(v))

export function NotificationsPage(){
 const [channel,setChannel]=useState<'EMAIL'|'SMS'>('EMAIL')
 const [audience,setAudience]=useState<'SINGLE_USER'|'SUBSCRIBERS_ONLY'|'ALL_USERS'>('SINGLE_USER')
 const [subject,setSubject]=useState(''),[recipientEmail,setRecipientEmail]=useState(''),[message,setMessage]=useState('')
 const [userSearch,setUserSearch]=useState(''),[users,setUsers]=useState<AdminUser[]>([]),[selected,setSelected]=useState<AdminUser|null>(null)
 const [jobs,setJobs]=useState<AdminNotificationJob[]>([]),[jobSearch,setJobSearch]=useState(''),[jobStatus,setJobStatus]=useState(''),[jobAudience,setJobAudience]=useState('')
 const [error,setError]=useState(''),[sending,setSending]=useState(false)

 async function loadJobs(){try{setJobs((await adminGetNotifications({search:jobSearch,status:jobStatus,audience:jobAudience})).jobs)}catch(e){setError(e instanceof Error?e.message:'Unable to load jobs')}}
 useEffect(()=>{const t=setTimeout(loadJobs,160);return()=>clearTimeout(t)},[jobSearch,jobStatus,jobAudience])
 useEffect(()=>{const t=setTimeout(async()=>{try{setUsers((await adminGetUsers({search:userSearch})).users.slice(0,8))}catch{}},160);return()=>clearTimeout(t)},[userSearch])

 const summary=useMemo(()=>({channel,audience,selected:selected?.fullName??'Not selected',length:message.length}),[channel,audience,selected,message])
 async function send(){setError('');setSending(true);try{await adminCreateNotification({channel,audience,selectedUserId:selected?.id??null,recipientEmail:recipientEmail||null,subject:channel==='EMAIL'?subject:null,message});setSubject('');setRecipientEmail('');setMessage('');setSelected(null);await loadJobs()}catch(e){setError(e instanceof Error?e.message:'Unable to create notification')}finally{setSending(false)}}
 function reset(){setChannel('EMAIL');setAudience('SINGLE_USER');setSubject('');setRecipientEmail('');setMessage('');setSelected(null);setError('')}
 return <>
  <AdminHero title="Notifications" copy="Send careful email and SMS updates to users, subscribers, and selected recipients." action={<button className="hs-outline">♧ Composer</button>}/>
  <div className="hs-notification-grid">
   <Panel className="hs-notify-compose">
    <span className="hs-eyebrow">MESSAGE COMPOSER</span><h2>Create Notification</h2><p>Choose the channel, define the audience, and prepare a clear message.</p>
    <span className="hs-form-label">NOTIFICATION TYPE</span><div className="hs-choice-row two"><button className={channel==='EMAIL'?'active':''} onClick={()=>setChannel('EMAIL')}><b>✉ Email</b><small>Send a carefully written email update.</small></button><button className={channel==='SMS'?'active':''} onClick={()=>setChannel('SMS')}><b>▣ SMS</b><small>Send a short SMS to a user or segment.</small></button></div>
    <span className="hs-form-label">RECIPIENT SCOPE</span><div className="hs-choice-row three"><button className={audience==='SINGLE_USER'?'active':''} onClick={()=>setAudience('SINGLE_USER')}>Single User</button><button className={audience==='SUBSCRIBERS_ONLY'?'active':''} onClick={()=>setAudience('SUBSCRIBERS_ONLY')}>Subscribers Only</button><button className={audience==='ALL_USERS'?'active':''} onClick={()=>setAudience('ALL_USERS')}>All Users</button></div>
    {channel==='EMAIL'&&<label className="hs-notify-field">SUBJECT<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Example: Your order update from Heartstring Notes"/></label>}
    {audience==='SINGLE_USER'&&<label className="hs-notify-field">RECIPIENT EMAIL<input value={recipientEmail} onChange={e=>setRecipientEmail(e.target.value)} placeholder="name@example.com"/></label>}
    <label className="hs-notify-field">MESSAGE<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={7} placeholder={channel==='EMAIL'?'Write the email body.':'Write the SMS message.'}/></label>
    <div className="hs-limit-box"><b>SENDING LIMITS</b><p>Up to <strong>300 emails</strong> can be sent at one time, and up to <strong>3,000 emails</strong> can be sent in a day. Provider delivery will be connected separately; this admin currently records queued notification jobs.</p></div>
    {error&&<div className="hs-error">{error}</div>}
    <div className="hs-compose-actions"><span><em className="hs-pill green">{channel}</em> <em className="hs-pill">{audience.replaceAll('_',' ')}</em></span><div><button className="hs-outline" onClick={reset}>↻ Reset</button><button className="hs-btn" disabled={sending||!message.trim()} onClick={send}>➤ {sending?'Saving…':'Send Notification'}</button></div></div>
   </Panel>
   <div>
    <Panel>
     <span className="hs-eyebrow">RECIPIENT LOOKUP</span><h2>Select User</h2><p>Search the local directory preview and fill contact fields quickly.</p>
     <label className="hs-search hs-recipient-search">⌕ <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="Search by name, email, or phone"/></label>
     <div className="hs-recipient-list">{users.length===0?<div className="hs-empty-line">No users found.</div>:users.map(u=><button key={u.id} className={selected?.id===u.id?'selected':''} onClick={()=>{setSelected(u);setRecipientEmail(u.email)}}><span><b>{u.fullName}</b><small>{u.email}</small></span><em className="hs-pill">{u.subscriptionStatus}</em></button>)}</div>
    </Panel>
    <Panel><span className="hs-eyebrow">PREVIEW</span><h2>Delivery Summary</h2><p>A quick final check before the notification is sent.</p><div className="hs-summary-list"><p><span>Channel</span><b>{summary.channel}</b></p><p><span>Audience</span><b>{summary.audience.replaceAll('_',' ')}</b></p><p><span>Selected User</span><b>{summary.selected}</b></p><p><span>Message Length</span><b>{summary.length} chars</b></p></div></Panel>
   </div>
  </div>
  <Panel><span className="hs-eyebrow">HISTORY</span><h2>Notification Jobs</h2><p>Review queued and saved notification jobs with quick filters for follow-up.</p><div className="hs-filter hs-notify-history"><label className="hs-search">⌕ <input value={jobSearch} onChange={e=>setJobSearch(e.target.value)} placeholder="Search by subject"/></label><select value={jobStatus} onChange={e=>setJobStatus(e.target.value)}><option value="">Job Status</option><option>QUEUED</option><option>SENDING</option><option>SENT</option><option>FAILED</option><option>CANCELLED</option></select><select value={jobAudience} onChange={e=>setJobAudience(e.target.value)}><option value="">Job Audience</option><option value="SINGLE_USER">Single User</option><option value="SUBSCRIBERS_ONLY">Subscribers Only</option><option value="ALL_USERS">All Users</option></select><button className="hs-outline" onClick={loadJobs}>↻ Refresh</button></div>
   {jobs.length===0?<div className="hs-empty"><h2>No notification jobs found</h2><p>Send a notification or adjust the filters to see job history.</p></div>:<div className="hs-job-table"><div className="hs-job-row head"><span>SUBJECT / MESSAGE</span><span>CHANNEL</span><span>AUDIENCE</span><span>RECIPIENTS</span><span>STATUS</span><span>CREATED</span></div>{jobs.map(j=><div className="hs-job-row" key={j.id}><span><b>{j.subject||j.message.slice(0,50)}</b><small>{j.selectedUser?.fullName||j.recipientEmail||'Segment delivery'}</small></span><span>{j.channel}</span><span>{j.audience.replaceAll('_',' ')}</span><span>{j.totalRecipients}</span><span><em className={`hs-pill ${j.status==='SENT'?'green':''}`}>{j.status}</em></span><span>{fmt(j.createdAt)}</span></div>)}</div>}
  </Panel>
 </>
}
