import { FormEvent, useEffect, useState } from 'react'
import type { LoveNoteCollection } from '../../types/loveNote'
import { adminCreateCard, getCollections } from '../../services/api'

export function LoveNoteAdminPage() {
  const [collections, setCollections] = useState<LoveNoteCollection[]>([])
  const [collectionId, setCollectionId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pdf, setPdf] = useState<File | null>(null)
  const [preview, setPreview] = useState<File | null>(null)
  const [published, setPublished] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getCollections()
      .then(items => {
        setCollections(items)
        setCollectionId(items[0]?.id ?? '')
      })
      .catch(() => setStatus('Could not load collections. Is the API running on port 4000?'))
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!pdf) return setStatus('Choose the client-approved PDF first.')

    const data = new FormData()
    data.append('collectionId', collectionId)
    data.append('title', title)
    data.append('description', description)
    data.append('published', String(published))
    data.append('pdf', pdf)
    if (preview) data.append('preview', preview)

    try {
      setBusy(true)
      setStatus('Validating and uploading…')
      const card = await adminCreateCard(data)
      setStatus(`Saved ${card.title}. ${card.published ? 'It is live.' : 'It is still a draft.'}`)
      setTitle('')
      setDescription('')
      setPdf(null)
      setPreview(null)
      setPublished(false)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-simple-page">
      <p className="hs-kicker">Content Management</p>
      <h1>Love Note Products</h1>
      <p>
        Upload the client-approved card as a product. The backend rejects files that are not exactly one-page, 7 × 5 inch landscape PDFs.
      </p>

      <form className="upload-product-panel" onSubmit={submit}>
        <label>
          Collection
          <select value={collectionId} onChange={e => setCollectionId(e.target.value)} required>
            {collections.map(collection => <option value={collection.id} key={collection.id}>{collection.name}</option>)}
          </select>
        </label>
        <label>
          Product title
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Approved Love Note title" required minLength={2} />
        </label>
        <label>
          Master card PDF
          <input type="file" accept="application/pdf" onChange={e => setPdf(e.target.files?.[0] ?? null)} required />
          <small>{pdf?.name ?? 'Required: one page, 7 × 5 inches, landscape.'}</small>
        </label>
        <label>
          Catalog preview image
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setPreview(e.target.files?.[0] ?? null)} />
          <small>Optional for now. PNG/WebP is recommended for fast catalog previews.</small>
        </label>
        <label>
          Catalog description
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Short product description" />
        </label>
        <label className="admin-checkbox-row">
          <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
          Publish immediately
        </label>
        <button className="button" type="submit" disabled={busy}>{busy ? 'Uploading…' : 'Save product'}</button>
        {status && <p className="admin-upload-status" role="status">{status}</p>}
      </form>
    </main>
  )
}
