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

function WishlistCard({ item, onDelete }) {
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
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(item.id)}
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
            onClick={() => window.open(item.productLink, '_blank', 'noopener,noreferrer')}
          >
            View Product
          </button>
        )}
      </div>
    </div>
  )
}

function AddWishlistForm({ onSave, onClose }) {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [productLink, setProductLink] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB')
      return
    }
    setError('')
    const b64 = await fileToBase64(file)
    setPhoto(b64)
    setPhotoPreview(b64)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    const item = {
      id: uuidv4(),
      photo,
      productLink: productLink.trim(),
      brand: brand.trim(),
      price: price.trim(),
      addedAt: Date.now(),
    }
    onSave(item)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div
        className={styles.uploadArea}
        onClick={() => document.getElementById('wishlist-photo').click()}
      >
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
        <input
          id="wishlist-photo"
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          style={{ display: 'none' }}
        />
      </div>

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

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Brand</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Zara, Nike, SSENSE..."
          value={brand}
          onChange={e => setBrand(e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Price</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. $120, €85, £60..."
          value={price}
          onChange={e => setPrice(e.target.value)}
        />
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: '14px', fontWeight: '500' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </div>
    </form>
  )
}

export default function Wishlist() {
  const [items, setItems] = useLocalStorage('wishlist-items', [])
  const [showAdd, setShowAdd] = useState(false)

  const handleSave = (item) => {
    setItems(prev => [item, ...prev])
    setShowAdd(false)
  }

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

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
            <WishlistCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add to Wishlist" onClose={() => setShowAdd(false)}>
          <AddWishlistForm onSave={handleSave} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  )
}
