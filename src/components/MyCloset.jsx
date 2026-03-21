import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './MyCloset.module.css'
import { compressImage } from '../utils/compressImage'
import { savePhoto, deletePhoto, getPhotos } from '../utils/imageStorage'

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories']
const COLORS    = ['Black', 'White', 'Grey', 'Brown', 'Beige', 'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Multi']
const SEASONS   = ['All Seasons', 'Spring', 'Summer', 'Fall', 'Winter']
const COLOR_HEX = {
  Black: '#0D0D0D', White: '#FFFFFF', Grey: '#888888', Brown: '#8B4513',
  Beige: '#D4B896', Red: '#E53E3E', Orange: '#F97316', Yellow: '#F6C90E',
  Green: '#38A169', Blue: '#3B82F6', Purple: '#805AD5', Pink: '#F472B6',
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

// ── Color dot ─────────────────────────────────────────────────────────
function ColorDot({ color }) {
  if (!color) return null
  const bg = color === 'Multi'
    ? 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
    : COLOR_HEX[color]
  return <div className={styles.colorDot} style={{ background: bg }} />
}

// ── Card ─────────────────────────────────────────────────────────────
function ItemCard({ item, onDelete, onEdit, onView }) {
  return (
    <div className={styles.card} onClick={() => onView(item)} style={{ cursor: 'pointer' }}>
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
        {/* Edit button */}
        <button
          className={styles.editBtn}
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
        {/* Color dot */}
        <ColorDot color={item.color} />
      </div>
      <div className={styles.cardBody}>
        <CategoryBadge category={item.category} />
        <p className={styles.brand}>{item.brand || '—'}</p>
        <p className={styles.size}>Size: {item.size || '—'}</p>
      </div>
    </div>
  )
}

// ── Detail modal ──────────────────────────────────────────────────────
function ItemDetailModal({ item, onClose }) {
  const colorBg = item.color === 'Multi'
    ? 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)'
    : COLOR_HEX[item.color]
  return (
    <Modal title={item.brand || 'Item Detail'} onClose={onClose}>
      <div>
        {item.photo ? (
          <img
            src={item.photo}
            alt={item.brand || item.category}
            style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: 200, background: '#F5F0E8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D0C8BC" strokeWidth="1.5">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
            </svg>
          </div>
        )}
        <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 12 }}>
            <CategoryBadge category={item.category} />
          </div>
          <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0D0D0D', marginBottom: 12 }}>
            {item.brand || '—'}
          </p>
          <p style={{ fontSize: 14, color: '#888888', fontWeight: 500, marginBottom: 12 }}>
            Size: {item.size || '—'}
          </p>
          {item.color && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: colorBg, border: '1.5px solid #E8E3DC', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0D0D0D' }}>{item.color}</span>
            </div>
          )}
          {item.season && item.season !== 'All Seasons' && (
            <div style={{ marginBottom: 12 }}>
              <span style={{
                display: 'inline-block', background: '#0D0D0D', color: '#FFFFFF',
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
                {item.season}
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Add / Edit form ───────────────────────────────────────────────────
function AddItemForm({ onSave, onClose, initialValues = null }) {
  const [photo,        setPhoto]        = useState(initialValues?.photo    || null)
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photo    || null)
  const [category,     setCategory]     = useState(initialValues?.category || '')
  const [brand,        setBrand]        = useState(initialValues?.brand    || '')
  const [size,         setSize]         = useState(initialValues?.size     || '')
  const [color,        setColor]        = useState(initialValues?.color    || '')
  const [season,       setSeason]       = useState(initialValues?.season   || 'All Seasons')
  const [loading,      setLoading]      = useState(false)
  const [errors,       setErrors]       = useState({})

  const clearError = (key) => setErrors(prev => { const e = { ...prev }; delete e[key]; return e })

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Image must be under 5MB' })); return }
    clearError('photo')
    const compressed = await compressImage(file)
    setPhoto(compressed)
    setPhotoPreview(compressed)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!category) newErrors.category = 'Please select a category'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setLoading(true)
    const item = initialValues
      ? { ...initialValues, photo, category, brand, size, color, season }
      : { id: uuidv4(), photo, category, brand, size, color, season, addedAt: Date.now() }
    onSave(item)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Photo upload */}
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
      {photoPreview && (
        <button
          type="button"
          onClick={() => document.getElementById('item-photo').click()}
          style={{ background: 'none', border: 'none', color: '#888888', fontSize: 13, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
        >
          Change photo
        </button>
      )}
      {errors.photo && <p style={{ color: '#EF4444', fontSize: 13 }}>{errors.photo}</p>}

      {/* Category */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Category *</label>
        <select
          className={styles.select}
          value={category}
          onChange={e => { setCategory(e.target.value); clearError('category') }}
        >
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.category}</p>}
      </div>

      {/* Brand */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Brand</label>
        <input className={styles.input} type="text" placeholder="e.g. Zara, Nike, Vintage..." value={brand} onChange={e => setBrand(e.target.value)} />
      </div>

      {/* Size */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Size</label>
        <input className={styles.input} type="text" placeholder="e.g. M, 38, 10..." value={size} onChange={e => setSize(e.target.value)} />
      </div>

      {/* Color */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Color</label>
        <select className={styles.select} value={color} onChange={e => setColor(e.target.value)}>
          <option value="">Select color</option>
          {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Season */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Season</label>
        <select className={styles.select} value={season} onChange={e => setSeason(e.target.value)}>
          {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
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
export default function MyCloset({ items, setItems }) {
  const [showAdd,        setShowAdd]        = useState(false)
  const [editItem,       setEditItem]       = useState(null)
  const [deleteTarget,   setDeleteTarget]   = useState(null)
  const [detailItem,     setDetailItem]     = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterColor,    setFilterColor]    = useState('All')
  const [filterSeason,   setFilterSeason]   = useState('All')
  const [search,         setSearch]         = useState('')
  const [photos,         setPhotos]         = useState({})

  // Migrate legacy photos from localStorage → IndexedDB, then load all photos
  useEffect(() => {
    (async () => {
      const toMigrate = items.filter(i => i.photo)
      if (toMigrate.length > 0) {
        for (const item of toMigrate) {
          await savePhoto(item.id, item.photo)
        }
        setItems(prev => prev.map(i => {
          if (i.photo) { const { photo, ...rest } = i; return rest }
          return i
        }))
      }
      const loaded = await getPhotos(items.map(i => i.id))
      setPhotos(loaded)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (item) => {
    const { photo, ...metadata } = item
    if (photo) {
      await savePhoto(metadata.id, photo)
      setPhotos(prev => ({ ...prev, [metadata.id]: photo }))
    }
    if (editItem) {
      setItems(prev => prev.map(i => i.id === metadata.id ? metadata : i))
      setEditItem(null)
    } else {
      setItems(prev => [metadata, ...prev])
      setShowAdd(false)
    }
  }

  const handleDeleteConfirm = async () => {
    await deletePhoto(deleteTarget)
    setPhotos(prev => { const p = { ...prev }; delete p[deleteTarget]; return p })
    setItems(prev => prev.filter(i => i.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const handleModalClose = () => { setShowAdd(false); setEditItem(null) }

  const filtered = items.filter(item => {
    if (filterCategory !== 'All' && item.category !== filterCategory) return false
    if (filterColor !== 'All' && item.color !== filterColor) return false
    if (filterSeason !== 'All') {
      const itemSeason = item.season || 'All Seasons'
      if (itemSeason !== 'All Seasons' && itemSeason !== filterSeason) return false
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      const haystack = [item.brand, item.category, item.size, item.color, item.season]
        .filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const enrichedFiltered = filtered.map(item => ({ ...item, photo: photos[item.id] }))

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

      {/* Search bar */}
      <div className={styles.searchContainer}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search brand, color, season…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearSearch} onClick={() => setSearch('')} type="button" aria-label="Clear search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className={`${styles.filterBar} ${styles.filterBarCompact}`}>
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

      {/* Color filter */}
      <div className={`${styles.filterBar} ${styles.filterBarCompact}`}>
        {['All', ...COLORS].map(col => (
          <button
            key={col}
            className={`${styles.filterChip} ${filterColor === col ? styles.filterActive : ''}`}
            onClick={() => setFilterColor(col)}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Season filter */}
      <div className={styles.filterBar}>
        {['All', 'Spring', 'Summer', 'Fall', 'Winter'].map(s => (
          <button
            key={s}
            className={`${styles.filterChip} ${filterSeason === s ? styles.filterActive : ''}`}
            onClick={() => setFilterSeason(s)}
          >
            {s}
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
          <p className={styles.emptyTitle}>
            {items.length === 0 ? 'Your closet is empty' : 'No matching items'}
          </p>
          <p className={styles.emptyText}>
            {items.length === 0
              ? 'Start building your digital wardrobe by adding items.'
              : 'Try adjusting your search or filters.'}
          </p>
          {items.length === 0 && (
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
          {enrichedFiltered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={setDeleteTarget}
              onEdit={setEditItem}
              onView={setDetailItem}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {(showAdd || editItem) && (
        <Modal title={editItem ? 'Edit Item' : 'Add Item'} onClose={handleModalClose}>
          <AddItemForm onSave={handleSave} onClose={handleModalClose} initialValues={editItem} />
        </Modal>
      )}

      {/* Detail modal */}
      {detailItem && (
        <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
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
