import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*', // ⚠️ À modifier en production
  },
});

// Stockage des rooms et des joueurs
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connecté :', socket.id);

  // Créer une nouvelle room
  socket.on('create-room', (gameId) => {
    // Vérifier si la room existe déjà
    if (rooms.has(gameId)) {
      socket.emit('room-error', 'Cette room existe déjà');
      return;
    }

    // Créer la room
    rooms.set(gameId, {
      id: gameId,
      host: socket.id,
      players: [],
      status: 'waiting', // waiting, playing, finished
      createdAt: new Date()
    });

    // Joindre le créateur à la room
    socket.join(gameId);
    socket.emit('room-created', { gameId, room: rooms.get(gameId) });
    
    console.log(`Room ${gameId} créée par ${socket.id}`);
  });

  // Rejoindre une room en tant que joueur
  socket.on('join-room', ({ gameId, playerName }) => {
    const room = rooms.get(gameId);
    
    if (!room) {
      socket.emit('join-error', 'Cette room n\'existe pas');
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('join-error', 'La partie a déjà commencé');
      return;
    }

    // Ajouter le joueur à la room
    const player = {
      id: socket.id,
      name: playerName,
      score: 0,
      joinedAt: new Date()
    };

    room.players.push(player);
    socket.join(gameId);

    // Notifier tous les membres de la room
    io.to(gameId).emit('player-joined', { player, players: room.players });
    
    // Confirmer au joueur qu'il a bien rejoint
    socket.emit('joined-room', { gameId, players: room.players });

    console.log(`${playerName} (${socket.id}) a rejoint la room ${gameId}`);
  });

  // Démarrer la partie
  socket.on('start-game', (gameId) => {
    const room = rooms.get(gameId);
    
    if (!room) {
      socket.emit('error', 'Room introuvable');
      return;
    }

    if (room.host !== socket.id) {
      socket.emit('error', 'Seul l\'hôte peut démarrer la partie');
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', 'Il faut au moins 2 joueurs pour commencer');
      return;
    }

    room.status = 'playing';
    io.to(gameId).emit('game-started', { gameId });
    
    console.log(`Partie ${gameId} démarrée avec ${room.players.length} joueurs`);
  });

  // Gérer la déconnexion
  socket.on('disconnect', () => {
    console.log('Client déconnecté :', socket.id);
    
    // Parcourir toutes les rooms pour retirer le joueur
    for (const [gameId, room] of rooms.entries()) {
      // Si c'est l'hôte qui se déconnecte
      if (room.host === socket.id) {
        // Notifier tous les joueurs et supprimer la room
        io.to(gameId).emit('host-disconnected');
        rooms.delete(gameId);
        console.log(`Room ${gameId} supprimée (hôte déconnecté)`);
      } else {
        // Retirer le joueur de la room
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          const removedPlayer = room.players.splice(playerIndex, 1)[0];
          io.to(gameId).emit('player-left', { 
            playerId: socket.id, 
            playerName: removedPlayer.name,
            players: room.players 
          });
          console.log(`${removedPlayer.name} a quitté la room ${gameId}`);
        }
      }
    }
  });

  // Obtenir les infos d'une room
  socket.on('get-room-info', (gameId) => {
    const room = rooms.get(gameId);
    if (room) {
      socket.emit('room-info', { gameId, room });
    } else {
      socket.emit('room-error', 'Room introuvable');
    }
  });
});

server.listen(3001, () => {
  console.log('Serveur Socket.IO en écoute sur http://localhost:3001');
});