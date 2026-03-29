import { useRef, useState } from 'react'
import Modal from './Modal'
import styles from './Settings.module.css'

const DB_NAME = 'closet-app-images'
const DB_VERSION = 1
const STORE_NAME = 'photos'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = (e) => resolve(e.target.result)
    request.onerror = (e) => reject(e.target.error)
  })
}

async function getAllPhotos() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const photos = {}
    const keysReq = store.getAllKeys()
    keysReq.onsuccess = (e) => {
      const keys = e.target.result
      if (keys.length === 0) { resolve(photos); return }
      let remaining = keys.length
      keys.forEach(key => {
        const getReq = store.get(key)
        getReq.onsuccess = (ev) => {
          if (ev.target.result) photos[key] = ev.target.result
          if (--remaining === 0) resolve(photos)
        }
        getReq.onerror = (ev) => reject(ev.target.error)
      })
    }
    keysReq.onerror = (e) => reject(e.target.error)
  })
}

async function clearAndWritePhotos(photos) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.clear()
    tx.oncomplete = () => {
      const tx2 = db.transaction(STORE_NAME, 'readwrite')
      const store2 = tx2.objectStore(STORE_NAME)
      Object.entries(photos).forEach(([id, base64]) => store2.put(base64, id))
      tx2.oncomplete = () => resolve()
      tx2.onerror = (e) => reject(e.target.error)
    }
    tx.onerror = (e) => reject(e.target.error)
  })
}

async function buildBackup() {
  const closetItems = JSON.parse(localStorage.getItem('closet-items') || '[]')
  const outfits = JSON.parse(localStorage.getItem('closet-outfits') || '[]')
  const inspirations = JSON.parse(localStorage.getItem('closet-inspirations') || '[]')
  const wishlistItems = JSON.parse(localStorage.getItem('wishlist-items') || '[]')
  const photos = await getAllPhotos()
  const json = JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    data: { closetItems, outfits, inspirations, wishlistItems, photos },
  })
  const date = new Date().toISOString().slice(0, 10)
  return { json, date }
}

