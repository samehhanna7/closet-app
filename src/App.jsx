import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import Navigation from './components/Navigation'
import MyCloset from './components/MyCloset'
import MyOutfits from './components/MyOutfits'
import Inspiration from './components/Inspiration'
import Wishlist from './components/Wishlist'

export default function App() {
  const [activeTab, setActiveTab] = useState('closet')
  const [closetItems, setClosetItems] = useLocalStorage('closet-items', [])
  const [outfits, setOutfits] = useLocalStorage('closet-outfits', [])
  const [inspirations, setInspirations] = useLocalStorage('closet-inspirations', [])

  return (
    <div className="appWrapper">
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 0,
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
      </main>
      <div style={{ flexShrink: 0, backgroundColor: '#0D0D0D', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  )
}
