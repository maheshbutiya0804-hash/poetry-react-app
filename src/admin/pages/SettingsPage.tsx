import { useEffect, useState } from 'react'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminGetSettings, adminSaveSettings } from '../../services/api'

export function SettingsPage(){
 const [fee,setFee]=useState('7'),[feedback,setFeedback]=useState(true),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
 useEffect(()=>{adminGetSettings().then(s=>{setFee(String(s.defaultPrintingFee));setFeedback(s.orderFeedbackEmail)}).catch(e=>setError(e instanceof Error?e.message:'Unable to load settings')).finally(()=>setLoading(false))},[])
 async function save(){setSaving(true);setMessage('');setError('');try{const s=await adminSaveSettings({defaultPrintingFee:Number(fee),orderFeedbackEmail:feedback});setFee(String(s.defaultPrintingFee));setMessage('Settings saved.')}catch(e){setError(e instanceof Error?e.message:'Unable to save settings')}finally{setSaving(false)}}
 return <>
  <AdminHero title="System Settings" copy="Manage system-level values used by order pricing and admin notifications." action={<button className="hs-outline">⚙ Platform Values</button>}/>
  <Panel><span className="hs-eyebrow">CONFIGURATION</span><h2>Order Pricing & Alerts</h2><p>Update the values that affect physical card handling and admin feedback notifications.</p>
   {loading?<div className="hs-empty-line">Loading settings…</div>:<div className="hs-settings-form"><label><span>DEFAULT PRINTING FEE</span><div className="hs-money-input"><i>$</i><input type="number" min="0" step="0.01" value={fee} onChange={e=>setFee(e.target.value)}/></div><small>This amount is used as the default printing fee shown during physical card checkout.</small></label><div className="hs-setting-toggle"><span><b>ORDER FEEDBACK EMAIL</b><small>Send an email notification to admin when a customer adds feedback for a delivered order.</small></span><span className={`hs-switch ${feedback?'on':''}`} onClick={()=>setFeedback(v=>!v)}><i/></span></div><div className="hs-settings-actions"><button className="hs-btn" disabled={saving} onClick={save}>▣ {saving?'Saving…':'Save Settings'}</button><button className="hs-outline" onClick={()=>{setMessage('');setError('')}}>Cancel</button></div></div>}
   {message&&<div className="hs-success">{message}</div>}{error&&<div className="hs-error">{error}</div>}
  </Panel>
 </>
}
