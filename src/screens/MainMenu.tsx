// src/screens/MainMenu.tsx
import { useNavigation } from '../app/navigation'
import { SCREENS } from '../app/screen'

export default function MainMenu() {
  const { navigate } = useNavigation()
  return (
    <div style={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
      <button
        onClick={() => navigate(SCREENS.SHOP)}
        style={{
          padding: '14px 18px',
          fontWeight: 700,
          fontSize: '1rem',
          borderRadius: 12,
          border: 'none',
          background: '#2a7be4',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        Play
      </button>
    </div>
  )
}
