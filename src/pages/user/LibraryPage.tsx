import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LoveNoteCard } from '../../components/love-notes/LoveNoteCard'
import { cardPdfUrl, getLibrary, setLibraryCardUsed, type SavedLibraryCard } from '../../services/api'

export function LibraryPage(){
  const [items,setItems]=useState<SavedLibraryCard[]>([]),[search,setSearch]=useState(''),[filter,setFilter]=useState<'ALL'|'USED'|'NOT_USED'>('ALL'),[loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>{getLibrary().then(setItems).catch(e=>setError(e instanceof Error?e.message:'Unable to load library')).finally(()=>setLoading(false))},[])
  const visible=useMemo(()=>items.filter(x=>{
    if(filter==='USED'&&!x.usedAt)return false;if(filter==='NOT_USED'&&x.usedAt)return false
    return !search||x.card.title.toLowerCase().includes(search.toLowerCase())
  }),[items,search,filter])
  async function toggleUsed(item:SavedLibraryCard){await setLibraryCardUsed(item.card.id,!item.usedAt);setItems(v=>v.map(x=>x.id===item.id?{...x,usedAt:x.usedAt?null:new Date().toISOString()}:x))}
  return <main className="library-page"><section className="library-hero"><h1>Your Library</h1><p>Cards you've saved to return to, share, or send — all in one calm place.</p></section>
    <section className="library-panel"><div className="library-toolbar"><label>⌕ <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your saved cards..."/></label><div>{(['ALL','USED','NOT_USED'] as const).map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x==='NOT_USED'?'Not Used':x[0]+x.slice(1).toLowerCase()}</button>)}</div></div>
      {loading?<div className="library-empty">Loading your library…</div>:error?<div className="library-empty">{error}</div>:!visible.length?<div className="library-empty">No saved cards found.</div>:<div className="library-grid">{visible.map(item=><article key={item.id} className="library-item"><Link to={`/cards/${item.card.id}`}><LoveNoteCard card={item.card}/></Link><h3>{item.card.title}</h3><div className="library-actions"><a href={cardPdfUrl(item.card.id)} target="_blank" rel="noreferrer" title="View full PDF">◉</a><a href={cardPdfUrl(item.card.id,true)} title="Download PDF">⇩</a><button onClick={()=>toggleUsed(item)}>{item.usedAt?'Used':'Mark Used'}</button></div></article>)}</div>}
    </section></main>
}
