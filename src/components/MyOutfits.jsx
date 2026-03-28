import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './MyOutfits.module.css'
import { getPhotos } from '../utils/imageStorage'

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

// ── Outfit card ───────────────────────────────────────────────────────
// Uses local hover state (not CSS) because the card has overflow:hidden
// which would clip absolutely-positioned overlay buttons.
function OutfitCard({ outfit, photos, onDelete, onEdit, onView }) {
  const [hovered, setHovered] = useState(false)
  const previews = outfit.items.slice(0, 4)

  return (
    <div
      className={styles.card}
      onClick={() => onView(outfit)}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.thumbGrid}>
        {previews.map((item, i) => (
          <div key={i} className={styles.thumb}>
            {(item.photo || photos[item.id]) ? <img src={item.photo || photos[item.id]} alt="" /> : <div className={styles.thumbPlaceholder} />}
          </div>
        ))}
        {previews.length < 4 && Array.from({ length: 4 - previews.length }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.thumb}>
            <div className={styles.thumbPlaceholder} />
          </div>
        ))}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.outfitName}>{outfit.name}</p>
        <p className={styles.itemCount}>{outfit.items.length} {outfit.items.length === 1 ? 'item' : 'items'}</p>
        {/* Edit / delete — visible on hover via React state */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(outfit) }}
            style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.8)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(outfit.id) }}
            style={{ background: 'none', border: 'none', color: '#ff6b6b', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Outfit detail modal ───────────────────────────────────────────────
function OutfitDetailModal({ outfit, photos, onClose }) {
  return (
    <Modal title={outfit.name} onClose={onClose} wide>
      <div>
        <p style={{ fontSize: 13, color: '#888888', marginBottom: 20 }}>
          {outfit.items.length} {outfit.items.length === 1 ? 'item' : 'items'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
          {outfit.items.map((item, i) => (
            <div key={item.id || i}>
              {(item.photo || photos[item.id]) ? (
                <img
                  src={item.photo || photos[item.id]}
                  alt={item.brand || item.category}
                  style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 10, display: 'block' }}
                />
              ) : (
                <div style={{ width: '100%', aspectRatio: '3/4', background: '#F5F0E8', borderRadius: 10 }} />
              )}
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0D0D0D', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.brand || '—'}
              </p>
              <p style={{ fontSize: 11, color: '#888888' }}>{item.category}</p>
            </div>
          ))}
        </div>
        {outfit.notes && outfit.notes.trim() && (
          <p style={{ fontSize: 14, color: '#888888', fontWeight: 500, lineHeight: '1.5', whiteSpace: 'pre-wrap', marginTop: 16, marginBottom: 0 }}>
            {outfit.notes}
          </p>
        )}
      </div>
    </Modal>
  )
}

// ── Create / Edit outfit form ─────────────────────────────────────────
function CreateOutfitView({ closetItems, onSave, onClose, initialValues = null }) {
  const [name,     setName]     = useState(initialValues?.name  || '')
  const [selected, setSelected] = useState(initialValues?.items || [])
  const [notes,    setNotes]    = useState(initialValues?.notes || '')
  const [errors,   setErrors]   = useState({})

  const toggle = (item) => {
    setErrors(prev => { const e = { ...prev }; delete e.items; return e })
    setSelected(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const handleSave = () => {
    const newErrors = {}
    if (!name.trim())       newErrors.name  = 'Please enter an outfit name'
    if (selected.length === 0) newErrors.items = 'Select at least one item'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const outfit = initialValues
      ? { ...initialValues, name: name.trim(), items: selected, notes }
      : { id: uuidv4(), name: name.trim(), items: selected, notes, createdAt: Date.now() }
    onSave(outfit)
  }

  return (
    <div className={styles.createView}>
      {/* Outfit name */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Outfit Name *</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Sunday Brunch, Office Monday..."
          value={name}
          onChange={e => { setName(e.target.value); setErrors(prev => { const er = { ...prev }; delete er.name; return er }) }}
        />
        {errors.name && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.name}</p>}
      </div>

      {/* Item selector */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Select Items ({selected.length} selected)</label>
        {closetItems.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '16px 0' }}>
            Add items to your closet first.
          </p>
        ) : (
          <div className={styles.itemGrid}>
            {closetItems.map(item => {
              const isSelected = !!selected.find(i => i.id === item.id)
              return (
                <div
                  key={item.id}
                  className={`${styles.selectItem} ${isSelected ? styles.selectItemActive : ''}`}
                  onClick={() => toggle(item)}
                >
                  <div className={styles.selectItemImg}>
                    {item.photo ? <img src={item.photo} alt="" /> : <div className={styles.thumbPlaceholder} />}
                    {isSelected && (
                      <div className={styles.checkOverlay}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className={styles.selectItemLabel}>{item.brand || item.category}</p>
                  <p className={styles.selectItemSub}>{item.category}</p>
                </div>
              )
            })}
          </div>
        )}
        {errors.items && <p style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.items}</p>}
      </div>

      {/* Notes */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Notes</label>
        <textarea
          className={styles.input}
          rows={3}
          placeholder="e.g. Great for brunch, wore to Sarah's wedding..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{ resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
        <button type="button" onClick={handleSave} className={styles.btnPrimary}>
          {initialValues ? 'Save Changes' : 'Save Outfit'}
        </button>
      </div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────
export default function MyOutfits({ outfits, setOutfits, closetItems }) {
  const [showCreate,   setShowCreate]   = useState(false)
  const [editOutfit,   setEditOutfit]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailOutfit, setDetailOutfit] = useState(null)
  const [photos,       setPhotos]       = useState({})

  useEffect(() => {
    const ids = closetItems.map(i => i.id).filter(Boolean)
    if (ids.length > 0) {
      getPhotos(ids).then(setPhotos)
    }
  }, [closetItems])

  const enrichedClosetItems = closetItems.map(i => ({ ...i, photo: photos[i.id] }))

  const handleSave = (outfit) => {
    if (editOutfit) {
      setOutfits(prev => prev.map(o => o.id === outfit.id ? outfit : o))
      setEditOutfit(null)
    } else {
      setOutfits(prev => [outfit, ...prev])
      setShowCreate(false)
    }
  }

  const handleDeleteConfirm = () => {
    setOutfits(prev => prev.filter(o => o.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const handleModalClose = () => { setShowCreate(false); setEditOutfit(null) }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Outfits</h1>
          <p className={styles.subtitle}>{outfits.length} saved {outfits.length === 1 ? 'outfit' : 'outfits'}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Outfit
        </button>
      </div>

      {outfits.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
              <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
            </svg>
          </div>
          <p className={styles.emptyTitle}>No outfits yet</p>
          <p className={styles.emptyText}>Combine items from your closet into outfit combinations.</p>
          <button className={styles.addBtn} onClick={() => setShowCreate(true)} style={{ marginTop: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Create First Outfit
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {outfits.map(outfit => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              photos={photos}
              onDelete={setDeleteTarget}
              onEdit={setEditOutfit}
              onView={setDetailOutfit}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {(showCreate || editOutfit) && (
        <Modal title={editOutfit ? 'Edit Outfit' : 'Create Outfit'} onClose={handleModalClose} wide>
          <CreateOutfitView
            closetItems={enrichedClosetItems}
            onSave={handleSave}
            onClose={handleModalClose}
            initialValues={editOutfit}
          />
        </Modal>
      )}

      {/* Detail modal */}
      {detailOutfit && (
        <OutfitDetailModal outfit={detailOutfit} photos={photos} onClose={() => setDetailOutfit(null)} />
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
