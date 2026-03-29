import { useState, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './Shops.module.css'

const CATEGORIES = ['All', 'Streetwear', 'Luxury', 'Vintage', 'Basics', 'Sportswear', 'Designer', 'Thrift', 'Other']

const CATEGORY_COLORS = {
  Streetwear: { bg: '#FFF3E0', text: '#E65100' },
  Luxury:     { bg: '#F3E5F5', text: '#6A1B9A' },
  Vintage:    { bg: '#E8F5E9', text: '#2E7D32' },
  Basics:     { bg: '#E3F2FD', text: '#1565C0' },
  Sportswear: { bg: '#E0F2F1', text: '#00695C' },
  Designer:   { bg: '#FCE4EC', text: '#880E4F' },
  Thrift:     { bg: '#FFF8E1', text: '#F57F17' },
  Other:      { bg: '#F5F5F5', text: '#424242' },
}

function getFaviconUrl(url) {
  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return null
  }
}

function normalizeUrl(url) {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}

function ShopFormModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [url, setUrl] = useState(initial?.url || '')
  const [category, setCategory] = useState(initial?.category || 'Other')
  const [notes, setNotes] = useState(initial?.notes || '')

  const normalizedUrl = normalizeUrl(url)
  const faviconUrl = normalizedUrl ? getFaviconUrl(normalizedUrl) : null

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id: initial?.id || uuidv4(),
      name: name.trim(),
      url: normalizedUrl,
      category,
      notes: notes.trim(),
      addedAt: initial?.addedAt || new Date().toISOString(),
    })
  }

  return (
    <Modal title={initial ? 'Edit Shop' : 'Add Shop'} onClose={onClose}>
      <div className={styles.form}>

        {/* Favicon preview */}
        <div className={styles.faviconPreviewRow}>
          <div className={styles.faviconPreview}>
            {faviconUrl ? (
              <img src={faviconUrl} alt="" width={32} height={32} onError={e => { e.target.style.display = 'none' }} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            )}
          </div>
          <span className={styles.faviconHint}>{faviconUrl ? 'Shop icon preview' : 'Enter a URL to see the shop icon'}</span>
        </div>

        <label className={styles.label}>Shop Name *</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. ASOS, Zara, Depop…"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label className={styles.label}>Website URL</label>
        <input
          className={styles.input}
          type="url"
          placeholder="e.g. asos.com"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <label className={styles.label}>Category</label>
        <div className={styles.categoryGrid}>
          {CATEGORIES.filter(c => c !== 'All').map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.catChip} ${category === cat ? styles.catChipActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className={styles.label}>Notes</label>
        <textarea
          className={styles.textarea}
          placeholder="Fave brands, discount codes, vibes…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
        />

        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!name.trim()}
        >
          {initial ? 'Save Changes' : 'Add Shop'}
        </button>
      </div>
    </Modal>
  )
}

function DeleteConfirm({ shop, onConfirm, onCancel }) {
  return (
    <div className={styles.deleteOverlay} onClick={onCancel}>
      <div className={styles.deleteSheet} onClick={e => e.stopPropagation()}>
        <p className={styles.deleteTitle}>Remove "{shop.name}"?</p>
        <p className={styles.deleteDesc}>This will permanently remove this shop from your list.</p>
        <div className={styles.deleteBtns}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.dangerBtn} onClick={onConfirm}>Remove</button>
        </div>
      </div>
    </div>
  )
}

function ShopCard({ shop, onEdit, onDelete }) {
  const faviconUrl = shop.url ? getFaviconUrl(shop.url) : null
  const catColor = CATEGORY_COLORS[shop.category] || CATEGORY_COLORS.Other
  const [faviconError, setFaviconError] = useState(false)

  function handleCardClick() {
    if (shop.url) {
      window.open(shop.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className={styles.card} onClick={handleCardClick} role={shop.url ? 'link' : undefined} tabIndex={shop.url ? 0 : undefined}>
      <div className={styles.cardLeft}>
        <div className={styles.faviconBox}>
          {faviconUrl && !faviconError ? (
            <img src={faviconUrl} alt="" width={28} height={28} onError={() => setFaviconError(true)} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#BBBBBB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          )}
        </div>
        <div className={styles.cardInfo}>
          <span className={styles.cardName}>{shop.name}</span>
          {shop.url && (
            <span className={styles.cardUrl}>
              {new URL(shop.url).hostname.replace(/^www\./, '')}
            </span>
          )}
          {shop.notes && <span className={styles.cardNotes}>{shop.notes}</span>}
        </div>
      </div>
      <div className={styles.cardRight}>
        <span className={styles.catBadge} style={{ background: catColor.bg, color: catColor.text }}>
          {shop.category}
        </span>
        <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
          <button className={styles.iconBtn} onClick={() => onEdit(shop)} aria-label="Edit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className={styles.iconBtn} onClick={() => onDelete(shop)} aria-label="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Shops({ shops, setShops }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingShop, setEditingShop] = useState(null)
  const [deletingShop, setDeletingShop] = useState(null)

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return shops
    return shops.filter(s => s.category === activeFilter)
  }, [shops, activeFilter])

  function handleSave(shop) {
    if (editingShop) {
      setShops(shops.map(s => s.id === shop.id ? shop : s))
    } else {
      setShops([shop, ...shops])
    }
    setShowForm(false)
    setEditingShop(null)
  }

  function handleEdit(shop) {
    setEditingShop(shop)
    setShowForm(true)
  }

  function handleDelete(shop) {
    setDeletingShop(shop)
  }

  function confirmDelete() {
    setShops(shops.filter(s => s.id !== deletingShop.id))
    setDeletingShop(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Shops</h1>
          <button className={styles.addBtn} onClick={() => { setEditingShop(null); setShowForm(true) }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Shop
          </button>
        </div>

        <div className={styles.filterBar}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.filterChip} ${activeFilter === cat ? styles.filterChipActive : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <p>{activeFilter === 'All' ? 'No shops yet. Tap + Add Shop to get started.' : `No ${activeFilter} shops yet.`}</p>
          </div>
        ) : (
          filtered.map(shop => (
            <ShopCard key={shop.id} shop={shop} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        )}
      </div>

      {showForm && (
        <ShopFormModal
          initial={editingShop}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingShop(null) }}
        />
      )}

      {deletingShop && (
        <DeleteConfirm
          shop={deletingShop}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingShop(null)}
        />
      )}
    </div>
  )
}
