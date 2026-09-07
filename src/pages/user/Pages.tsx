import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CategorySection } from '../../components/CategorySection'
import { categories } from '../../data/cards'
import { EmptyState, MiniCardGrid, PageHeader, Panel, Stat } from '../../components/app/PagePrimitives'
import { createPoetryRequest, getProfile } from '../../services/api'

export function LandingSecondaryPage() { return <div className="content-page"><PageHeader eyebrow="Discover" title="Poetry made personal." copy="Browse meaningful cards, save favourites, and add your own message."/><MiniCardGrid/><Panel title="Browse by feeling"><div className="chip-row">{['Love','Birthday','Anniversary','Gratitude','Friendship','Family'].map(x=><Link to={`/category/${x.toLowerCase()}`} className="chip" key={x}>{x}</Link>)}</div></Panel></div> }
export function SearchPage() { return <div className="content-page"><PageHeader eyebrow="Library" title="Find the right words." copy="Search poems by occasion, feeling, or a phrase you remember."/><Panel><div className="search-bar"><input placeholder="Search poetry cards"/><button className="button">Search</button></div><div className="filter-row">{['All','Love','Birthday','Anniversary','Family'].map(x=><button key={x}>{x}</button>)}</div></Panel><MiniCardGrid/></div> }
export function CategoriesPage() { return <div className="content-page"><PageHeader eyebrow="Collections" title="Browse every category." copy="Poetry organised around moments that matter."/><div className="category-tile-grid">{categories.map(c=><Link to={`/category/${c.name.toLowerCase().replaceAll(' ','-')}`} className="category-tile" key={c.name}><span>Category</span><h2>{c.name}</h2><p>{c.subtitle}</p></Link>)}</div></div> }
export function CategoryPage() { const {slug='love'}=useParams(); const name=slug.split('-').map(s=>s[0]?.toUpperCase()+s.slice(1)).join(' '); return <div className="content-page"><PageHeader eyebrow="Category" title={name} copy="Choose a card, open it, and make the message yours."/><MiniCardGrid/><MiniCardGrid/></div> }
export function SignUpPage() { return <AuthPage title="Create your account" action="Create Account" alternate="Already have an account?" alternateTo="/sign-in"/> }
export function SignInPage() { return <AuthPage title="Welcome back" action="Sign In" alternate="New to Verse & Feeling?" alternateTo="/sign-up"/> }
export function ChangePasswordPage() { return <AuthPage title="Change password" action="Update Password" alternate="Return to profile" alternateTo="/profile"/> }
export function ResetPasswordPage() { return <AuthPage title="Reset your password" action="Send Reset Link" alternate="Remembered your password?" alternateTo="/sign-in" emailOnly/> }
function AuthPage({title,action,alternate,alternateTo,emailOnly=false}:{title:string;action:string;alternate:string;alternateTo:string;emailOnly?:boolean}) { return <div className="auth-page"><form className="auth-card"><p className="eyebrow">Account</p><h1>{title}</h1><label>Email<input type="email" placeholder="you@example.com"/></label>{!emailOnly&&<label>Password<input type="password" placeholder="••••••••"/></label>}<button className="button" type="button">{action}</button><p>{alternate} <Link to={alternateTo}>Continue</Link></p></form></div> }
export function DashboardPage() { return <div className="content-page"><PageHeader eyebrow="Your account" title="Good morning." copy="Continue exploring your saved cards and recent activity."/><div className="stat-grid"><Stat label="Saved cards" value="24"/><Stat label="Downloads" value="8"/><Stat label="Subscription" value="Active"/></div><Panel title="Recently viewed"><MiniCardGrid/></Panel></div> }
export function CardFrontPage(){return <CardDetail side="Front" subscribed/>}
export function CardBackPage(){return <CardDetail side="Back" subscribed/>}
export function CardFrontLockedPage(){return <CardDetail side="Front"/>}
export function CardBackLockedPage(){return <CardDetail side="Back"/>}
function CardDetail({side,subscribed=false}:{side:string;subscribed?:boolean}){return <div className="content-page"><PageHeader eyebrow="Card detail" title={`${side} preview`} copy={subscribed?'Personalise and download this card.':'Subscribe to unlock downloads and full personalisation.'}/><div className="card-detail-layout"><article className="large-poem theme-forest inverse"><span className="pill">Love</span><div><h2>Still Choosing You</h2><p>Every day, I choose you all over again.</p></div><small>Verse & Feeling™</small></article><Panel title={subscribed?'Make it yours':'Unlock this card'}>{subscribed?<><label className="field">Your message<textarea defaultValue="With all my love, today and always."/></label><div className="button-row"><button className="button">Save</button><button className="secondary-button">Download</button></div></>:<EmptyState title="Members-only card" copy="Start your subscription for unlimited viewing and downloads." to="/sign-up" label="Start Access"/>}</Panel></div></div>}
export function OrderCardPage(){return <div className="content-page"><PageHeader eyebrow="Printed card" title="Order your card." copy="Choose paper, quantity, delivery address, and a handwritten message."/><div className="two-column"><Panel title="Order details"><FormFields/></Panel><Panel title="Summary"><div className="summary-list"><span>Premium card <strong>$12.00</strong></span><span>Shipping <strong>$4.00</strong></span><span>Total <strong>$16.00</strong></span></div><button className="button full">Continue to payment</button></Panel></div></div>}
function FormFields(){return <div className="form-grid"><label className="field">Full name<input placeholder="Your name"/></label><label className="field">Email<input placeholder="you@example.com"/></label><label className="field full-span">Address<input placeholder="Street address"/></label><label className="field">City<input/></label><label className="field">Postal code<input/></label></div>}
export function LibraryPage(){return <div className="content-page"><PageHeader eyebrow="Saved collection" title="Your library." copy="Cards you saved, downloaded, or recently opened."/><div className="filter-row"><button>Saved</button><button>Downloaded</button><button>Recent</button></div><MiniCardGrid/><MiniCardGrid/></div>}
export function ProfilePage(){return <div className="content-page"><PageHeader eyebrow="Account" title="Profile settings." copy="Manage personal information, subscription, and security."/><div className="two-column"><Panel title="Personal details"><FormFields/><button className="button">Save changes</button></Panel><Panel title="Membership"><Stat label="Current plan" value="Monthly" note="$8.99 / month"/><Link className="secondary-button inline" to="/change-password">Change password</Link></Panel></div></div>}
export function ForumPage(){return <div className="content-page"><PageHeader eyebrow="Community" title="Forum." copy="Share reflections and connect through meaningful words." action={<Link className="button" to="/forum/new">Add Post</Link>}/><PostList/></div>}
export function AddForumPostPage(){return <div className="content-page narrow-page"><PageHeader eyebrow="Community" title="Create a post."/><Panel><label className="field">Title<input placeholder="Post title"/></label><label className="field">Your post<textarea rows={10}/></label><button className="button">Publish post</button></Panel></div>}
export function ForumPostPage(){return <div className="content-page narrow-page"><PageHeader eyebrow="Community post" title="The words we keep returning to." copy="Posted by Maya · 2 hours ago"/><Panel><p className="article-copy">Some poems stay with us because they arrive at exactly the right moment. This thread is a place to share those lines and the memories attached to them.</p></Panel><Panel title="Replies"><PostList compact/></Panel></div>}
function PostList({compact=false}:{compact?:boolean}){return <div className="post-list">{['The words we keep returning to','A card that changed an ordinary day','Poetry for difficult conversations'].slice(0,compact?2:3).map((x,i)=><Link to="/forum/post/1" className="post-row" key={x}><div className="avatar">{['M','A','J'][i]}</div><div><h3>{x}</h3><p>Thoughtful reflections from the Verse & Feeling community.</p></div><span>{12-i*3} replies</span></Link>)}</div>}
export function PoetryRequestsPage(){return <div className="content-page"><PageHeader eyebrow="Custom poetry" title="Your poetry requests." copy="Track submitted requests and their current status." action={<Link className="button" to="/poetry-requests/new">New Request</Link>}/><RequestTable/></div>}
export function AddPoetryRequestPage(){
  const occasions=['Anniversary','Happy Birthday','Love',"Mother's Day","Father's Day",'Everyday','Apology','Anchored in Grace','Christmas']
  const suggestions=['ROMANTIC','TENDER','JOYFUL','REFLECTIVE','GRATEFUL','COMFORTING','CELEBRATORY']
  const [occasion,setOccasion]=useState('Anniversary')
  const [tone,setTone]=useState('')
  const [recipientName,setRecipientName]=useState('')
  const [relationship,setRelationship]=useState('')
  const [description,setDescription]=useState('')
  const [checking,setChecking]=useState(true)
  const [submitting,setSubmitting]=useState(false)
  const [error,setError]=useState('')
  const navigate=useNavigate()

  useEffect(()=>{
    let alive=true
    getProfile().then(profile=>{
      const active=profile.subscription?.status==='ACTIVE' && (!profile.subscription.currentPeriodEnd || new Date(profile.subscription.currentPeriodEnd)>new Date())
      if(!active) navigate('/library?tab=requests',{replace:true})
    }).catch(()=>navigate('/library?tab=requests',{replace:true})).finally(()=>{if(alive)setChecking(false)})
    return()=>{alive=false}
  },[navigate])

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError('')
    if(!recipientName.trim()||!relationship.trim()||!description.trim()||!tone.trim()){setError('Please complete all fields before submitting.');return}
    setSubmitting(true)
    try{
      await createPoetryRequest({occasion,recipientName:recipientName.trim(),relationship:relationship.trim(),description:description.trim(),tone:tone.trim()})
      navigate('/library?tab=requests',{replace:true})
    }catch(err){ setError(err instanceof Error?err.message:'Unable to submit your poetry request.'); setSubmitting(false) }
  }

  if(checking)return <main className="flex flex-1 items-center justify-center bg-[#f7f3ed] text-muted">Checking your subscription…</main>

  return <main className="flex flex-1 flex-col">
    <div className="bg-[#f7f3ed]">
      <section className="mx-auto w-full max-w-[900px] px-6 pb-10 pt-14 max-[760px]:pt-10">
        <div className="mx-auto w-full pb-2">
          <Link className="mb-4 inline-flex cursor-pointer items-center gap-2.5 text-[15px] text-[#5a5148] transition hover:text-forest" to="/library?tab=requests">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Back to Requests
          </Link>
        </div>
        <h1 className="m-0 font-serif text-[clamp(2.55rem,5vw,4rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-[#2f2a25]">A poem, written just for you</h1>
        <p className="mt-4 max-w-[560px] text-[1rem] leading-7 text-[#776d62]">Tell us your story, and we will turn it into something timeless.</p>
      </section>

      <form onSubmit={submit} className="mx-auto grid w-full max-w-[900px] gap-12 px-6 pb-16">
        <section className="grid gap-4">
          <div><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#2f2a25]">What is this for?</h2></div>
          <div className="flex flex-wrap gap-2.5">
            {occasions.map(item=><button key={item} type="button" onClick={()=>setOccasion(item)} className={`min-h-11 rounded-full border px-4 text-[0.92rem] font-semibold transition ${occasion===item?'border-[#17392f] bg-[#17392f] text-[#f7f4ef] shadow-[0_10px_22px_rgba(23,57,47,0.12)]':'border-[rgba(57,47,39,0.12)] bg-[#f9f5ef] text-[#5f554b] hover:-translate-y-px hover:border-[rgba(23,57,47,0.26)] hover:text-[#17392f]'}`}>{item}</button>)}
          </div>
        </section>

        <section className="grid gap-4">
          <div><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#2f2a25]">About the person</h2></div>
          <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
            <input id="name" value={recipientName} onChange={e=>setRecipientName(e.target.value)} className="min-h-[50px] w-full rounded-[10px] border border-forest/15 bg-white px-4 text-base text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="Name" name="recipientName"/>
            <input id="relationship" value={relationship} onChange={e=>setRelationship(e.target.value)} className="min-h-[50px] w-full rounded-[10px] border border-forest/15 bg-white px-4 text-base text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="Relationship" name="relationship"/>
          </div>
        </section>

        <section className="grid gap-4"><div><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#2f2a25]">Tell us what you feel</h2><p className="mt-2 text-[0.94rem] leading-6 text-[#776d62]">Write freely. Even a few words are enough.</p></div><textarea id="share-your-story" value={description} onChange={e=>setDescription(e.target.value)} className="min-h-[160px] w-full resize-y rounded-[12px] border border-forest/15 bg-white px-4 py-3 text-base leading-7 text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="Share your story, memory, or feeling..." name="description"/></section>

        <section className="grid gap-4"><div><h2 className="m-0 font-serif text-[2rem] font-semibold leading-none tracking-[-0.02em] text-[#2f2a25]">Tone of the poem</h2><p className="mt-2 text-[0.94rem] leading-6 text-[#776d62]">Describe the tone you want, like soft, romantic, reflective, or heartfelt.</p></div><div className="grid gap-3"><input id="tone" value={tone} onChange={e=>setTone(e.target.value)} className="min-h-[50px] w-full rounded-[10px] border border-forest/15 bg-white px-4 text-base text-charcoal outline-none transition placeholder:text-charcoal/35 focus:border-forest/45 focus:ring-4 focus:ring-forest/10" placeholder="Enter the tone of the poem" name="tone"/><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#8a7d70]">Suggestions:</span>{suggestions.map(item=><button key={item} type="button" onClick={()=>setTone(item.charAt(0)+item.slice(1).toLowerCase())} className="inline-flex min-h-9 items-center rounded-full border border-[rgba(57,47,39,0.12)] bg-[#f9f4ee] px-3 text-[0.78rem] font-bold text-[#17392f] transition hover:-translate-y-px hover:bg-[#fffaf4] focus:outline-none focus:ring-2 focus:ring-forest/25">{item}</button>)}</div></div></section>

        <div className="grid gap-4"><div>{error&&<p className="mb-3 text-sm font-medium text-red-700">{error}</p>}<button type="submit" disabled={submitting} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-forest px-7 text-[0.95rem] font-bold text-ivory transition hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-60"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>{submitting?'Submitting…':'Request Your Poem'}</button><p className="mt-3 text-[0.86rem] leading-6 text-[#776d62]">Your request will be saved to your poetry request history.</p></div></div>
      </form>
    </div>
  </main>
}
export function PoetryRequestDetailPage(){return <div className="content-page"><PageHeader eyebrow="Request #PR-1042" title="Anniversary poem." copy="Submitted 28 April · In progress"/><div className="two-column"><Panel title="Request details"><p className="article-copy">A warm anniversary poem for a couple celebrating twenty years together.</p></Panel><Panel title="Status"><div className="timeline"><span className="done">Submitted</span><span className="active">In progress</span><span>Review</span><span>Complete</span></div></Panel></div></div>}
function RequestTable(){return <div className="data-table">{[['PR-1042','Anniversary','In progress'],['PR-1038','Birthday','Completed'],['PR-1029','Love','Review']].map(r=><Link to="/poetry-requests/1" className="data-row" key={r[0]}><strong>{r[0]}</strong><span>{r[1]}</span><span className="status-pill">{r[2]}</span><span>View →</span></Link>)}</div>}
export function OrdersPage(){return <div className="content-page"><PageHeader eyebrow="Purchases" title="My orders." copy="View printed-card orders and delivery progress."/><div className="data-table">{[['VF-2091','A Year More You','$16.00','Shipped'],['VF-2074','Still Choosing You','$12.00','Delivered']].map(r=><Link to="/orders/1" className="data-row" key={r[0]}>{r.map(x=><span key={x}>{x}</span>)}<span>View →</span></Link>)}</div></div>}
export function OrderDetailPage(){return <div className="content-page"><PageHeader eyebrow="Order VF-2091" title="Order details." copy="Placed 2 May · Estimated arrival 9 May"/><div className="two-column"><Panel title="Delivery"><div className="timeline"><span className="done">Order placed</span><span className="done">Printed</span><span className="active">Shipped</span><span>Delivered</span></div></Panel><Panel title="Summary"><div className="summary-list"><span>Card <strong>$12.00</strong></span><span>Shipping <strong>$4.00</strong></span><span>Total <strong>$16.00</strong></span></div></Panel></div></div>}
