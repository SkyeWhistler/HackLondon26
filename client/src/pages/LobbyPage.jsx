import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../socket'

const AVATARS = ['🐼','🦊','🐯','🦁','🐸','🐧','🦄','🐙','🦋','🐺','🦖','🐲']

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export default function LobbyPage() {
  const [username, setUsername] = useState('')
  const [roomId, setRoomId] = useState('')
  const [avatar, setAvatar] = useState('🐼')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleJoin(e) {
    e.preventDefault()
    if (!username.trim() || !roomId.trim()) return setError('Fill in all fields!')
    setLoading(true)
    setError('')

    // Connect socket and join room
    socket.connect()
    const userId = 'user_' + Math.random().toString(36).substr(2, 8)
    sessionStorage.setItem('userId', userId)
    sessionStorage.setItem('username', username.trim())
    sessionStorage.setItem('avatar', avatar)

    socket.emit('join_room', { roomId: roomId.toUpperCase(), userId, username: username.trim(), avatar })
    socket.once('error', ({ message }) => {
      setError(message)
      setLoading(false)
      socket.disconnect()
    })
    socket.once('room_update', () => {
      navigate(`/battle/${roomId.toUpperCase()}`)
    })
  }

  async function handleCreate() {
    setLoading(true)
    try {
      const res = await fetch(`${SERVER_URL}/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalQuestions: 10 })
      })
      const data = await res.json()
      setRoomId(data.roomId)
      setLoading(false)
    } catch {
      setError('Could not connect to server')
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.card}>
        <div style={styles.logo}>⚡ LIVE BATTLE</div>
        <p style={styles.sub}>knowunity</p>

        <form onSubmit={handleJoin} style={styles.form}>
          <label style={styles.label}>Your name</label>
          <input
            style={styles.input}
            placeholder="e.g. Alex"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={20}
          />

          <label style={styles.label}>Pick your avatar</label>
          <div style={styles.avatarGrid}>
            {AVATARS.map(a => (
              <button
                key={a}
                type="button"
                style={{ ...styles.avatarBtn, ...(avatar === a ? styles.avatarSelected : {}) }}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>

          <label style={styles.label}>Room code</label>
          <div style={styles.row}>
            <input
              style={{ ...styles.input, flex: 1, textTransform: 'uppercase', letterSpacing: '0.15em' }}
              placeholder="e.g. XK92F1"
              value={roomId}
              onChange={e => setRoomId(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button type="button" style={styles.secondaryBtn} onClick={handleCreate} disabled={loading}>
              New room
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.primaryBtn} disabled={loading}>
            {loading ? 'Connecting...' : 'Join Battle →'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--bg)'
  },
  glow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,92,252,0.15) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 440,
    position: 'relative',
    zIndex: 1
  },
  logo: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--text)',
    letterSpacing: '-0.02em'
  },
  sub: {
    color: 'var(--accent)',
    fontWeight: 600,
    fontSize: 13,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 32
  },
  form: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { color: 'var(--muted)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, marginTop: 8 },
  input: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: 16,
    outline: 'none',
    width: '100%'
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
    marginBottom: 8
  },
  avatarBtn: {
    background: 'var(--surface2)',
    border: '2px solid transparent',
    borderRadius: 10,
    fontSize: 22,
    padding: '6px 0',
    cursor: 'pointer',
    transition: 'border-color 0.15s'
  },
  avatarSelected: {
    borderColor: 'var(--accent)',
    background: 'rgba(124,92,252,0.15)'
  },
  row: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  primaryBtn: {
    marginTop: 16,
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
    transition: 'opacity 0.15s'
  },
  secondaryBtn: {
    background: 'var(--surface2)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  error: { color: 'var(--accent2)', fontSize: 13, fontWeight: 500 }
}
