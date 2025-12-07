// src/screens/MainMenu.tsx
import { useNavigation } from '../app/navigation'
import { SCREENS } from '../app/screen'

export default function MainMenu() {
  const { navigate } = useNavigation()
  return (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'grid', gap: 12, minWidth: 200 }}>
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
        <button
          onClick={() => navigate(SCREENS.TEAM_MANAGER)}
          style={{
            padding: '12px 14px',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderRadius: 12,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#1f2937',
            cursor: 'pointer',
          }}
        >
          Team Manager
        </button>
      </div>
    </div>
  )
}
