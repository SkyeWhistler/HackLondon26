import { io } from 'socket.io-client'

// Change this to your deployed backend URL when you go live
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export const socket = io(SOCKET_URL, { autoConnect: false })
