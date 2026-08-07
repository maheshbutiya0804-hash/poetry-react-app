import { useState } from 'react'
import { loveNoteCollections } from '../../data/loveNotes'

export function LoveNoteAdminPage() {
  const [fileName, setFileName] = useState('')
  return <main className="admin-simple-page"><p className="hs-kicker">Content Management</p><h1>Love Note Products</h1><p>Client-supplied Canva designs should be uploaded like products. The app stores the design asset plus metadata/overlay settings; it does not recreate the approved artwork.</p><section className="upload-product-panel"><label>Collection<select>{loveNoteCollections.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><label>Product title<input placeholder="Approved Love Note title"/></label><label>Approved design image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setFileName(e.target.files?.[0]?.name ?? '')}/><small>{fileName || 'Upload a high-resolution client-approved design.'}</small></label><label>Default message<textarea rows={5} placeholder="Optional dynamic text"/></label><button className="button" type="button">Save product</button></section></main>
}
