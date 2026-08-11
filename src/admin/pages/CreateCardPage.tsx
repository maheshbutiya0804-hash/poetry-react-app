import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { adminCreateDesignedCard, adminGetCard, adminUpdateDesignedCard, adminGetCategories, adminGetCollections, type AdminCollection, type CardCategory } from '../../services/api'
import { AdminHero, Panel } from '../components/AdminLayout'

type LayoutState = {
  extraHeight: number
  top: number
  bottom: number
  left: number
  right: number
  titleSize: number
  poemSize: number
  alignment: 'left' | 'center' | 'right'
  lineSpacing: 'tight' | 'normal' | 'relaxed'
}

const defaultLayout: LayoutState = {
  extraHeight: 0,
  top: 24,
  bottom: 24,
  left: 24,
  right: 24,
  titleSize: 100,
  poemSize: 100,
  alignment: 'center',
  lineSpacing: 'normal',
}

function normalizeLayout(value: unknown, fallback: LayoutState): LayoutState {
  if(!value || typeof value !== 'object') return fallback
  const raw=value as Partial<LayoutState>
  return { ...fallback, ...raw, alignment: raw.alignment ?? fallback.alignment, lineSpacing: raw.lineSpacing ?? fallback.lineSpacing }
}

function Slider({label,value,min,max,suffix='px',onChange}:{label:string;value:number;min:number;max:number;suffix?:string;onChange:(v:number)=>void}){
  return <label className="card-slider"><span>{label}<b>{value}{suffix}</b></span><input type="range" min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))}/></label>
}

