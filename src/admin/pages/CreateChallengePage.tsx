import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminCreateChallenge, type AdminChallengeReminder } from '../../services/api'

type DraftReminder=AdminChallengeReminder & {key:string}
export function CreateChallengePage(){
 const navigate=useNavigate(), fileRef=useRef<HTMLInputElement>(null)
 const [title,setTitle]=useState(''),[challengeMonth,setChallengeMonth]=useState(''),[overview,setOverview]=useState(''),[goal,setGoal]=useState(''),[howToComplete,setHowToComplete]=useState(''),[relationshipBenefit,setRelationshipBenefit]=useState(''),[image,setImage]=useState<File|null>(null),[imageUrl,setImageUrl]=useState(''),[reminders,setReminders]=useState<DraftReminder[]>([]),[saving,setSaving]=useState(false),[error,setError]=useState('')
 const canSave=useMemo(()=>title.trim()&&challengeMonth&&overview.trim()&&goal.trim()&&howToComplete.trim()&&relationshipBenefit.trim(),[title,challengeMonth,overview,goal,howToComplete,relationshipBenefit])
 function choose(file?:File){if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Use a JPG, PNG, or WebP image.');return}if(file.size>5*1024*1024){setError('Challenge image must be 5 MB or smaller.');return}setImage(file);setImageUrl(URL.createObjectURL(file));setError('')}
 function addReminder(){setReminders(r=>[...r,{key:crypto.randomUUID(),dayOfMonth:1,timeOfDay:'09:00',channel:'EMAIL',isActive:true}])}
 function updateReminder(key:string,patch:Partial<DraftReminder>){setReminders(r=>r.map(x=>x.key===key?{...x,...patch}:x))}
 function removeReminder(key:string){setReminders(r=>r.filter(x=>x.key!==key))}
 async function submit(){if(!canSave)return;setSaving(true);setError('');try{const fd=new FormData();fd.set('title',title);fd.set('challengeMonth',challengeMonth);fd.set('overview',overview);fd.set('goal',goal);fd.set('howToComplete',howToComplete);fd.set('relationshipBenefit',relationshipBenefit);fd.set('status','DRAFT');fd.set('reminders',JSON.stringify(reminders.map(({key,...x})=>x)));if(image)fd.set('image',image);await adminCreateChallenge(fd);navigate('/admin/challenges')}catch(e){setError(e instanceof Error?e.message:'Unable to create challenge')}finally{setSaving(false)}}
 return <>
  <AdminHero eyebrow="ADMIN CHALLENGES" title="Create Challenge" copy="Create and maintain monthly challenge notes, artwork, publishing windows, and automated reminder rules." action={<Link className="hs-outline" to="/admin/challenges">Back to Challenges</Link>}/>
  <div className="hs-create-challenge-grid">
   <Panel className="hs-challenge-form-panel"><span className="hs-eyebrow">BASICS</span><h2>Challenge Content</h2>
    <label>Title<input value={title} onChange={e=>setTitle(e.target.value)}/></label>
    <label>Challenge Month<input type="month" value={challengeMonth} onChange={e=>setChallengeMonth(e.target.value)}/></label>
    <label>Overview<textarea rows={5} value={overview} onChange={e=>setOverview(e.target.value)}/></label>
    <label>Goal<textarea rows={5} value={goal} onChange={e=>setGoal(e.target.value)}/></label>
    <label>How To Complete<textarea rows={5} value={howToComplete} onChange={e=>setHowToComplete(e.target.value)}/></label>
    <label>Relationship Benefit<textarea rows={5} value={relationshipBenefit} onChange={e=>setRelationshipBenefit(e.target.value)}/></label>
    {error&&<div className="hs-error">{error}</div>}
    <div className="hs-form-actions"><button className="hs-btn" disabled={!canSave||saving} onClick={submit}>{saving?'Creating…':'Create Challenge'}</button></div>
   </Panel>
   <div className="hs-challenge-side">
    <Panel><span className="hs-eyebrow">ARTWORK</span><h2>Challenge Image</h2><div className="hs-artwork-preview">{imageUrl?<img src={imageUrl}/>:<span>No image uploaded yet</span>}</div><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>choose(e.target.files?.[0])}/><button className="hs-outline" onClick={()=>fileRef.current?.click()}>Choose Image</button><p>Selected artwork will be uploaded automatically right after the challenge is created.</p><p>Use a JPG, PNG, or WebP image up to 5 MB. Minimum size is 800 × 600 pixels.</p></Panel>
    <Panel><div className="hs-panel-head"><div><span className="hs-eyebrow">REMINDER RULES</span><h2>Automated Reminders</h2></div><button className="hs-btn" onClick={addReminder}>Add Reminder Rule</button></div>{reminders.length===0?<div className="hs-reminder-empty"><h2>No reminder rules yet</h2><p>Create one or more monthly reminder schedules for this challenge.</p></div>:<div className="hs-reminders">{reminders.map(r=><div className="hs-reminder-row" key={r.key}><label>Day<input type="number" min="1" max="31" value={r.dayOfMonth} onChange={e=>updateReminder(r.key,{dayOfMonth:Number(e.target.value)})}/></label><label>Time<input type="time" value={r.timeOfDay} onChange={e=>updateReminder(r.key,{timeOfDay:e.target.value})}/></label><label>Channel<select value={r.channel} onChange={e=>updateReminder(r.key,{channel:e.target.value as 'EMAIL'|'SMS'})}><option>EMAIL</option><option>SMS</option></select></label><button onClick={()=>removeReminder(r.key)}>×</button></div>)}</div>}</Panel>
   </div>
  </div>
 </>
}
