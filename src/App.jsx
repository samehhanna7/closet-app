import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Navigation from './components/Navigation'
import MyCloset from './components/MyCloset'
import MyOutfits from './components/MyOutfits'
import Inspiration from './components/Inspiration'
import Wishlist from './components/Wishlist'
import Shops from './components/Shops'
import Settings from './components/Settings'

export default function App() {
  const [activeTab, setActiveTab] = useState('closet')
  const [closetItems, setClosetItems] = useLocalStorage('closet-items', [])
  const [outfits, setOutfits] = useLocalStorage('closet-outfits', [])
  const [inspirations, setInspirations] = useLocalStorage('closet-inspirations', [])
  const [shops, setShops] = useLocalStorage('closet-shops', [])
  const [showSettings, setShowSettings] = useState(false)

  const mainBg = (activeTab === 'closet' || activeTab === 'wishlist') ? '#F97316' : '#F5F0E8'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0D0D0D',
    }}>
      <main style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: mainBg,
        position: 'relative',
      }}>
        {activeTab === 'closet' && (
          <MyCloset items={closetItems} setItems={setClosetItems} />
        )}
        {activeTab === 'outfits' && (
          <MyOutfits outfits={outfits} setOutfits={setOutfits} closetItems={closetItems} />
        )}
        {activeTab === 'inspiration' && (
          <Inspiration inspirations={inspirations} setInspirations={setInspirations} />
        )}
        {activeTab === 'wishlist' && (
          <Wishlist setClosetItems={setClosetItems} />
        )}
        {activeTab === 'shops' && (
          <Shops shops={shops} setShops={setShops} />
        )}

        {/* Gear icon — fixed top-right, visible on all tabs */}
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          style={{
            position: 'fixed',
            top: '14px',
            right: '16px',
            zIndex: 100,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(13,13,13,0.18)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0D0D0D',
            transition: 'background 0.15s, transform 0.1s',
          }}
          onPointerDown={e => { e.currentTarget.style.transform = 'scale(0.88)' }}
          onPointerUp={e => { e.currentTarget.style.transform = '' }}
          onPointerLeave={e => { e.currentTarget.style.transform = '' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </main>
      <div style={{
        flexShrink: 0,
        backgroundColor: '#0D0D0D',
      }}>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
