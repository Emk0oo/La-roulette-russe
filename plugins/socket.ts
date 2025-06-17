// plugins/socket.client.js
import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const getSocketUrl = () => {
    // En développement
    if (process.dev) {
      return 'http://localhost:3001'
    }
    
    // En production
    return config.public.socketUrl || 'https://nodelarouletterusse-production.up.railway.app/'
  }
  
  const socket = io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket', 'polling']
  })

  return {
    provide: {
      socket,
    },
  }
})