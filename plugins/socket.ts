// plugins/socket.client.js
import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  // Détection automatique de l'environnement
  const getSocketUrl = () => {
    if (process.client) {
      // Côté client
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:3001'
      } else {
        // En production, utilisez la même origine mais sur un port différent
        // ou une URL complètement différente
        return `${window.location.protocol}//${window.location.hostname}:3001`
        // ou return 'https://votre-api.com'
      }
    }
    // Côté serveur (fallback)
    return 'http://localhost:3001'
  }
  
  const socket = io(getSocketUrl(), {
    autoConnect: false
  });

  return {
    provide: {
      socket,
    },
  };
});