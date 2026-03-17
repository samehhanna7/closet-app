import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Modal from './Modal'
import styles from './MyOutfits.module.css'

function OutfitCard({ outfit, onDelete }) {
  const previews = outfit.items.slice(0, 4)
  return (
    <div className={styles.card}>
      <div className={styles.thumbGrid}>
        {previews.map((item, i) => (
          <div key={i} className={styles.thumb}>
            {item.photo ? (
              <img src={item.photo} alt="" />
            ) : (
              <div className={styles.thumbPlaceholder} />
            )}
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
        <button className={styles.deleteBtn} onClick={() => onDelete(outfit.id)}>Remove</button>
      </div>
    </div>
  )
}

function CreateOutfitView({ closetItems, onSave, onClose }) {
  const [name, setName] = useState('')
  const [selected, setSelected] = useState([])
  const [error, setError] = useState('')

  const toggle = (item) => {
    setSelected(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    )
  }

  const handleSave = () => {
    if (!name.trim()) { setError('Please enter an outfit name'); return }
    if (selected.length === 0) { setError('Select at least one item'); return }
    onSave({ id: uuidv4(), name: name.trim(), items: selected, createdAt: Date.now() })
  }

  return (
    <div className={styles.createView}>
      <div className={styles.fieldGroup}>
        <label className={styles.label}>Outfit Name *</label>
        <input
          className={styles.input}
          type="text"
          placeholder="e.g. Sunday Brunch, Office Monday..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Select Items ({selected.length} selected)</label>
        {closetItems.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '16px 0' }}>
            Add items to your closet first.
          </p>
        ) : (
          <div className={styles.itemGrid}>
            {closetItems.map(item => {
              const isSelected = selected.find(i => i.id === item.id)
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
      </div>

      {error && <p style={{ color: '#EF4444', fontSize: '14px', fontWeight: '500' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" onClick={onClose} className={styles.btnSecondary}>Cancel</button>
        <button type="button" onClick={handleSave} className={styles.btnPrimary}>Save Outfit</button>
      </div>
    </div>
  )
}

export default function MyOutfits({ outfits, setOutfits, closetItems }) {
  const [showCreate, setShowCreate] = useState(false)

  const handleSave = (outfit) => {
    setOutfits(prev => [outfit, ...prev])
    setShowCreate(false)
  }

  const handleDelete = (id) => {
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

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
            <OutfitCard key={outfit.id} outfit={outfit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create Outfit" onClose={() => setShowCreate(false)} wide>
          <CreateOutfitView closetItems={closetItems} onSave={handleSave} onClose={() => setShowCreate(false)} />
        </Modal>
      )}
    </div>
  )
}
