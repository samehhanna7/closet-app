import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './Inspiration.module.css'
import { compressImage } from '../utils/compressImage'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { savePhoto, deletePhoto, getPhotos } from '../utils/imageStorage'

const CATEGORIES = ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories']
const OCCASIONS  = ['Casual', 'Work', 'Formal', 'Date Night', 'Seasonal']

const OCCASION_COLORS = {
  Casual:       { bg: '#FEF3C7', text: '#B45309' },
  Work:         { bg: '#DBEAFE', text: '#1D4ED8' },
  Formal:       { bg: '#EDE9FE', text: '#6D28D9' },
  'Date Night': { bg: '#FCE7F3', text: '#9D174D' },
  Seasonal:     { bg: '#D1FAE5', text: '#065F46' },
}

function OccasionTag({ occasion }) {
  const colors = OCCASION_COLORS[occasion] || { bg: 'var(--accent-light)', text: 'var(--accent)' }
  return (
    <span style={{
      display: 'inline-block', background: colors.bg, color: colors.text,
      fontSize: '11px', fontWeight: '700', padding: '3px 10px',
      borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      {occasion}
    </span>
  )
}

function CategoryPill({ category }) {
  return (
    <span style={{
      display: 'inline-block', background: '#FFF0E6', color: '#F97316',
      fontSize: '11px', fontWeight: '700', padding: '3px 10px',
      borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      {category}
    </span>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      background: '#0D0D0D', color: '#F5F0E8', padding: '12px 24px',
      borderRadius: 100, fontSize: 14, fontWeight: 700, zIndex: 500,
      boxShadow: '0 4px 20px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────────────
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

// ── Match slot row ────────────────────────────────────────────────────
function MatchSlot({ slot, closetItem, closetItems, onRemove, onPickFromCloset, onAddToWishlist }) {
  const hasInCategory = closetItems.some(i => i.category === slot.category)

  return (
    <div className={styles.matchSlot}>
      <div className={styles.slotHeader}>
        <CategoryPill category={slot.category} />
        <button className={styles.slotRemoveBtn} onClick={onRemove} title="Remove">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {slot.status === 'matched' && (
        <div className={styles.slotMatched}>
          {closetItem?.photo
            ? <img src={closetItem.photo} className={styles.slotThumb} alt={closetItem.brand} />
            : <div className={styles.slotThumbPlaceholder} />
          }
          <span className={styles.slotBrand}>
            {closetItem ? (closetItem.brand || closetItem.category) : 'Item removed'}
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}

      {slot.status === 'wishlisted' && (
        <div className={styles.slotWishlisted}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span className={styles.slotWishlistedText}>On wishlist</span>
        </div>
      )}

      {slot.status === 'unmatched' && (
        <p className={styles.slotUnmatchedText}>Not matched yet</p>
      )}

      <div className={styles.slotActions}>
        <button
          className={styles.slotPickBtn}
          onClick={onPickFromCloset}
          disabled={!hasInCategory}
        >
          {slot.status === 'matched'
            ? 'Change'
            : hasInCategory ? 'Pick from Closet' : `No ${slot.category} in closet`}
        </button>
        {slot.status !== 'wishlisted' && (
          <button className={styles.slotWishBtn} onClick={onAddToWishlist}>
            Add to Wishlist
          </button>
        )}
      </div>
    </div>
  )
}

// ── Closet picker (second modal layer) ───────────────────────────────
function ClosetPicker({ category, closetItems, onPick }) {
  const items = closetItems.filter(i => i.category === category)
  if (items.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#888888' }}>No {category} in your closet yet.</p>
      </div>
    )
  }
  return (
    <div className={styles.pickerGrid}>
      {items.map(item => (
        <div key={item.id} className={styles.pickerItem} onClick={() => onPick(item)}>
          {item.photo
            ? <img src={item.photo} className={styles.pickerItemImg} alt={item.brand} />
            : <div className={styles.pickerItemPlaceholder} />
          }
          <p className={styles.pickerItemBrand}>{item.brand || '—'}</p>
        </div>
      ))}
    </div>
  )
}

// ── Match outfit modal ────────────────────────────────────────────────
function MatchOutfitModal({ item, closetItems, onSave, onClose, showToast }) {
  const [matches,        setMatches]        = useState(item.matches || [])
  const [pickerSlotId,   setPickerSlotId]   = useState(null)
  const [showCatPicker,  setShowCatPicker]  = useState(false)

  const addSlot = (category) => {
    setMatches(prev => [...prev, { id: uuidv4(), category, status: 'unmatched', closetItemId: null, notes: '' }])
    setShowCatPicker(false)
  }

  const removeSlot = (slotId) => {
    setMatches(prev => prev.filter(m => m.id !== slotId))
  }

  const pickFromCloset = (slotId, closetItem) => {
    setMatches(prev => prev.map(m =>
      m.id === slotId ? { ...m, status: 'matched', closetItemId: closetItem.id } : m
    ))
    setPickerSlotId(null)
  }

  const addToWishlist = async (slot) => {
    const newId = uuidv4()
    try {
      if (item.photo) {
        await savePhoto(newId, item.photo)
      }
      const existing = JSON.parse(localStorage.getItem('wishlist-items') || '[]')
      const newWishlistItem = {
        id: newId, brand: '', price: '', productLink: '', addedAt: Date.now(),
      }
      localStorage.setItem('wishlist-items', JSON.stringify([newWishlistItem, ...existing]))
    } catch (e) {
      console.error('Wishlist write error:', e)
    }
    setMatches(prev => prev.map(m =>
      m.id === slot.id ? { ...m, status: 'wishlisted' } : m
    ))
    showToast('Added to wishlist ✓')
  }

  const handleSave = () => {
    onSave({ ...item, matches })
  }

  const pickerSlot = pickerSlotId ? matches.find(m => m.id === pickerSlotId) : null

  return (
    <>
      <Modal title="Match This Outfit" onClose={onClose}>
        {/* Photo banner */}
        <div style={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000000',
          marginBottom: '16px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <img
            src={item.photo}
            alt="inspiration"
            style={{
              width: '100%',
              maxHeight: '55vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Match slots */}
        {matches.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {matches.map(slot => {
              const closetItem = slot.closetItemId
                ? closetItems.find(i => i.id === slot.closetItemId) ?? null
                : null
              return (
                <MatchSlot
                  key={slot.id}
                  slot={slot}
                  closetItem={closetItem}
                  closetItems={closetItems}
                  onRemove={() => removeSlot(slot.id)}
                  onPickFromCloset={() => setPickerSlotId(slot.id)}
                  onAddToWishlist={() => addToWishlist(slot)}
                />
              )
            })}
          </div>
        )}

        {/* Add item */}
        <div style={{ marginBottom: 20 }}>
          {showCatPicker ? (
            <div className={styles.catPicker}>
              {CATEGORIES.map(cat => (
                <button key={cat} className={styles.catPickerBtn} onClick={() => addSlot(cat)}>
                  {cat}
                </button>
              ))}
              <button className={styles.catPickerCancel} onClick={() => setShowCatPicker(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className={styles.addSlotBtn} onClick={() => setShowCatPicker(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Item
            </button>
          )}
        </div>

        {/* Save */}
        <button className={styles.btnPrimary} onClick={handleSave} style={{ width: '100%' }}>
          Save Matches
        </button>
      </Modal>

      {/* Closet picker — second modal layer */}
      {pickerSlot && (
        <Modal title={`Pick ${pickerSlot.category}`} onClose={() => setPickerSlotId(null)}>
          <ClosetPicker
            category={pickerSlot.category}
            closetItems={closetItems}
            onPick={(closetItem) => pickFromCloset(pickerSlotId, closetItem)}
          />
        </Modal>
      )}
    </>
  )
}

// ── Card ──────────────────────────────────────────────────────────────
function InspirationCard({ item, onDelete, onEdit, onMatch }) {
  const matches       = item.matches || []
  const matchedCount  = matches.filter(m => m.status === 'matched').length
  const wishCount     = matches.filter(m => m.status === 'wishlisted').length
  const unmatchCount  = matches.filter(m => m.status === 'unmatched').length

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
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
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
        {/* Occasion tag */}
        <div className={styles.cardFooter}>
          <OccasionTag occasion={item.occasion} />
        </div>
      </div>

      {/* Card actions */}
      <div className={styles.cardActions}>
        <button className={styles.matchBtn} onClick={() => onMatch(item)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          Match Outfit
        </button>
        {matches.length > 0 && (
          <div className={styles.matchSummary}>
            {matchedCount > 0 && (
              <span className={styles.matchSummaryItem}>
                <span className={styles.dotGreen} />{matchedCount} matched
              </span>
            )}
            {wishCount > 0 && (
              <span className={styles.matchSummaryItem}>
                <span className={styles.dotOrange} />{wishCount} to buy
              </span>
            )}
            {unmatchCount > 0 && (
              <span className={styles.matchSummaryItem}>
                <span className={styles.dotGrey} />{unmatchCount} unmatched
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add / Edit form ───────────────────────────────────────────────────
function AddInspirationForm({ onSave, onClose, initialValues = null }) {
  const [photo,        setPhoto]        = useState(initialValues?.photo    || null)
  const [photoPreview, setPhotoPreview] = useState(initialValues?.photo    || null)
  const [occasion,     setOccasion]     = useState(initialValues?.occasion || '')
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) { setErrors(prev => ({ ...prev, photo: 'Image must be under 8MB' })); return }
    setErrors(prev => { const er = { ...prev }; delete er.photo; return er })
    const compressed = await compressImage(file)
    setPhoto(compressed)
    setPhotoPreview(compressed)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!photo)    newErrors.photo    = 'Please upload an image'
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
        <button type="button" onClick={() => document.getElementById('inspo-photo').click()}
          style={{ background: 'none', border: 'none', color: '#888888', fontSize: 13, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}>
          Change photo
        </button>
      )}
      {errors.photo && <p style={{ color: '#EF4444', fontSize: 13 }}>{errors.photo}</p>}

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Occasion *</label>
        <div className={styles.occasionGrid}>
          {OCCASIONS.map(occ => (
            <button key={occ} type="button"
              className={`${styles.occasionBtn} ${occasion === occ ? styles.occasionActive : ''}`}
              onClick={() => { setOccasion(occ); setErrors(prev => { const er = { ...prev }; delete er.occasion; return er }) }}>
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
  const [closetItems]                    = useLocalStorage('closet-items', [])
  const [showAdd,        setShowAdd]     = useState(false)
  const [editItem,       setEditItem]    = useState(null)
  const [deleteTarget,   setDeleteTarget]= useState(null)
  const [activeFilter,   setActiveFilter]= useState('All')
  const [matchItem,      setMatchItem]   = useState(null)
  const [toast,          setToast]       = useState(null)
  const [photos,         setPhotos]      = useState({})
  const [closetPhotos,   setClosetPhotos]= useState({})

  // Migrate legacy photos from localStorage → IndexedDB, then load all
  useEffect(() => {
    (async () => {
      const toMigrate = inspirations.filter(i => i.photo)
      if (toMigrate.length > 0) {
        for (const item of toMigrate) {
          await savePhoto(item.id, item.photo)
        }
        setInspirations(prev => prev.map(i => {
          if (i.photo) { const { photo, ...rest } = i; return rest }
          return i
        }))
      }
      const loaded = await getPhotos(inspirations.map(i => i.id))
      setPhotos(loaded)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load closet item photos when closet changes
  const closetIdsKey = closetItems.map(i => i.id).join(',')
  useEffect(() => {
    if (!closetIdsKey) return
    getPhotos(closetIdsKey.split(',').filter(Boolean)).then(setClosetPhotos)
  }, [closetIdsKey])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSave = async (item) => {
    const { photo, ...metadata } = item
    if (photo) {
      await savePhoto(metadata.id, photo)
      setPhotos(prev => ({ ...prev, [metadata.id]: photo }))
    }
    if (editItem) {
      setInspirations(prev => prev.map(i => i.id === metadata.id ? metadata : i))
      setEditItem(null)
    } else {
      setInspirations(prev => [metadata, ...prev])
      setShowAdd(false)
    }
  }

  const handleMatchSave = (updatedItem) => {
    const { photo, ...metadata } = updatedItem
    setInspirations(prev => prev.map(i => i.id === metadata.id ? metadata : i))
    setMatchItem(null)
  }

  const handleDeleteConfirm = async () => {
    await deletePhoto(deleteTarget)
    setPhotos(prev => { const p = { ...prev }; delete p[deleteTarget]; return p })
    setInspirations(prev => prev.filter(i => i.id !== deleteTarget))
    setDeleteTarget(null)
  }

  const handleModalClose = () => { setShowAdd(false); setEditItem(null) }

  const filtered = activeFilter === 'All' ? inspirations : inspirations.filter(i => i.occasion === activeFilter)
  const enrichedFiltered = filtered.map(item => ({ ...item, photo: photos[item.id] }))
  const enrichedClosetItems = closetItems.map(i => ({ ...i, photo: closetPhotos[i.id] }))

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
          <button key={occ}
            className={`${styles.filterChip} ${activeFilter === occ ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter(occ)}>
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
          {enrichedFiltered.map(item => (
            <InspirationCard
              key={item.id}
              item={item}
              onDelete={setDeleteTarget}
              onEdit={setEditItem}
              onMatch={setMatchItem}
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

      {/* Match outfit modal */}
      {matchItem && (
        <MatchOutfitModal
          item={matchItem}
          closetItems={enrichedClosetItems}
          onSave={handleMatchSave}
          onClose={() => setMatchItem(null)}
          showToast={showToast}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteConfirm onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  )
}
