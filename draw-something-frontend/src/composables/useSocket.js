import { io } from 'socket.io-client'
import { ref } from 'vue'

const socket = io('http://localhost:3001')
const roomId = ref('test-room')

export function useSocket() {
  return { socket, roomId }
}
