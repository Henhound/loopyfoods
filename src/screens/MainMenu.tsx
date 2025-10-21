type Props = { onStart: () => void }

export default function MainMenu({ onStart }: Props) {
  return (
    <div className="page">
      <header className="page-header">Loopy Foods</header>
      <main className="page-body">
        <button className="primary-btn" onClick={onStart} aria-label="Start Game">
          Start Game
        </button>
      </main>
    </div>
  )
}
