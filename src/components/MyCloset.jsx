import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './MyCloset.module.css'

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories']

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function CategoryBadge({ category }) {
  return (
    <span style={{
      display: 'inline-block',
      background: 'var(--accent-light)',
      color: 'var(--accent)',
      fontSize: '11px',
      fontWeight: '700',
      padding: '3px 10px',
      borderRadius: '20px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {category}
    </span>
  )
}

function ItemCard({ item, onDelete }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImage}>
        {item.photo ? (
          <img src={item.photo} alt={item.brand || item.category} />
        ) : (
          <div className={styles.placeholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E8E3DC" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <button className={styles.deleteBtn} onClick={() => onDelete(item.id)} title="Remove item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className={styles.cardBody}>
        <CategoryBadge category={item.category} />
        <p className={styles.brand}>{item.brand || '—'}</p>
        <p className={styles.size}>Size: {item.size || '—'}</p>
      </div>
    </div>
  )
}

function AddItemForm({ onSave, onClose }) {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [size, setSize] = useState('')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!category) { setError('Please select a category'); return }
    setLoading(true)
    const item = { id: uuidv4(), photo, category, brand, size, addedAt: Date.now() }
    onSave(item)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.uploadArea} onClick={() => document.getElementById('item-photo').click()}>
        {photoPreview ? (
          <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className={styles.uploadPlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Upload photo</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>JPG, PNG, WEBP up to 5MB</span>
          </div>
        )}
        <input id="item-photo" type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Category *</label>
        <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)} required>
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Brand</label>
        <input className={styles.input} type="text" placeholder="e.g. Zara, Nike, Vintage..." value={brand} onChange={e => setBrand(e.target.value)} />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Size</label>
        <input className={styles.input} type="text" placeholder="e.g. M, 38, 10..." value={size} onChange={e => setSize(e.target.value)} />
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

export default function MyCloset({ items, setItems }) {
  const [showAdd, setShowAdd] = useState(false)
  const [filterCategory, setFilterCategory] = useState('All')

  const handleSave = (item) => {
    setItems(prev => [item, ...prev])
    setShowAdd(false)
  }

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = filterCategory === 'All' ? items : items.filter(i => i.category === filterCategory)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Closet</h1>
          <p className={styles.subtitle}>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Item
        </button>
      </div>

      <div className={styles.filterBar}>
        {['All', ...CATEGORIES].map(cat => (
          <button
            key={cat}
            className={`${styles.filterChip} ${filterCategory === cat ? styles.filterActive : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>{filterCategory === 'All' ? 'Your closet is empty' : `No ${filterCategory} yet`}</p>
          <p className={styles.emptyText}>Start building your digital wardrobe by adding items.</p>
          {filterCategory === 'All' && (
            <button className={styles.addBtn} onClick={() => setShowAdd(true)} style={{ marginTop: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAdd && (
        <Modal title="Add Item" onClose={() => setShowAdd(false)}>
          <AddItemForm onSave={handleSave} onClose={() => setShowAdd(false)} />
        </Modal>
      )}
    </div>
  )
}
