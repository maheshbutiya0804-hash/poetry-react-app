import { FormEvent, useEffect, useMemo, useState } from 'react'
import { AdminHero, AdminPagination, Panel, StatCard } from '../components/AdminLayout'
import {
  adminCreateCollection,
  adminDeleteCollection,
  adminGetCollections,
  adminUpdateCollection,
  type AdminCollection,
} from '../../services/api'

const emptyForm = { name:'', slug:'', description:'', isActive:true, sortOrder:0 }
const slugify = (value:string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

function PencilIcon(){return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>}
function TrashIcon(){return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>}
function PlusIcon(){return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14"/><path d="M5 12h14"/></svg>}

export function CollectionsPage(){
  const [items,setItems] = useState<AdminCollection[]>([])
  const [query,setQuery] = useState('')
  const [page,setPage] = useState(1)
  const [editing,setEditing] = useState<AdminCollection|null>(null)
  const [form,setForm] = useState(emptyForm)
  const [editorOpen,setEditorOpen] = useState(false)
  const [deleteTarget,setDeleteTarget] = useState<AdminCollection|null>(null)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')

  const refresh = async()=>{
    setError('')
    try { setItems(await adminGetCollections()) }
    catch(e){ setError(e instanceof Error ? e.message : 'Unable to load collections.') }
  }
  useEffect(()=>{ void refresh() },[])

  const filtered = useMemo(()=>items.filter(i=>`${i.name} ${i.slug} ${i.description??''}`.toLowerCase().includes(query.toLowerCase())),[items,query])
  const pageSize = 10
  const totalPages = Math.max(1,Math.ceil(filtered.length/pageSize))
  const paged = filtered.slice((page-1)*pageSize,page*pageSize)
  useEffect(()=>setPage(1),[query])
  useEffect(()=>{ if(page>totalPages)setPage(totalPages) },[page,totalPages])

  function openCreate(){
    setEditing(null); setForm(emptyForm); setError(''); setEditorOpen(true)
  }
  function openEdit(item:AdminCollection){
    setEditing(item)
    setForm({name:item.name,slug:item.slug,description:item.description??'',isActive:item.isActive,sortOrder:item.sortOrder})
    setError(''); setEditorOpen(true)
  }
  function closeEditor(){ if(busy)return; setEditorOpen(false); setEditing(null); setForm(emptyForm); setError('') }

  async function submit(e:FormEvent){
    e.preventDefault(); setBusy(true); setError('')
    try{
      const payload={...form,slug:form.slug.trim()||slugify(form.name)}
      if(editing) await adminUpdateCollection(editing.id,payload)
      else await adminCreateCollection(payload)
      setEditorOpen(false); setEditing(null); setForm(emptyForm)
      await refresh()
    }catch(e){setError(e instanceof Error?e.message:'Unable to save collection.')}
    finally{setBusy(false)}
  }

  async function confirmDelete(){
    if(!deleteTarget)return
    setBusy(true); setError('')
    try{
      await adminDeleteCollection(deleteTarget.id)
      setDeleteTarget(null)
      await refresh()
    }catch(e){
      setError(e instanceof Error?e.message:'Unable to delete collection.')
      setDeleteTarget(null)
    }finally{setBusy(false)}
  }

  return <>
    <AdminHero
      eyebrow="ADMIN COLLECTIONS"
      title="Collections"
      copy="Create and manage the browsing groups used across the Laurentine card library."
      action={<button type="button" className="hs-btn hs-collection-add" onClick={openCreate}><PlusIcon/> Add Collection</button>}
    />

    <div className="hs-stats four">
      <StatCard label="TOTAL COLLECTIONS" value={items.length} note="All saved collection records."/>
      <StatCard label="ACTIVE" value={items.filter(i=>i.isActive).length} note="Visible in browsing and card creation."/>
      <StatCard label="INACTIVE" value={items.filter(i=>!i.isActive).length} note="Hidden from new selection."/>
      <StatCard accent label="CARDS" value={items.reduce((n,i)=>n+(i.cardCount??0),0)} note="Assigned across collections."/>
    </div>

    <Panel className="hs-collections-panel">
      <div className="hs-panel-head hs-collections-head"><div><span className="hs-eyebrow">COLLECTIONS LIBRARY</span><h2>Collections Management</h2><p>Search, edit, reorder, activate, or remove the collections used throughout Laurentine.</p></div><button type="button" className="hs-outline hs-collection-secondary-add" onClick={openCreate}><PlusIcon/> Add Collection</button></div>
      <div className="hs-filter"><div className="hs-search">⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search collections..."/></div></div>
      {error&&<div className="hs-error">{error}</div>}
      <div className="hs-table hs-taxonomy-table hs-collections-table">
        <div className="hs-tr head"><span>NAME</span><span>SLUG</span><span>CARDS</span><span>STATUS</span><span>ORDER</span><span>ACTIONS</span></div>
        {paged.map(item=><div className="hs-tr" key={item.id}>
          <span><b>{item.name}</b><small>{item.description||'No collection description'}</small></span>
          <span>{item.slug}</span>
          <span>{item.cardCount??0}</span>
          <span><em className={`hs-pill ${item.isActive?'green':''}`}>● {item.isActive?'Active':'Inactive'}</em></span>
          <span>{item.sortOrder}</span>
          <span className="hs-row-actions hs-collection-actions">
            <button type="button" onClick={()=>openEdit(item)} aria-label={`Edit ${item.name}`} title="Edit collection"><PencilIcon/></button>
            <button type="button" onClick={()=>setDeleteTarget(item)} aria-label={`Delete ${item.name}`} title="Delete collection" className="danger"><TrashIcon/></button>
          </span>
        </div>)}
        {!filtered.length&&<div className="hs-empty">No collections found.</div>}
      </div>
      <AdminPagination page={page} pageSize={pageSize} total={filtered.length} totalPages={totalPages} onPageChange={setPage}/>
    </Panel>

    {editorOpen&&<div className="hs-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)closeEditor()}}>
      <section className="hs-modal hs-collection-modal" role="dialog" aria-modal="true" aria-labelledby="collection-modal-title">
        <div className="hs-modal-head"><div><span className="hs-eyebrow">{editing?'EDIT COLLECTION':'NEW COLLECTION'}</span><h2 id="collection-modal-title">{editing?'Edit Collection':'Add Collection'}</h2><p>{editing?'Update the collection details below.':'Create a new browsing collection for Laurentine cards.'}</p></div><button type="button" className="hs-modal-close" onClick={closeEditor} aria-label="Close">×</button></div>
        <form className="hs-taxonomy-form hs-modal-form" onSubmit={submit}>
          <label>Name<input required autoFocus value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value,slug:editing?v.slug:slugify(e.target.value)}))}/></label>
          <label>Slug<input required value={form.slug} onChange={e=>setForm(v=>({...v,slug:slugify(e.target.value)}))}/></label>
          <label>Description<textarea rows={4} value={form.description??''} onChange={e=>setForm(v=>({...v,description:e.target.value}))}/></label>
          <label>Sort Order<input type="number" min="0" value={form.sortOrder} onChange={e=>setForm(v=>({...v,sortOrder:Number(e.target.value)}))}/></label>
          <label className="hs-taxonomy-check"><input type="checkbox" checked={form.isActive} onChange={e=>setForm(v=>({...v,isActive:e.target.checked}))}/><span>Active and available throughout the card library</span></label>
          {error&&<div className="hs-error">{error}</div>}
          <div className="hs-form-actions hs-modal-actions"><button type="button" className="hs-outline" onClick={closeEditor} disabled={busy}>Cancel</button><button className="hs-btn" disabled={busy}>{busy?'Saving…':editing?'Save Changes':'Add Collection'}</button></div>
        </form>
      </section>
    </div>}

    {deleteTarget&&<div className="hs-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setDeleteTarget(null)}}>
      <section className="hs-modal hs-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-collection-title">
        <div className="hs-confirm-icon"><TrashIcon/></div>
        <span className="hs-eyebrow">DELETE COLLECTION</span>
        <h2 id="delete-collection-title">Delete “{deleteTarget.name}”?</h2>
        <p>This action cannot be undone. {deleteTarget.cardCount?`This collection currently has ${deleteTarget.cardCount} card${deleteTarget.cardCount===1?'':'s'} assigned to it.`:'No cards are currently assigned to this collection.'}</p>
        <div className="hs-confirm-note">If cards are still assigned, the server may prevent deletion until they are moved to another collection.</div>
        <div className="hs-form-actions hs-confirm-actions"><button type="button" className="hs-outline" onClick={()=>setDeleteTarget(null)} disabled={busy}>Cancel</button><button type="button" className="hs-danger-btn" onClick={confirmDelete} disabled={busy}>{busy?'Deleting…':'Delete Collection'}</button></div>
      </section>
    </div>}
  </>
}