export default function Settings({ onClose }) {
  const fileInputRef = useRef(null)
  const [exportLoading, setExportLoading] = useState(null) // null | 'export' | 'share'
  const [exportStatus, setExportStatus] = useState(null)   // null | 'downloaded' | 'fallback' | 'error'
  const [importStatus, setImportStatus] = useState(null)   // null | 'error' | 'confirm' | 'restoring'
  const [importError, setImportError] = useState('')
  const [pendingBackup, setPendingBackup] = useState(null)

  async function handleExport() {
    setExportLoading('export')
    setExportStatus(null)
    try {
      const { json, date } = await buildBackup()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `my-closet-backup-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('downloaded')
      setTimeout(() => setExportStatus(null), 3000)
    } catch {
      setExportStatus('error')
      setTimeout(() => setExportStatus(null), 3000)
    } finally {
      setExportLoading(null)
    }
  }

  async function handleShare() {
    setExportLoading('share')
    setExportStatus(null)
    try {
      const { json, date } = await buildBackup()
      const filename = `my-closet-backup-${date}.json`
      const file = new File([json], filename, { type: 'application/json' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'My Closet Backup', text: 'My Closet app backup', files: [file] })
        // User completed share — no extra message needed
      } else {
        // Fall back to download
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        setExportStatus('fallback')
        setTimeout(() => setExportStatus(null), 4000)
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled share sheet — do nothing
      } else if (err.name === 'NotAllowedError') {
        // Desktop browser blocked share due to async delay — fall back to download
        try {
          const { json: fallbackJson, date: fallbackDate } = await buildBackup()
          const fallbackFilename = `my-closet-backup-${fallbackDate}.json`
          const blob = new Blob([fallbackJson], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fallbackFilename
          a.click()
          URL.revokeObjectURL(url)
          setExportStatus('fallback')
          setTimeout(() => setExportStatus(null), 4000)
        } catch {
          setExportStatus('error')
          setTimeout(() => setExportStatus(null), 3000)
        }
      } else {
        setExportStatus('error')
        setTimeout(() => setExportStatus(null), 3000)
      }
    } finally {
      setExportLoading(null)
    }
  }

  function handleImportClick() {
    setImportStatus(null)
    setImportError('')
    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  function handleFileSelected(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (
          parsed.version !== 1 ||
          !parsed.data ||
          !Array.isArray(parsed.data.closetItems) ||
          !Array.isArray(parsed.data.outfits) ||
          !Array.isArray(parsed.data.inspirations) ||
          !Array.isArray(parsed.data.wishlistItems) ||
          typeof parsed.data.photos !== 'object'
        ) {
          setImportError("This file doesn't look like a My Closet backup.")
          setImportStatus('error')
          return
        }
        setPendingBackup(parsed)
        setImportStatus('confirm')
      } catch {
        setImportError("This file doesn't look like a My Closet backup.")
        setImportStatus('error')
      }
    }
    reader.readAsText(file)
  }

  async function handleConfirmRestore() {
    if (!pendingBackup) return
    setImportStatus('restoring')
    try {
      const { closetItems, outfits, inspirations, wishlistItems, photos } = pendingBackup.data
      localStorage.setItem('closet-items', JSON.stringify(closetItems))
      localStorage.setItem('closet-outfits', JSON.stringify(outfits))
      localStorage.setItem('closet-inspirations', JSON.stringify(inspirations))
      localStorage.setItem('wishlist-items', JSON.stringify(wishlistItems))
      await clearAndWritePhotos(photos)
      window.location.reload()
    } catch {
      setImportError('Something went wrong during restore. Please try again.')
      setImportStatus('error')
    }
  }

  function handleCancelRestore() {
    setImportStatus(null)
    setPendingBackup(null)
  }

  return (
    <Modal title="Settings" onClose={onClose}>
      {/* Export section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Back Up Your Closet</h3>
        <p className={styles.sectionDesc}>
          Download all your data including photos as a single backup file.
        </p>
        <div className={styles.btnRow}>
          <button className={styles.secondaryBtn} onClick={handleExport} disabled={exportLoading !== null}>
            {exportLoading === 'export' ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            Export Backup
          </button>
          <button className={styles.accentBtn} onClick={handleShare} disabled={exportLoading !== null}>
            {exportLoading === 'share' ? (
              <span className={styles.spinnerDark} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            )}
            Share Backup
          </button>
        </div>
        {exportStatus === 'downloaded' && (
          <div className={styles.successMsg}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Backup downloaded!
          </div>
        )}
        {exportStatus === 'fallback' && (
          <div className={styles.successMsg}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Share not available on this browser — file downloaded instead
          </div>
        )}
        {exportStatus === 'error' && (
          <div className={styles.errorMsg}>Export failed. Please try again.</div>
        )}
      </div>

      <div className={styles.divider} />

      {/* Import section */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Restore From Backup</h3>
        <p className={styles.sectionDesc}>
          Import a previously exported backup file. This will replace all your current data.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />

        {importStatus !== 'confirm' && importStatus !== 'restoring' && (
          <button className={styles.secondaryBtn} onClick={handleImportClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Import Backup
          </button>
        )}

        {importStatus === 'error' && (
          <div className={styles.errorMsg}>{importError}</div>
        )}

        {importStatus === 'confirm' && (
          <div className={styles.confirmBox}>
            <p className={styles.confirmText}>
              This will replace all your current closet data. Are you sure?
            </p>
            <div className={styles.confirmBtns}>
              <button className={styles.cancelBtn} onClick={handleCancelRestore}>
                Cancel
              </button>
              <button className={styles.dangerBtn} onClick={handleConfirmRestore}>
                Yes, Restore
              </button>
            </div>
          </div>
        )}

        {importStatus === 'restoring' && (
          <div className={styles.restoringMsg}>
            <span className={styles.spinner} />
            Restoring…
          </div>
        )}
      </div>
    </Modal>
  )
}
