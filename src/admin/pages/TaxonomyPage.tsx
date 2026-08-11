import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { TaxonomyItem } from '../../services/api'
import { AdminHero, Panel, StatCard } from '../components/AdminLayout'

type Props = {
  kind: 'Collection' | 'Category'
  load: () => Promise<TaxonomyItem[]>
  create: (input: Omit<TaxonomyItem,'id'|'cardCount'>) => Promise<TaxonomyItem>
  update: (id:string,input: Omit<TaxonomyItem,'id'|'cardCount'>) => Promise<TaxonomyItem>
  remove: (id:string) => Promise<void>
}

const empty={name:'',slug:'',description:'',isActive:true,sortOrder:0}
const slugify=(value:string)=>value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

export function TaxonomyPage({kind,load,create,update,remove}:Props){
  const [items,setItems]=useState<TaxonomyItem[]>([])
  const [query,setQuery]=useState('')
  const [editing,setEditing]=useState<TaxonomyItem|null>(null)
  const [form,setForm]=useState(empty)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')
  const plural=`${kind}s`
  const refresh=()=>{setError('');return load().then(setItems).catch(e=>setError(e.message))}
  useEffect(()=>{void refresh()},[])
  const filtered=useMemo(()=>items.filter(i=>`${i.name} ${i.slug} ${i.description??''}`.toLowerCase().includes(query.toLowerCase())),[items,query])
  function startEdit(item:TaxonomyItem){setEditing(item);setForm({name:item.name,slug:item.slug,description:item.description??'',isActive:item.isActive,sortOrder:item.sortOrder});window.scrollTo({top:0,behavior:'smooth'})}
  function reset(){setEditing(null);setForm(empty);setError('')}
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const payload={...form,slug:form.slug.trim()||slugify(form.name)};if(editing)await update(editing.id,payload);else await create(payload);reset();await refresh()}catch(e){setError(e instanceof Error?e.message:`Unable to save ${kind.toLowerCase()}.`)}finally{setBusy(false)}}
  async function del(item:TaxonomyItem){if(!confirm(`Delete “${item.name}”?`))return;try{await remove(item.id);await refresh()}catch(e){setError(e instanceof Error?e.message:`Unable to delete ${kind.toLowerCase()}.`)}}
  return <><AdminHero eyebrow={`ADMIN ${plural.toUpperCase()}`} title={plural} copy={`Create and manage the ${kind.toLowerCase()} values available when editors create cards.`}/>
    <div className="hs-taxonomy-grid">
      <Panel><span className="hs-eyebrow">{editing?'EDIT':'CREATE'} {kind.toUpperCase()}</span><h2>{editing?`Edit ${kind}`:`Add ${kind}`}</h2><p>{kind==='Collection'?'Collections are the broad browsing groups used across the Love Notes library.':'Categories describe the occasion or editorial type of a card.'}</p>
        <form className="hs-taxonomy-form" onSubmit={submit}>
          <label>Name<input required value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value,slug:editing?v.slug:slugify(e.target.value)}))}/></label>
          <label>Slug<input required value={form.slug} onChange={e=>setForm(v=>({...v,slug:slugify(e.target.value)}))}/></label>
          <label>Description<textarea rows={4} value={form.description??''} onChange={e=>setForm(v=>({...v,description:e.target.value}))}/></label>
          <label>Sort Order<input type="number" min="0" value={form.sortOrder} onChange={e=>setForm(v=>({...v,sortOrder:Number(e.target.value)}))}/></label>
          <label className="hs-taxonomy-check"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(v=>({...v,isActive:e.target.checked}))}/><span>Active and available in Create Card</span></label>
          {error&&<div className="hs-error">{error}</div>}
          <div className="hs-form-actions">{editing&&<button type="button" className="hs-outline" onClick={reset}>Cancel</button>}<button className="hs-btn" disabled={busy}>{busy?'Saving…':editing?'Update':'Add'}</button></div>
        </form>
      </Panel>
      <div><div className="hs-stats four"><StatCard label={`TOTAL ${plural.toUpperCase()}`} value={items.length} note="All saved records."/><StatCard label="ACTIVE" value={items.filter(i=>i.isActive).length} note="Available in card editor."/><StatCard label="INACTIVE" value={items.filter(i=>!i.isActive).length} note="Hidden from new selection."/><StatCard accent label="CARDS" value={items.reduce((n,i)=>n+(i.cardCount??0),0)} note={`Assigned across ${plural.toLowerCase()}.`}/></div>
      <Panel><div className="hs-panel-head"><div><span className="hs-eyebrow">{plural.toUpperCase()} LIBRARY</span><h2>{plural} Management</h2></div></div><div className="hs-filter"><div className="hs-search">⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${plural.toLowerCase()}...`}/></div></div>
        <div className="hs-table hs-taxonomy-table"><div className="hs-tr head"><span>NAME</span><span>SLUG</span><span>CARDS</span><span>STATUS</span><span>ORDER</span><span>ACTIONS</span></div>{filtered.map(item=><div className="hs-tr" key={item.id}><span><b>{item.name}</b><small>{item.description||`No ${kind.toLowerCase()} description`}</small></span><span>{item.slug}</span><span>{item.cardCount??0}</span><span><em className={`hs-pill ${item.isActive?'green':''}`}>● {item.isActive?'Active':'Inactive'}</em></span><span>{item.sortOrder}</span><span className="hs-row-actions"><button onClick={()=>startEdit(item)}>✎</button><button onClick={()=>del(item)}>▱</button></span></div>)}{!filtered.length&&<div className="hs-empty">No {plural.toLowerCase()} found.</div>}</div>
      </Panel></div>
    </div>
  </>
}
