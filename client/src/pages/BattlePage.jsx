import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { socket } from '../socket'
import RaceTrack from '../components/RaceTrack'

export default function BattlePage() {
  const { roomId } = useParams()
  const navigate = useNavigate()

  const [players, setPlayers] = useState([])
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [battleStarted, setBattleStarted] = useState(false)
  const [winner, setWinner] = useState(null)
  const [confettiActive, setConfettiActive] = useState(false)
  const [status, setStatus] = useState('Waiting for players...')

  const userId = sessionStorage.getItem('userId')
  const username = sessionStorage.getItem('username')
  const isMe = (p) => p.userId === userId

  useEffect(() => {
    if (!socket.connected) {
      // Reconnect if navigated directly to /battle/:roomId
      const avatar = sessionStorage.getItem('avatar') || '🐼'
      socket.connect()
      socket.once('connect', () => {
        socket.emit('join_room', { roomId, userId, username, avatar })
      })
    }

    socket.on('room_update', ({ players, totalQuestions }) => {
      setPlayers(players)
      setTotalQuestions(totalQuestions)
    })

    socket.on('battle_started', () => {
      setBattleStarted(true)
      setStatus('Battle in progress!')
    })

    socket.on('progress_update', ({ players, totalQuestions }) => {
      setPlayers(players)
      setTotalQuestions(totalQuestions)
    })

    socket.on('battle_finished', ({ winner, players }) => {
      setPlayers(players)
      setWinner(winner)
      setConfettiActive(true)
      setStatus(winner.userId === userId ? '🏆 You won!' : `🏆 ${winner.username} won!`)
      setTimeout(() => setConfettiActive(false), 4000)
    })

    socket.on('error', ({ message }) => {
      alert(message)
      navigate('/')
    })

    return () => {
      socket.off('room_update')
      socket.off('battle_started')
      socket.off('progress_update')
      socket.off('battle_finished')
      socket.off('error')
    }
  }, [roomId])

  function handleStartBattle() {
    socket.emit('start_battle', { roomId })
  }

  function copyRoomCode() {
    navigator.clipboard.writeText(roomId)
  }

  const myPlayer = players.find(isMe)
  const myRank = [...players].sort((a, b) => b.score - a.score).findIndex(isMe) + 1

  return (
    <div style={styles.page}>
      {confettiActive && <Confetti />}

      {/* ── TOP SECTION: Race Track ─────────────────────── */}
      <div style={styles.topSection}>
        <div style={styles.topBar}>
          <div>
            <span style={styles.roomLabel}>ROOM</span>
            <button style={styles.roomCode} onClick={copyRoomCode} title="Click to copy">
              {roomId} <span style={{ fontSize: 11, opacity: 0.5 }}>copy</span>
            </button>
          </div>
          <div style={styles.statusPill}>{status}</div>
        </div>

        {/* Race track - always visible at top */}
        {players.length > 0 ? (
          <RaceTrack players={players} totalQuestions={totalQuestions} winner={winner} />
        ) : (
          <div style={styles.emptyTrack}>Waiting for players to join...</div>
        )}
      </div>

      {/* ── BOTTOM SECTION: Lobby / Battle controls ─────── */}
      <div style={styles.bottomSection}>
        {!battleStarted && !winner && (
          <div style={styles.lobbyCard}>
            <h2 style={styles.cardTitle}>
              {players.length} player{players.length !== 1 ? 's' : ''} in lobby
            </h2>
            <div style={styles.playerList}>
              {players.map((p, i) => (
                <div key={p.userId} style={{ ...styles.playerChip, ...(isMe(p) ? styles.meChip : {}) }}>
                  <span style={styles.chipAvatar}>{p.avatar}</span>
                  <span style={styles.chipName}>{p.username}{isMe(p) ? ' (you)' : ''}</span>
                </div>
              ))}
            </div>
            <p style={styles.hint}>Share the room code with friends to invite them!</p>
            <button style={styles.startBtn} onClick={handleStartBattle} disabled={players.length < 1}>
              ⚡ Start Battle
            </button>
          </div>
        )}

        {battleStarted && !winner && (
          <div style={styles.inProgressCard}>
            <div style={styles.myStats}>
              <div style={styles.statBox}>
                <span style={styles.statNum}>{myPlayer?.score ?? 0}</span>
                <span style={styles.statLabel}>correct</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNum}>#{myRank || '—'}</span>
                <span style={styles.statLabel}>rank</span>
              </div>
              <div style={styles.statBox}>
                <span style={styles.statNum}>{totalQuestions - (myPlayer?.score ?? 0)}</span>
                <span style={styles.statLabel}>left</span>
              </div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
              Answer questions on the quiz page — your progress updates live here!
            </p>
          </div>
        )}

        {winner && (
          <div style={styles.winnerCard}>
            <div style={styles.winnerEmoji}>{winner.avatar}</div>
            <h2 style={styles.winnerName}>
              {winner.userId === userId ? '🏆 You won!' : `${winner.username} wins!`}
            </h2>
            <p style={styles.winnerSub}>
              Finished {winner.score}/{totalQuestions} questions first
            </p>
            <div style={styles.finalRankings}>
              {[...players]
                .sort((a, b) => b.score - a.score)
                .map((p, i) => (
                  <div key={p.userId} style={styles.rankRow}>
                    <span style={styles.rankNum}>#{i + 1}</span>
                    <span style={styles.rankAvatar}>{p.avatar}</span>
                    <span style={styles.rankName}>{p.username}</span>
                    <span style={styles.rankScore}>{p.score}/{totalQuestions}</span>
                  </div>
                ))}
            </div>
            <button style={styles.startBtn} onClick={() => navigate('/')}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple CSS confetti
function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i)
  const colors = ['#7c5cfc','#fc5c7c','#ffc845','#3dffa0','#5cf0fc']
  return (
    <div style={styles.confettiContainer} aria-hidden>
      {pieces.map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            borderRadius: Math.random() > 0.5 ? '50%' : 2,
            background: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
            animation: `fall ${Math.random() * 2 + 2}s linear forwards`,
            animationDelay: `${Math.random() * 1.5}s`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    padding: '0 0 40px'
  },
  topSection: {
    padding: '20px 24px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)'
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  roomLabel: {
    color: 'var(--muted)',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    display: 'block'
  },
  roomCode: {
    background: 'none',
    border: 'none',
    color: 'var(--text)',
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '0.15em',
    cursor: 'pointer',
    padding: 0
  },
  statusPill: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 100,
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--accent)'
  },
  emptyTrack: {
    textAlign: 'center',
    color: 'var(--muted)',
    padding: '24px 0',
    fontSize: 14
  },
  bottomSection: {
    flex: 1,
    padding: '24px 24px 0',
    maxWidth: 700,
    width: '100%',
    margin: '0 auto'
  },
  lobbyCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '24px'
  },
  cardTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 16
  },
  playerList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  playerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 100,
    padding: '6px 12px'
  },
  meChip: {
    borderColor: 'var(--accent)',
    background: 'rgba(124,92,252,0.12)'
  },
  chipAvatar: { fontSize: 18 },
  chipName: { fontSize: 13, fontWeight: 600 },
  hint: {
    color: 'var(--muted)',
    fontSize: 12,
    marginBottom: 16
  },
  startBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
    marginTop: 8
  },
  inProgressCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '24px'
  },
  myStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12
  },
  statBox: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 14,
    padding: '16px 12px',
    textAlign: 'center'
  },
  statNum: {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 800,
    color: 'var(--accent)'
  },
  statLabel: {
    display: 'block',
    color: 'var(--muted)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginTop: 2
  },
  winnerCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '32px 24px',
    textAlign: 'center'
  },
  winnerEmoji: { fontSize: 56, marginBottom: 8 },
  winnerName: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 800,
    color: 'var(--gold)',
    marginBottom: 4
  },
  winnerSub: { color: 'var(--muted)', fontSize: 14, marginBottom: 24 },
  finalRankings: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
    textAlign: 'left'
  },
  rankRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--surface2)',
    borderRadius: 10,
    padding: '10px 14px'
  },
  rankNum: { color: 'var(--muted)', fontWeight: 700, fontSize: 13, width: 24 },
  rankAvatar: { fontSize: 18 },
  rankName: { flex: 1, fontWeight: 600, fontSize: 14 },
  rankScore: { color: 'var(--accent)', fontWeight: 700, fontSize: 14 },
  confettiContainer: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 999,
    overflow: 'hidden'
  }
}
