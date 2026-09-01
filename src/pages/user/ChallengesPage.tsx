import { useEffect, useState } from 'react'
import { createSubscriptionCheckout, getCurrentChallenge, updateChallengePreferences, type UserMonthlyChallenge } from '../../services/api'

function PreferenceToggle({label,description,checked,onChange,disabled}:{label:string;description:string;checked:boolean;onChange:(checked:boolean)=>void;disabled:boolean}){
  return <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] px-5 py-4">
    <div className="min-w-0">
      <h3 className="m-0 text-base font-bold text-[#2f2a25]">{label}</h3>
      <p className="mt-1 text-sm text-[#776d62]">{description}</p>
    </div>
    <label className={`relative flex min-h-[46px] shrink-0 items-center gap-3 rounded-full border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] px-4 outline-none transition focus-within:border-[rgba(23,57,47,0.26)] focus-within:bg-[#fffdfa] focus-within:ring-4 focus-within:ring-[rgba(23,57,47,0.06)] hover:border-[rgba(23,57,47,0.18)] hover:bg-[#fffdfa] ${disabled?'cursor-wait opacity-65':'cursor-pointer'}`}>
      <div className="relative flex items-center">
        <input className="peer sr-only" aria-label={label} type="checkbox" checked={checked} disabled={disabled} onChange={e=>onChange(e.target.checked)}/>
        <div className="h-[22px] w-10 rounded-full bg-[rgba(57,47,39,0.2)] transition-colors duration-300 peer-checked:bg-[#17392f]" />
        <div className="absolute left-[2px] top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-[18px]" />
      </div>
      <span className="select-none text-[0.94rem] text-[#2f2a25]">{label}</span>
    </label>
  </div>
}

function ChallengeContent({challenge}:{challenge:UserMonthlyChallenge}){
  return <section className="overflow-hidden rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] shadow-[0_18px_40px_rgba(47,37,28,0.06)]">
    {challenge.imageUrl&&<img src={challenge.imageUrl} alt="" className="h-[300px] w-full object-cover max-[760px]:h-[220px]"/>}
    <div className="p-7 max-[760px]:p-5">
      <span className="text-[0.74rem] uppercase tracking-[0.18em] text-[#776d62]">This Month</span>
      <h2 className="mt-2 font-serif text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-[#2f2a25]">{challenge.title}</h2>
      <p className="mt-4 max-w-[850px] whitespace-pre-line text-[1rem] leading-7 text-[#776d62]">{challenge.overview}</p>
      <div className="mt-6 rounded-[20px] border border-[rgba(170,127,56,0.18)] bg-[#fff8eb] px-5 py-4 text-sm leading-6 text-[#6b5a42]"><strong>Make it your own.</strong> Monthly challenges and Where to Leave It ideas are completely optional, but strongly encouraged. Every challenge is designed to be simple, meaningful, and affordable — never outlandish or expensive.</div>
      <div className="mt-7 grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
        <div className="rounded-[20px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-5"><span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8a7d70]">The Goal</span><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4f473f]">{challenge.goal}</p></div>
        <div className="rounded-[20px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-5"><span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8a7d70]">How to Complete</span><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4f473f]">{challenge.howToComplete}</p></div>
        <div className="rounded-[20px] border border-[rgba(57,47,39,0.1)] bg-[#f9f5ef] p-5"><span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#8a7d70]">Why It Matters</span><p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#4f473f]">{challenge.relationshipBenefit}</p></div>
      </div>
      {challenge.scavengerLocations && challenge.scavengerLocations.length>0 && <section className="mt-8 rounded-[26px] border border-[rgba(57,47,39,0.11)] bg-[#f8f1e8] p-6 max-[760px]:p-5"><span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#aa7f38]">Scavenger List</span><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h3 className="m-0 font-serif text-[2rem] font-semibold leading-none text-[#2f2a25]">Where to Leave It</h3><p className="mt-2 max-w-[720px] text-sm leading-6 text-[#776d62]">A little surprise can make the note feel even more special. Pick any spot below and leave the card somewhere your spouse can discover it naturally.</p></div><span className="rounded-full border border-[rgba(57,47,39,.1)] bg-[#fcfaf7] px-3 py-2 text-xs font-bold text-[#776d62]">Optional · strongly encouraged</span></div><div className="mt-5 grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">{challenge.scavengerLocations.map((location,index)=><div key={`${location}-${index}`} className="flex items-center gap-3 rounded-[16px] border border-[rgba(57,47,39,.09)] bg-[#fcfaf7] px-4 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgba(23,57,47,.08)] text-xs font-extrabold text-[#17392f]">{String(index+1).padStart(2,'0')}</span><span className="text-sm font-semibold text-[#4f473f]">{location}</span></div>)}</div></section>}
    </div>
  </section>
}

