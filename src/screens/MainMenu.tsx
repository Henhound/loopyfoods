// src/screens/MainMenu.tsx
type Props = { onStart: () => void }

export default function MainMenu({ onStart }: Props) {
  return (
    <div style={{ height: '100dvh', display: 'grid', placeItems: 'center' }}>
      <button
        onClick={onStart}
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
