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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 'var(--nav-height)' }}>
      <main style={{ flex: 1, overflowY: 'auto' }}>
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
          <Wishlist />
        )}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