export function UserChallengesPage(){
  const [loading,setLoading]=useState(true)
  const [subscriber,setSubscriber]=useState<boolean|null>(null)
  const [challenge,setChallenge]=useState<UserMonthlyChallenge|null>(null)
  const [emailEnabled,setEmailEnabled]=useState(true)
  const [smsEnabled,setSmsEnabled]=useState(true)
  const [saving,setSaving]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')
  const [checkout,setCheckout]=useState(false)

  useEffect(()=>{
    getCurrentChallenge().then(data=>{
      setSubscriber(true)
      setChallenge(data.challenge)
      setEmailEnabled(data.preferences.challengeEmailEnabled)
      setSmsEnabled(data.preferences.challengeSmsEnabled)
    }).catch(e=>{
      const text=e instanceof Error?e.message:'Unable to load challenges.'
      if(/active subscription/i.test(text)) setSubscriber(false)
      else setError(text)
    }).finally(()=>setLoading(false))
  },[])

  async function save(nextEmail:boolean,nextSms:boolean){
    const oldEmail=emailEnabled, oldSms=smsEnabled
    setEmailEnabled(nextEmail);setSmsEnabled(nextSms);setSaving(true);setMessage('');setError('')
    try{
      const prefs=await updateChallengePreferences({challengeEmailEnabled:nextEmail,challengeSmsEnabled:nextSms})
      setEmailEnabled(prefs.challengeEmailEnabled);setSmsEnabled(prefs.challengeSmsEnabled)
      setMessage('Challenge notification settings updated.')
      window.setTimeout(()=>setMessage(''),3000)
    }catch(e){
      setEmailEnabled(oldEmail);setSmsEnabled(oldSms)
      setError(e instanceof Error?e.message:'Unable to update challenge notifications.')
    }finally{setSaving(false)}
  }

  async function subscribe(){
    setCheckout(true);setError('')
    try{const result=await createSubscriptionCheckout('/challenges');window.location.assign(result.url)}
    catch(e){setError(e instanceof Error?e.message:'Unable to start checkout.');setCheckout(false)}
  }

  if(loading)return <main className="flex flex-1 flex-col"><section className="flex flex-1 items-center justify-center bg-[#f7f4ef] text-[#776d62]">Loading challenges…</section></main>

  return <main className="flex-1 flex flex-col"><section className="flex flex-1 flex-col bg-[#f7f4ef] px-16 pb-12 pt-12 text-[#2f2a25] max-[1180px]:px-7 max-[760px]:px-[18px] max-[760px]:pt-8"><div className="mx-auto flex w-full max-w-[1220px] flex-col gap-8">
    <header><span className="mb-2 inline-block text-[0.74rem] uppercase tracking-[0.18em] text-[#776d62]">Monthly Challenge</span><h1 className="m-0 font-serif text-[clamp(2.8rem,5vw,4.6rem)] font-semibold leading-[0.94] tracking-[-0.03em]">Challenge Notes</h1><p className="mt-3 max-w-[720px] text-[1rem] leading-7 text-[#776d62]">A subscriber-only place for simple monthly prompts that keep affection, intention, and quality time moving through the year.</p></header>

    {subscriber===false ? <section className="mx-auto flex min-h-[300px] w-full max-w-2xl flex-col items-center justify-center gap-5 rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-8 text-center shadow-[0_18px_40px_rgba(47,37,28,0.05)]"><h2 className="font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em]">Subscribe to join the challenge</h2><p className="max-w-[560px] text-sm leading-6 text-[#776d62] md:text-base">Monthly Challenge Notes and reminder preferences are available to active Laurentine subscribers.</p>{error&&<p className="text-sm text-red-700">{error}</p>}<button type="button" onClick={subscribe} disabled={checkout} className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-[#17392f] px-7 text-sm font-bold text-[#f7f4ef] disabled:opacity-60">{checkout?'Opening checkout…':'Subscribe Now'}</button></section> : <>
      {challenge?<ChallengeContent challenge={challenge}/>:<section className="mx-auto flex min-h-[280px] w-full flex-1 flex-col items-center justify-center gap-6 rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] text-center md:w-xl"><h1 className="font-serif text-4xl font-semibold leading-[0.96] tracking-[-0.03em] md:text-5xl">No current challenge yet</h1><p className="max-w-[80%] text-sm text-[#776d62] md:text-base">The next monthly challenge has not been published yet.</p></section>}

      <section className="rounded-[28px] border border-[rgba(57,47,39,0.12)] bg-[#fcfaf7] p-6 shadow-[0_18px_40px_rgba(47,37,28,0.06)]"><div className="mb-5"><span className="mb-2 inline-block text-[0.74rem] uppercase tracking-[0.18em] text-[#776d62]">Preferences</span><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none text-[#2f2a25]">Challenge notifications</h2><p className="mt-2 max-w-[760px] text-[0.95rem] text-[#776d62]">Choose how you want to hear about new monthly challenges and reminders.</p></div><div className="grid gap-4"><PreferenceToggle label="Challenge Emails" description="Email updates for new monthly challenges and reminder nudges." checked={emailEnabled} disabled={saving} onChange={v=>save(v,smsEnabled)}/><PreferenceToggle label="Challenge SMS" description="SMS updates for releases and challenge reminders." checked={smsEnabled} disabled={saving} onChange={v=>save(emailEnabled,v)}/></div>{message&&<p className="mt-4 rounded-[16px] border border-[rgba(23,57,47,0.14)] bg-[rgba(23,57,47,0.07)] px-4 py-3 text-sm font-semibold text-[#17392f]">{message}</p>}{error&&<p className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}</section>
    </>}
  </div></section></main>
}
