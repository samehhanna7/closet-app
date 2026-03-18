import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import styles from './Wishlist.module.css'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Toast notification ────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 88,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#0D0D0D',
      color: '#F5F0E8',
      padding: '12px 24px',
      borderRadius: 100,
      fontSize: 14,
      fontWeight: 700,
      zIndex: 400,
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
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
function WishlistCard({ item, onDelete, onEdit, onMoveToCloset }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        {item.photo ? (
          <img src={item.photo} alt={item.brand || 'Wishlist item'} />
        ) : (
          <div className={styles.placeholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
        )}

        {/* Move to Closet button (leftmost) */}
        <button
          className={styles.deleteBtn}
          style={{ right: 78, background: 'rgba(249,115,22,0.2)' }}
          onClick={(e) => { e.stopPropagation(); onMoveToCloset(item) }}
          title="Move to Closet"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>

        {/* Edit button */}
        <button
          className={styles.deleteBtn}
          style={{ right: 44 }}
          onClick={(e) => { e.stopPropagation(); onEdit(item) }}
          title="Edit item"
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
          title="Remove item"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.brand}>{item.brand || '—'}</p>
        {item.price && <p className={styles.price}>{item.price}</p>}
        {item.productLink && (
          <button
            className={styles.viewBtn}
            onClick={(e) => { e.stopPropagation(); window.open(item.productLink, '_blank', 'noopener,noreferrer') }}
          >
            View Product
          </button>
        )}
      </div>
    </div>
  )
}

// ── Add / Edit form ───────────────────────────────────────────────────
function AddWishlistForm({ onSave, onClose, initialValues = null }) {
  const [photo,        setPhoto]        = useState(initialValues?.photo       || null)
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photo       || null)
  const [productLink,  setProductLink]  = useState(initialValues?.productLink || '')
  const [brand,        setBrand]        = useState(initialValues?.brand       || '')
  const [price,        setPrice]        = useState(initialValues?.price       || '')
  const [loading,      setLoading]      = useState(false)
  const [errors,       setErrors]       = useState({})

  const clearError = (key) => setErrors(prev => { const e = { ...prev }; delete e[key]; return e })

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Image must be under 5MB' })); return }
    clearError('photo')
    const b64 = await fileToBase64(file)
    setPhoto(b64)
    setPhotoPreview(b64)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!brand.trim()) newErrors.brand = 'Brand is required'
    if (!price.trim()) newErrors.price = 'Price is required'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setLoading(true)
    const item = initialValues
      ? { ...initialValues, photo, productLink: productLink.trim(), brand: brand.trim(), price: price.trim() }
      : { id: uuidv4(), photo, productLink: productLink.trim(), brand: brand.trim(), price: price.trim(), addedAt: Date.now() }
    onSave(item)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Photo upload */}
      <div className={styles.uploadArea} onClick={() => document.getElementById('wishlist-photo').click()}>
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className={styles.uploadPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Upload photo</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>JPG, PNG, WEBP up to 5MB</span>
          </div>
        )}
        <input id="wishlist-photo" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
      </div>
      {photoPreview && (
        <button
          type="button"
          onClick={() => document.getElementById('wishlist-photo').click()}
          style={{ background: 'none', border: 'none', color: '#888888', fontSize: 13, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
        >
          Change photo
        </button>
      )}
      {errors.photo && <p style={{ color: '#EF4444', fontSize: 13 }}>{errors.photo}</p>}

      {/* Product link */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Product Link</label>
        <input
          className={styles.input}
          type="url"
          placeholder="https://..."
          value={productLink}
          onChange={e => setProductLink(e.target.value)}
        />
      </div>

      {/* Brand (required) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Brand *</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Zara, Nike, SSENSE..."
          value={brand}
          onChange={e => { setBrand(e.target.value); clearError('brand') }}
        />
        {errors.brand && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.brand}</p>}
      </div>

      {/* Price (required) */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Price *</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. $120, €85, £60..."
          value={price}
          onChange={e => { setPrice(e.target.value); clearError('price') }}
        />
        {errors.price && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.price}</p>}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Saving...' : (initialValues ? 'Save Changes' : 'Save Item')}
        </button>
      </div>
    </form>
  )
}

// ── Section ───────────────────────────────────────────────────────────
export default function Wishlist({ setClosetItems }) {
  const [items,        setItems]        = useLocalStorage('wishlist-items', [])
  const [showAdd,      setShowAdd]      = useState(false)
  const [editItem,     setEditItem]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast,        setToast]        = useState(null)

  const handleSave = (item) => {
    if (editItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i))
      setEditItem(null)
    } else {
      setItems(prev => [item, ...prev])
      setShowAdd(false)
    }
  }

  const handleDeleteConfirm = () => {
    setItems(prev => prev.filter(i => i.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const handleMoveToCloset = (item) => {
    // Remove from wishlist
    setItems(prev => prev.filter(i => i.id !== item.id))
    // Add to closet (passed from App so React state stays in sync)
    setClosetItems(prev => [
      { id: uuidv4(), photo: item.photo, brand: item.brand, category: 'Tops', size: '', addedAt: Date.now() },
      ...prev,
    ])
    // Show toast for 2.5 s
    setToast('Added to your closet ✓')
    setTimeout(() => setToast(null), 2500)
  }

  const handleModalClose = () => { setShowAdd(false); setEditItem(null) }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Wishlist</h1>
          <p className={styles.subtitle}>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add to Wishlist
        </button>
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No wishlist items yet</p>
          <p className={styles.emptyText}>Save items you want to buy.</p>
          <button className={styles.addBtn} onClick={() => setShowAdd(true)} style={{ marginTop: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add First Item
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <WishlistCard
              key={item.id}
              item={item}
              onDelete={setDeleteTarget}
              onEdit={setEditItem}
              onMoveToCloset={handleMoveToCloset}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {(showAdd || editItem) && (
        <Modal title={editItem ? 'Edit Wishlist Item' : 'Add to Wishlist'} onClose={handleModalClose}>
          <AddWishlistForm onSave={handleSave} onClose={handleModalClose} initialValues={editItem} />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirm
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  )
}
