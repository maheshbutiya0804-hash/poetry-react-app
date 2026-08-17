import { useEffect, useState } from 'react'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminGetSettings, adminSaveSettings } from '../../services/api'

type SmsFlags={
 automaticSmsEnabled:boolean
 smsPoetryRequestReceived:boolean
 smsPoetryRequestCompleted:boolean
 smsCardOrderUpdates:boolean
 smsChallengeReminders:boolean
 smsSubscriptionNotifications:boolean
}

const defaultSms:SmsFlags={automaticSmsEnabled:true,smsPoetryRequestReceived:true,smsPoetryRequestCompleted:true,smsCardOrderUpdates:true,smsChallengeReminders:true,smsSubscriptionNotifications:true}

function Toggle({value,onChange,disabled=false}:{value:boolean;onChange:()=>void;disabled?:boolean}){
 return <button type="button" className={`hs-switch ${value?'on':''} ${disabled?'disabled':''}`} aria-pressed={value} disabled={disabled} onClick={onChange}><i/></button>
}

export function SettingsPage(){
 const [fee,setFee]=useState('7'),[feedback,setFeedback]=useState(true),[sms,setSms]=useState<SmsFlags>(defaultSms),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('')
 useEffect(()=>{adminGetSettings().then(s=>{setFee(String(s.defaultPrintingFee));setFeedback(s.orderFeedbackEmail);setSms({automaticSmsEnabled:s.automaticSmsEnabled,smsPoetryRequestReceived:s.smsPoetryRequestReceived,smsPoetryRequestCompleted:s.smsPoetryRequestCompleted,smsCardOrderUpdates:s.smsCardOrderUpdates,smsChallengeReminders:s.smsChallengeReminders,smsSubscriptionNotifications:s.smsSubscriptionNotifications})}).catch(e=>setError(e instanceof Error?e.message:'Unable to load settings')).finally(()=>setLoading(false))},[])
 const flip=(key:keyof SmsFlags)=>setSms(v=>({...v,[key]:!v[key]}))
 async function save(){setSaving(true);setMessage('');setError('');try{const s=await adminSaveSettings({defaultPrintingFee:Number(fee),orderFeedbackEmail:feedback,...sms});setFee(String(s.defaultPrintingFee));setMessage('Settings saved. Automatic SMS rules are now active.')}catch(e){setError(e instanceof Error?e.message:'Unable to save settings')}finally{setSaving(false)}}
 const automations:[keyof Omit<SmsFlags,'automaticSmsEnabled'>,string,string][]=[
  ['smsPoetryRequestReceived','Poetry request received','Send confirmation when a subscribed user submits a custom poetry request.'],
  ['smsPoetryRequestCompleted','Poetry request completed','Tell the user when an admin marks their custom poem as completed.'],
  ['smsCardOrderUpdates','Card order updates','Send order placed, shipping quote, fulfillment, shipped, delivered, and cancellation updates.'],
  ['smsChallengeReminders','Challenge reminders','Send the SMS reminder text configured for published monthly challenges.'],
  ['smsSubscriptionNotifications','Subscription notifications','Send important subscription activation and payment-problem messages.'],
 ]
 return <>
  <AdminHero title="System Settings" copy="Manage platform values and control automatic SMS notifications from one place." action={<button className="hs-outline">⚙ Platform Values</button>}/>
  <Panel><span className="hs-eyebrow">CONFIGURATION</span><h2>Order Pricing & Alerts</h2><p>Update the values that affect physical card handling and admin feedback notifications.</p>
   {loading?<div className="hs-empty-line">Loading settings…</div>:<div className="hs-settings-form"><label><span>DEFAULT PRINTING FEE</span><div className="hs-money-input"><i>$</i><input type="number" min="0" step="0.01" value={fee} onChange={e=>setFee(e.target.value)}/></div><small>This amount is used as the default printing fee shown during physical card checkout.</small></label><div className="hs-setting-toggle"><span><b>ORDER FEEDBACK EMAIL</b><small>Send an email notification to admin when a customer adds feedback for a delivered order.</small></span><Toggle value={feedback} onChange={()=>setFeedback(v=>!v)}/></div></div>}
  </Panel>
  <Panel><span className="hs-eyebrow">TWILIO AUTOMATION</span><h2>Automatic SMS Controls</h2><p>Choose exactly which Laurentine events are allowed to send automatic SMS messages. Manual messages from Admin → Notifications are not affected.</p>
   {!loading&&<div className="hs-sms-settings">
    <div className="hs-setting-toggle hs-master-toggle"><span><b>AUTOMATIC SMS</b><small>Master switch. Turn this off to stop every automatic Twilio SMS without changing the individual preferences below.</small></span><Toggle value={sms.automaticSmsEnabled} onChange={()=>flip('automaticSmsEnabled')}/></div>
    <div className={`hs-sms-rules ${!sms.automaticSmsEnabled?'muted':''}`}>
     {automations.map(([key,title,copy])=><div className="hs-setting-toggle" key={key}><span><b>{title.toUpperCase()}</b><small>{copy}</small></span><Toggle value={sms[key]} onChange={()=>flip(key)} disabled={!sms.automaticSmsEnabled}/></div>)}
    </div>
    <div className="hs-sms-note"><b>Challenge scheduler</b><span>Challenge reminders are sent by the secure daily cron endpoint. Add <code>SMS_CRON_SECRET</code> to the server environment and schedule a daily POST to <code>/internal/challenge-reminders/run</code> with the matching <code>x-cron-secret</code> header.</span></div>
   </div>}
   {message&&<div className="hs-success">{message}</div>}{error&&<div className="hs-error">{error}</div>}
   {!loading&&<div className="hs-settings-actions"><button className="hs-btn" disabled={saving} onClick={save}>▣ {saving?'Saving…':'Save Settings'}</button><button className="hs-outline" onClick={()=>{setMessage('');setError('')}}>Cancel</button></div>}
  </Panel>
 </>
}
