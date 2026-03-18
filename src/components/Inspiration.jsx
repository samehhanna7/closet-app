import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './Inspiration.module.css'

const OCCASIONS = ['Casual', 'Work', 'Formal', 'Date Night', 'Seasonal']

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const OCCASION_COLORS = {
  Casual:      { bg: '#FEF3C7', text: '#B45309' },
  Work:        { bg: '#DBEAFE', text: '#1D4ED8' },
  Formal:      { bg: '#EDE9FE', text: '#6D28D9' },
  'Date Night':{ bg: '#FCE7F3', text: '#9D174D' },
  Seasonal:    { bg: '#D1FAE5', text: '#065F46' },
}

function OccasionTag({ occasion }) {
  const colors = OCCASION_COLORS[occasion] || { bg: 'var(--accent-light)', text: 'var(--accent)' }
  return (
    <span style={{
      display: 'inline-block',
      background: colors.bg,
      color: colors.text,
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '20px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {occasion}
    </span>
  )
}

// ── Shared delete-confirmation overlay ───────────────────────────────
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(13,13,13,0.6)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '28px 28px 24px',
        maxWidth: 300, width: '88%', textAlign: 'center',
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
      }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: '#0D0D0D', marginBottom: 6 }}>Delete this item?</p>
        <p style={{ fontSize: 14, color: '#888888', marginBottom: 24 }}>This cannot be undone.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px 0', borderRadius: 100,
            background: '#F5F0E8', color: '#0D0D0D', fontWeight: 700, fontSize: 14,
            border: '1.5px solid #E8E3DC', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px 0', borderRadius: 100,
            background: '#F97316', color: '#0D0D0D', fontWeight: 700, fontSize: 14,
            border: 'none', cursor: 'pointer',
          }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────
function InspirationCard({ item, onDelete, onEdit }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        <img src={item.photo} alt={item.occasion} />
        {/* Edit button */}
        <button
          className={styles.deleteBtn}
          style={{ right: 44 }}
          onClick={(e) => { e.stopPropagation(); onEdit(item) }}
          title="Edit"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
        {/* Delete button */}
        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
          title="Remove"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className={styles.cardFooter}>
        <OccasionTag occasion={item.occasion} />
      </div>
    </div>
  )
}

// ── Add / Edit form ───────────────────────────────────────────────────
function AddInspirationForm({ onSave, onClose, initialValues = null }) {
  const [photo,        setPhoto]        = useState(initialValues?.photo   || null)
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photo   || null)
  const [occasion,     setOccasion]     = useState(initialValues?.occasion || '')
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Image must be under 8MB' })); return }
    setErrors(prev => { const er = { ...prev }; delete er.photo; return er })
    const b64 = await fileToBase64(file)
    setPhoto(b64)
    setPhotoPreview(b64)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!photo)    newErrors.photo   = 'Please upload an image'
    if (!occasion) newErrors.occasion = 'Please select an occasion'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setLoading(true)
    const item = initialValues
      ? { ...initialValues, photo, occasion }
      : { id: uuidv4(), photo, occasion, addedAt: Date.now() }
    onSave(item)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Photo upload */}
      <div className={styles.uploadArea} onClick={() => document.getElementById('inspo-photo').click()}>
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className={styles.uploadPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Upload inspiration screenshot</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>JPG, PNG, WEBP up to 8MB</span>
          </div>
        )}
        <input id="inspo-photo" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
      </div>
      {photoPreview && (
        <button
          type="button"
          onClick={() => document.getElementById('inspo-photo').click()}
          style={{ background: 'none', border: 'none', color: '#888888', fontSize: 13, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
        >
          Change photo
        </button>
      )}
      {errors.photo && <p style={{ color: '#EF4444', fontSize: 13 }}>{errors.photo}</p>}

      {/* Occasion selector */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Occasion *</label>
        <div className={styles.occasionGrid}>
          {OCCASIONS.map(occ => (
            <button
              key={occ}
              type="button"
              className={`${styles.occasionBtn} ${occasion === occ ? styles.occasionActive : ''}`}
              onClick={() => { setOccasion(occ); setErrors(prev => { const er = { ...prev }; delete er.occasion; return er }) }}
            >
              {occ}
            </button>
          ))}
        </div>
        {errors.occasion && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.occasion}</p>}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Saving...' : (initialValues ? 'Save Changes' : 'Save Inspiration')}
        </button>
      </div>
    </form>
  )
}

// ── Section ───────────────────────────────────────────────────────────
export default function Inspiration({ inspirations, setInspirations }) {
  const [showAdd,      setShowAdd]      = useState(false)
  const [editItem,     setEditItem]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')

  const handleSave = (item) => {
    if (editItem) {
      setInspirations(prev => prev.map(i => i.id === item.id ? item : i))
      setEditItem(null)
    } else {
      setInspirations(prev => [item, ...prev])
      setShowAdd(false)
    }
  }

  const handleDeleteConfirm = () => {
    setInspirations(prev => prev.filter(i => i.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const handleModalClose = () => { setShowAdd(false); setEditItem(null) }

  const filtered = activeFilter === 'All' ? inspirations : inspirations.filter(i => i.occasion === activeFilter)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inspiration</h1>
          <p className={styles.subtitle}>{inspirations.length} saved {inspirations.length === 1 ? 'look' : 'looks'}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Look
        </button>
      </div>

      <div className={styles.filterBar}>
        {['All', ...OCCASIONS].map(occ => (
          <button
            key={occ}
            className={`${styles.filterChip} ${activeFilter === occ ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter(occ)}
          >
            {occ}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>{activeFilter === 'All' ? 'No inspiration yet' : `No ${activeFilter} looks`}</p>
          <p className={styles.emptyText}>Save outfit screenshots and photos that inspire you.</p>
          {activeFilter === 'All' && (
            <button className={styles.addBtn} onClick={() => setShowAdd(true)} style={{ marginTop: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add First Look
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => (
            <InspirationCard
              key={item.id}
              item={item}
              onDelete={setDeleteTarget}
              onEdit={setEditItem}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {(showAdd || editItem) && (
        <Modal title={editItem ? 'Edit Inspiration' : 'Add Inspiration'} onClose={handleModalClose}>
          <AddInspirationForm onSave={handleSave} onClose={handleModalClose} initialValues={editItem} />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirm
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
