type Props = {
  onBack: () => void
}

export default function Shop({ onBack }: Props) {
  return (
    <div className="page">
      <header className="page-header">Shop</header>

      <main className="page-body">
        <button className="secondary-btn" onClick={onBack} aria-label="Back to Menu">
          Back to Menu
        </button>
      </main>
    </div>
  )
}