export function CreateCardPage(){
  const nav=useNavigate()
  const {cardId}=useParams()
  const isEdit=Boolean(cardId)
  const [cols,setCols]=useState<AdminCollection[]>([])
  const [collectionId,setCollectionId]=useState('')
  const [categories,setCategories]=useState<CardCategory[]>([])
  const [categoryId,setCategoryId]=useState('')
  const [loadingCard,setLoadingCard]=useState(isEdit)
  const [busy,setBusy]=useState(false)
  const [msg,setMsg]=useState('')
  const [title,setTitle]=useState('Still Choosing You')
  const [poem,setPoem]=useState('When Quiet Still Knows Your Name\n\nI kept a room\ninside my heart\nfor the sound\nof your returning.\nEven silence\nlearned your name,\nand evening opened\nlike remembered light.')
  const [description,setDescription]=useState('A quiet anniversary card')
  const [adminNotes,setAdminNotes]=useState('')
  const [status,setStatus]=useState<'DRAFT'|'PUBLISHED'>('DRAFT')
  const [featured,setFeatured]=useState(false)
  const [viewMode,setViewMode]=useState<'subscriber'|'non-subscriber'>('subscriber')
  const [side,setSide]=useState<'front'|'back'>('front')
  const [front,setFront]=useState<LayoutState>(defaultLayout)
  const [back,setBack]=useState<LayoutState>({...defaultLayout, titleSize: 90, poemSize: 90})

  useEffect(()=>{Promise.all([adminGetCollections(),adminGetCategories()]).then(([collections,categoryItems])=>{setCols(collections);setCategories(categoryItems)}).catch(e=>setMsg(e.message))},[])
  useEffect(()=>{
    if(!cardId) return
    setLoadingCard(true)
    adminGetCard(cardId).then(card=>{
      setCollectionId(card.collectionId)
      setCategoryId(card.categoryId ?? '')
      setTitle(card.title ?? '')
      setDescription(card.excerpt ?? '')
      setPoem(card.poemText ?? '')
      setAdminNotes(card.adminNotes ?? '')
      setStatus(card.published?'PUBLISHED':'DRAFT')
      setFeatured(Boolean(card.isFeatured))
      setFront(normalizeLayout(card.frontLayout, defaultLayout))
      setBack(normalizeLayout(card.backLayout, {...defaultLayout,titleSize:90,poemSize:90}))
    }).catch(e=>setMsg(e.message)).finally(()=>setLoadingCard(false))
  },[cardId])
  const current = side==='front'?front:back
  const setCurrent=(patch:Partial<LayoutState>)=> side==='front'?setFront(v=>({...v,...patch})):setBack(v=>({...v,...patch}))
  const lineHeight = current.lineSpacing==='tight'?1.25:current.lineSpacing==='relaxed'?1.75:1.5
  const previewStyle = useMemo(()=>({
    paddingTop:`${current.top}px`,paddingBottom:`${current.bottom}px`,paddingLeft:`${current.left}px`,paddingRight:`${current.right}px`,
    minHeight:`${500+current.extraHeight}px`,textAlign:current.alignment as any,lineHeight,
  }),[current,lineHeight])

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMsg('')
    try{
      const fd=new FormData(e.currentTarget)
      fd.set('collectionId',collectionId);fd.set('categoryId',categoryId);fd.set('title',title);fd.set('description',description);fd.set('poemText',poem);fd.set('adminNotes',adminNotes)
      fd.set('published',String(status==='PUBLISHED'));fd.set('featured',String(featured))
      fd.set('frontLayout',JSON.stringify(front));fd.set('backLayout',JSON.stringify(back));fd.set('templateKey','botanical-cream')
      if(isEdit && cardId) await adminUpdateDesignedCard(cardId,fd); else await adminCreateDesignedCard(fd);nav('/admin/cards')
    }catch(e){setMsg(e instanceof Error?e.message:'Unable to save card')}finally{setBusy(false)}
  }

  if(loadingCard) return <><AdminHero eyebrow="ADMIN CARDS" title="Edit Card" copy="Loading saved card content and layout…" action={<Link className="hs-outline" to="/admin/cards">← Back to Cards</Link>}/><Panel><div className="hs-empty">Loading card…</div></Panel></>

  return <>
    <AdminHero eyebrow="ADMIN CARDS" title={isEdit?"Edit Card":"Create Card"} copy={isEdit?"Update card content, visibility, and saved design settings.":"Add a new poetry card and adjust how the text appears on the design."} action={<Link className="hs-outline" to="/admin/cards">← Back to Cards</Link>}/>
    <form onSubmit={submit} className="create-card-reference">
      <Panel><h2>Basic Information</h2><p>Set the editorial details that identify the card in the admin system.</p><div className="ref-grid two"><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} required/></label><label>Collection<select name="collectionId" required value={collectionId} onChange={e=>setCollectionId(e.target.value)}><option value="" disabled>Select collection</option>{cols.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Category<select name="categoryId" required value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="" disabled>Select category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="wide">Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4}/></label></div></Panel>
      <Panel><h2>Poem Content</h2><p>Keep the poem text ready for future backend storage.</p><label>Poem Text<textarea className={!poem.trim()?'invalid':''} value={poem} onChange={e=>setPoem(e.target.value)} rows={8} required placeholder="Write the poem lines here"/></label>{!poem.trim()&&<div className="field-error">Poetry text is required.</div>}</Panel>
      <Panel><h2>Status &amp; Visibility</h2><p>Choose the initial card state and mark featured visibility when the card should be available for anonymous discovery.</p><div className="status-choice"><button type="button" className={status==='DRAFT'?'active':''} onClick={()=>setStatus('DRAFT')}><strong>DRAFT</strong><span>Hidden from users while content is still being prepared.</span></button><button type="button" className={status==='PUBLISHED'?'active':''} onClick={()=>setStatus('PUBLISHED')}><strong>PUBLISHED</strong><span>Available in normal browsing flows for eligible users.</span></button></div><label className="feature-row"><span><strong>Featured Card</strong><small>Featured cards are visible to anonymous users and may appear in public discovery areas across the product.</small></span><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/></label></Panel>
      <Panel><h2>Admin Notes</h2><p>Optional notes for internal editorial or review context.</p><label>Notes<textarea value={adminNotes} onChange={e=>setAdminNotes(e.target.value)} rows={5} placeholder="Private notes for future review"/></label></Panel>
      <Panel className="card-design-panel"><div className="panel-heading-row"><div><h2>Card Design</h2><p>Live preview using the selected design and layout values.</p></div><span className="draft-pill">{status}</span></div><div className="design-editor-grid"><div className="design-stage"><div className={`design-card ${side}`} style={previewStyle}><span className="design-from">FROM<br/>Daniel</span>{side==='front'?<><h3 style={{fontSize:`${28*current.titleSize/100}px`}}>{title || 'Untitled Card'}</h3><div className="poem-render" style={{fontSize:`${18*current.poemSize/100}px`}}>{poem}</div>{viewMode==='non-subscriber'&&<div className="protected-overlay"><b>PROTECTED PREVIEW</b><span>This poem is softly protected in preview mode.<br/>Subscribe to view the full card and unlock clean downloads.</span></div>}</>:<><div className="back-message" style={{fontSize:`${20*current.poemSize/100}px`}}>A quiet note for the words that feel too tender to rush.</div><span className="design-to">TO<br/>Sarah</span></>}<div className="botanical-mark">❧</div><div className="heart-rule">──── ♡ ────</div></div></div><div className="design-controls"><span className="control-label">VIEW MODE</span><div className="segmented"><button type="button" className={viewMode==='subscriber'?'active':''} onClick={()=>setViewMode('subscriber')}>Subscriber</button><button type="button" className={viewMode==='non-subscriber'?'active':''} onClick={()=>setViewMode('non-subscriber')}>Non-Subscriber</button></div><div className="segmented"><button type="button" className={side==='front'?'active':''} onClick={()=>setSide('front')}>Adjust Front</button><button type="button" className={side==='back'?'active':''} onClick={()=>setSide('back')}>Adjust Back</button></div><button type="button" className="control-button" onClick={()=>setSide(side==='front'?'back':'front')}>↻ Show {side==='front'?'Back':'Front'}</button><button type="button" className="control-button" onClick={()=>setCurrent(defaultLayout)}>↻ Reset {side==='front'?'Front':'Back'} Layout</button><div className="layout-box"><span className="control-label">TEXT LAYOUT</span><select value="center-classic"><option>Center Classic</option></select><Slider label="GLOBAL CARD EXTRA HEIGHT" value={current.extraHeight} min={0} max={160} onChange={v=>setCurrent({extraHeight:v})}/><div className="slider-pair"><Slider label="PADDING TOP" value={current.top} min={0} max={80} onChange={v=>setCurrent({top:v})}/><Slider label="PADDING BOTTOM" value={current.bottom} min={0} max={80} onChange={v=>setCurrent({bottom:v})}/><Slider label="PADDING LEFT" value={current.left} min={0} max={80} onChange={v=>setCurrent({left:v})}/><Slider label="PADDING RIGHT" value={current.right} min={0} max={80} onChange={v=>setCurrent({right:v})}/></div><Slider label="TITLE SIZE" value={current.titleSize} min={70} max={150} suffix="%" onChange={v=>setCurrent({titleSize:v})}/><Slider label="POEM SIZE" value={current.poemSize} min={70} max={150} suffix="%" onChange={v=>setCurrent({poemSize:v})}/><div className="select-pair"><label>TEXT ALIGNMENT<select value={current.alignment} onChange={e=>setCurrent({alignment:e.target.value as LayoutState['alignment']})}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label><label>LINE SPACING<select value={current.lineSpacing} onChange={e=>setCurrent({lineSpacing:e.target.value as LayoutState['lineSpacing']})}><option value="tight">Tight</option><option value="normal">Normal</option><option value="relaxed">Relaxed</option></select></label></div></div></div></div></Panel>
      {msg&&<div className="hs-error">{msg}</div>}<div className="ref-bottom-actions"><Link className="hs-outline" to="/admin/cards">Cancel</Link><button className="hs-btn" disabled={busy}>{busy?'Saving…':isEdit?'Update Card':'Save Card'}</button></div>
    </form>
  </>
}
