import React, { useEffect, useRef } from 'react'

// Colors assigned to players by index
const TRACK_COLORS = [
  '#7c5cfc', '#fc5c7c', '#3dffa0', '#ffc845',
  '#5cf0fc', '#fc8c5c', '#c05cfc', '#5cfc8c',
  '#fc5cdc', '#5c9cfc'
]

function PlayerLane({ player, totalQuestions, index, isWinner }) {
  const pct = totalQuestions > 0 ? (player.score / totalQuestions) * 100 : 0
  const color = TRACK_COLORS[index % TRACK_COLORS.length]
  const prevPct = useRef(pct)

  useEffect(() => { prevPct.current = pct }, [pct])

  return (
    <div style={styles.lane}>
      {/* Left: avatar + name */}
      <div style={styles.playerInfo}>
        <span style={styles.avatarEmoji}>{player.avatar}</span>
        <span style={{ ...styles.playerName, color: isWinner ? '#ffc845' : 'var(--text)' }}>
          {player.username}
          {isWinner && ' 👑'}
        </span>
      </div>

      {/* Track */}
      <div style={styles.trackBg}>
        {/* Tick marks every 10% */}
        {[10,20,30,40,50,60,70,80,90].map(t => (
          <div key={t} style={{ ...styles.tick, left: `${t}%` }} />
        ))}

        {/* Progress fill */}
        <div
          style={{
            ...styles.trackFill,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 12px ${color}88`
          }}
        />

        {/* Avatar bubble at progress position */}
        <div
          style={{
            ...styles.avatarBubble,
            left: `calc(${pct}% - 18px)`,
            borderColor: color,
            boxShadow: `0 0 10px ${color}99`
          }}
        >
          {player.avatar}
        </div>
      </div>

      {/* Right: score */}
      <div style={{ ...styles.score, color }}>
        {player.score}<span style={styles.scoreSep}>/{totalQuestions}</span>
      </div>
    </div>
  )
}

export default function RaceTrack({ players, totalQuestions, winner }) {
  // Sort by score descending so leader is always on top
  const sorted = [...players].sort((a, b) => b.score - a.score)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>⚡ LIVE RACE</span>
        <span style={styles.headerSub}>{players.length} player{players.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={styles.lanes}>
        {sorted.map((player, i) => (
          <PlayerLane
            key={player.userId}
            player={player}
            totalQuestions={totalQuestions}
            index={players.findIndex(p => p.userId === player.userId)}
            isWinner={winner && winner.userId === player.userId}
          />
        ))}
      </div>

      {/* Finish line label */}
      <div style={styles.finishLabel}>🏁 FINISH</div>
    </div>
  )
}

const styles = {
  container: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '20px 24px 16px',
    width: '100%'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 14,
    letterSpacing: '0.12em',
    color: 'var(--accent)'
  },
  headerSub: {
    color: 'var(--muted)',
    fontSize: 12,
    fontWeight: 600
  },
  lanes: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  lane: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 44px',
    alignItems: 'center',
    gap: 12
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden'
  },
  avatarEmoji: {
    fontSize: 18,
    lineHeight: 1,
    flexShrink: 0
  },
  playerName: {
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  trackBg: {
    height: 28,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 100,
    position: 'relative',
    overflow: 'visible'
  },
  tick: {
    position: 'absolute',
    top: '20%',
    width: 1,
    height: '60%',
    background: 'rgba(255,255,255,0.06)',
    pointerEvents: 'none'
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 100,
    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    minWidth: 4
  },
  avatarBubble: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 36,
    height: 36,
    background: 'var(--surface)',
    border: '2px solid',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    zIndex: 2,
    boxSizing: 'border-box'
  },
  score: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 15,
    textAlign: 'right'
  },
  scoreSep: {
    color: 'var(--muted)',
    fontWeight: 400,
    fontSize: 12
  },
  finishLabel: {
    textAlign: 'right',
    fontSize: 11,
    color: 'var(--muted)',
    fontWeight: 600,
    letterSpacing: '0.08em',
    marginTop: 6,
    paddingRight: 44 + 12
  }
}
