<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
    <!-- Header -->
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Quiz Admin</h1>
        <button
          @click="startGame"
          :disabled="players.length < 2"
          class="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Lancer la partie ({{ players.length }} joueurs)
        </button>
      </div>

      <!-- Code Display -->
      <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8 text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Code de la partie</h2>
        <div class="bg-gray-900 rounded-xl p-8 inline-block">
          <p class="text-6xl font-bold text-white tracking-wider font-mono">{{ gameCode }}</p>
        </div>
        <p class="mt-4 text-gray-600">
          Partagez ce code avec les joueurs pour qu'ils puissent rejoindre sur
          <span class="font-semibold">quiz.votresite.com</span>
        </p>
      </div>

      <!-- Players Section -->
      <div class="bg-white rounded-2xl shadow-2xl p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">
            Joueurs connectés ({{ players.length }})
          </h2>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-gray-600">En ligne</span>
          </div>
        </div>

        <!-- Players Grid -->
        <div v-if="players.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <transition-group name="player-list">
            <div
              v-for="player in players"
              :key="player.id"
              class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white transform transition-all duration-300 hover:scale-105"
            >
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span class="text-2xl">{{ getPlayerEmoji(player.id) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold truncate">{{ player.name }}</p>
                  <p class="text-xs opacity-75">ID: {{ player.id.slice(0, 8) }}</p>
                </div>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-6xl mb-4">👥</div>
          <p class="text-gray-500 text-lg">En attente des joueurs...</p>
          <p class="text-gray-400 mt-2">Les joueurs apparaîtront ici une fois connectés</p>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="mt-4 text-center">
        <p class="text-white text-sm">
          État WebSocket: 
          <span :class="wsConnected ? 'text-green-300' : 'text-red-300'" class="font-semibold">
            {{ wsConnected ? 'Connecté' : 'Déconnecté' }}
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// State
const gameCode = ref('')
const players = ref([])
const wsConnected = ref(false)

// Données de test pour le développement
const mockPlayers = [
  { id: '1234567890', name: 'Alice' },
  { id: '0987654321', name: 'Bob' },
  { id: '1357924680', name: 'Charlie' },
]

// Get game code from URL
onMounted(() => {
  gameCode.value = route.query.gameId || ''
  if (!gameCode.value) {
    router.push('/admin')
    return
  }
  
  // Initialisation WebSocket (placeholder)
  initWebSocket()
  
  // Pour le développement, on ajoute des joueurs de test
  // À retirer quand le WebSocket sera implémenté
  setTimeout(() => {
    players.value = mockPlayers
    wsConnected.value = true
  }, 1000)
})

// Cleanup
onUnmounted(() => {
  disconnectWebSocket()
})

// WebSocket functions (placeholders)
const initWebSocket = () => {
  // TODO: Implémenter la connexion WebSocket
  console.log('WebSocket init placeholder')
}

const disconnectWebSocket = () => {
  // TODO: Implémenter la déconnexion WebSocket
  console.log('WebSocket disconnect placeholder')
}

const onPlayerJoin = (player) => {
  // TODO: Gérer l'arrivée d'un nouveau joueur
  players.value.push(player)
}

const onPlayerLeave = (playerId) => {
  // TODO: Gérer le départ d'un joueur
  players.value = players.value.filter(p => p.id !== playerId)
}

// Game functions
const startGame = () => {
  // TODO: Implémenter le démarrage de la partie
  console.log('Démarrage de la partie avec', players.value.length, 'joueurs')
  // router.push('/admin/game/play?gameId=' + gameCode.value)
}

// Utility functions
const getPlayerEmoji = (playerId) => {
  // Génère un emoji basé sur l'ID du joueur
  const emojis = ['🦊', '🐸', '🦁', '🐼', '🐨', '🐯', '🦄', '🐧', '🦉', '🐙']
  const index = parseInt(playerId.slice(-1), 16) % emojis.length
  return emojis[index]
}
</script>

<style scoped>
/* Animation pour l'apparition des joueurs */
.player-list-enter-active,
.player-list-leave-active {
  transition: all 0.3s ease;
}

.player-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.player-list-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Animation pour le statut de connexion */
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>