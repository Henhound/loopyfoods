import React from 'react'
import '../styles/shop.css'
import { useNavigation } from '../app/navigation'
import { SCREENS } from '../app/screen'
import {
  clearTeamSnapshots,
  deleteTeamSnapshot,
  listTeamSnapshots,
  type TeamSnapshot,
} from '../app/teamStorage'

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

function TeamRow({
  snapshot,
  onDelete,
}: {
  snapshot: TeamSnapshot
  onDelete: (id: string) => void
}) {
  return (
    <div
      className="panelBox"
      style={{
        display: 'grid',
        gap: 6,
        border: '1px solid var(--border-color)',
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700 }}>Team {snapshot.id.slice(0, 6)}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(snapshot.createdAt)}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
          <span>R{snapshot.round}</span>
          <span>HP {snapshot.health}</span>
          <span>TR {snapshot.trophies}</span>
          <button className="btn ghost mini" onClick={() => onDelete(snapshot.id)}>
            Delete
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        <div>
          <div className="sectionLabel small">Lunch Line ({snapshot.kids.length})</div>
          <div className="lunchLineRow" style={{ paddingBottom: 0 }}>
            {snapshot.kids.length === 0 ? (
              <div className="emptyLunchLine" role="status">
                Empty
              </div>
            ) : (
              snapshot.kids.map((kid, i) => (
                <div key={`mgr-kid-${kid.title}-${i}`} className="kidChip">
                  <img className="kidChipImg" src={kid.image} alt={kid.title} />
                  <span className="kidName">{kid.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <div className="sectionLabel small">Tray ({snapshot.tray.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 }}>
            {snapshot.tray.map((card, i) => (
              <div
                key={`mgr-tray-${i}`}
                className={`slot ${i === snapshot.tray.length - 1 ? 'rect' : 'square'}`}
                style={{ minHeight: '52px' }}
              >
                {card ? (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 10,
                      border: '1px solid var(--border-color)',
                      background: card.color,
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      padding: '4px 8px',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      lineHeight: 1.1,
                      fontSize: 13,
                      textShadow: '0 1px 2px rgba(0,0,0,0.45)',
                    }}
                  >
                    {card.title}
                  </div>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TeamManager() {
  const { back, navigate } = useNavigation()
  const [teams, setTeams] = React.useState<TeamSnapshot[]>([])

  const loadTeams = React.useCallback(() => {
    setTeams(listTeamSnapshots())
  }, [])

  React.useEffect(() => {
    loadTeams()
  }, [loadTeams])

  const handleDelete = (id: string) => {
    deleteTeamSnapshot(id)
    loadTeams()
  }

  const handleClear = () => {
    clearTeamSnapshots()
    loadTeams()
  }

  return (
    <div
      style={{
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        padding: 10,
        background: 'var(--bg)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: 'var(--gap)',
      }}
    >
      <div className="topbar">
        <button onClick={back} className="btn ghost">
          Back
        </button>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn ghost" onClick={loadTeams}>
            Refresh
          </button>
          <button className="btn warning" onClick={handleClear} disabled={!teams.length}>
            Clear All
          </button>
          <button className="btn cta" onClick={() => navigate(SCREENS.SHOP)}>
            Go to Shop
          </button>
        </div>
      </div>

      <div style={{ overflow: 'auto', paddingRight: 4, display: 'grid', gap: 10 }}>
        {teams.length === 0 ? (
          <div className="panelBox" style={{ textAlign: 'center', color: 'var(--muted)' }}>
            No teams saved yet. Play a round and hit Lunch Time to create one.
          </div>
        ) : (
          teams.map(t => <TeamRow key={t.id} snapshot={t} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  )
}
