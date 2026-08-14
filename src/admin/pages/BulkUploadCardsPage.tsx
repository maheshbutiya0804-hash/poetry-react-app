import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminHero, Panel } from '../components/AdminLayout'
import { adminGetBulkPdfImport, adminGetCollections, adminStartBulkPdfImport, type AdminCollection, type BulkImportJob } from '../../services/api'

export function BulkUploadCardsPage(){
  const [collections,setCollections]=useState<AdminCollection[]>([])
  const [collectionId,setCollectionId]=useState('')
  const [zip,setZip]=useState<File|null>(null)
  const [publish,setPublish]=useState(false)
  const [job,setJob]=useState<BulkImportJob|null>(null)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  useEffect(()=>{adminGetCollections().then(items=>setCollections(items.filter(i=>i.isActive))).catch(e=>setError(e.message))},[])
  useEffect(()=>{
    if(!job || ['COMPLETE','FAILED'].includes(job.status)) return
    const timer=window.setInterval(()=>adminGetBulkPdfImport(job.id).then(setJob).catch(e=>setError(e.message)),1500)
    return()=>window.clearInterval(timer)
  },[job?.id,job?.status])

  const progress=useMemo(()=>job?.totalFiles ? Math.round((job.processedFiles/job.totalFiles)*100) : 0,[job])
  async function start(){
    if(!collectionId){setError('Choose a collection first.');return}
    if(!zip){setError('Choose a ZIP file containing PDF cards.');return}
    setBusy(true);setError('')
    try{
      const fd=new FormData();fd.set('collectionId',collectionId);fd.set('publish',String(publish));fd.set('zip',zip)
      const started=await adminStartBulkPdfImport(fd)
      setJob(await adminGetBulkPdfImport(started.id))
    }catch(e){setError(e instanceof Error?e.message:'Unable to upload ZIP')}finally{setBusy(false)}
  }

  return <><AdminHero title="Bulk PDF Upload" copy="Upload hundreds of finished PDF cards in one ZIP. Laurentine validates each PDF and creates the cards under the selected collection." action={<Link className="hs-outline" to="/admin/cards">← Back to Cards</Link>}/>
  <Panel>
    <span className="hs-eyebrow">BULK IMPORT</span><h2>Upload a ZIP of PDF cards</h2><p>Choose one collection for this batch. PDF filenames automatically become card titles. Categories are not required.</p>
    <div className="bulk-upload-grid">
      <label>Collection<select value={collectionId} onChange={e=>setCollectionId(e.target.value)} disabled={!!job&&!['COMPLETE','FAILED'].includes(job.status)}><option value="">Select collection</option>{collections.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="bulk-drop"><input type="file" accept=".zip,application/zip" onChange={e=>setZip(e.target.files?.[0]??null)} disabled={busy}/><b>{zip?zip.name:'Choose ZIP file'}</b><span>{zip?`${(zip.size/1024/1024).toFixed(1)} MB`:'ZIP may contain hundreds of PDF files'}</span></label>
      <label className="bulk-publish"><input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)}/><span><b>Publish cards after validation</b><small>Leave off to import everything as drafts first.</small></span></label>
      <button className="hs-btn" disabled={busy||!zip||!collectionId} onClick={start}>{busy?'Uploading…':'Upload & Process ZIP'}</button>
    </div>
    {error&&<div className="hs-error">{error}</div>}
  </Panel>
  {job&&<Panel><span className="hs-eyebrow">IMPORT STATUS</span><h2>{job.originalZipName}</h2>
    <div className="bulk-progress"><div><span style={{width:`${progress}%`}}/></div><b>{job.status} · {progress}%</b></div>
    <div className="bulk-summary"><div><strong>{job.totalFiles}</strong><span>PDFs found</span></div><div><strong>{job.processedFiles}</strong><span>Processed</span></div><div><strong>{job.successCount}</strong><span>Ready</span></div><div><strong>{job.failedCount}</strong><span>Failed</span></div></div>
    {job.errorMessage&&<div className="hs-error">{job.errorMessage}</div>}
    {!!job.items?.length&&<div className="bulk-items"><div className="bulk-item head"><span>FILE</span><span>TITLE</span><span>PAGES</span><span>STATUS</span></div>{job.items.map(item=><div className="bulk-item" key={item.id}><span>{item.originalFilename}</span><span>{item.title}</span><span>{item.pageCount??'—'}</span><span><em className={`hs-pill ${item.status==='READY'?'green':''}`}>{item.status}</em>{item.errorMessage&&<small>{item.errorMessage}</small>}</span></div>)}</div>}
  </Panel>}</>
}
