import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const socket = io('http://localhost:3001/', {
    autoConnect: false // On se connecte manuellement
  });

  return {
    provide: {
      socket,
    },
  };
});