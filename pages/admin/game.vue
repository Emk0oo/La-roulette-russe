<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Tableau de bord - Partie en cours</h1>
        <div class="flex items-center space-x-6">
          <!-- QR Code -->
          <div class="bg-white p-4 rounded-xl shadow-lg">
            <div class="text-center mb-2">
              <p class="text-sm font-semibold text-gray-700">Rejoindre la partie</p>
            </div>
            <div ref="qrCodeContainer" class="flex justify-center"></div>
            <div class="text-center mt-2">
              <p class="text-xs text-gray-500">Scanner avec votre téléphone</p>
              <p class="text-xs text-blue-600 mt-1 break-all">{{ gameUrl }}</p>
            </div>
          </div>
          
          <!-- Code de la partie -->
          <div class="text-white text-center">
            <span class="text-xl">Code: </span>
            <div class="text-2xl font-mono font-bold bg-white/20 px-4 py-2 rounded-lg">
              {{ gameCode }}
            </div>
          </div>
        </div>
      </div>

      <!-- Reste du template identique... -->
      <!-- Question actuelle -->
      <div v-if="currentQuestion" class="bg-white rounded-2xl shadow-2xl p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">
            Question {{ currentQuestion.questionNumber }}/{{ currentQuestion.totalQuestions }}
          </h2>
          <div class="text-2xl font-bold" :class="timeRemaining <= 5 ? 'text-red-600' : 'text-green-600'">
            {{ timeRemaining }}s
          </div>
        </div>
        <p class="text-lg text-gray-700 mb-2">{{ currentQuestion.question }}</p>
        <div class="text-sm text-gray-500">
          {{ playersAnswered }}/{{ activePlayers.length }} joueurs actifs ont répondu
        </div>
      </div>

      <!-- Notifications d'élimination -->
      <div v-if="recentEliminatedPlayers.length > 0" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Joueur(s) éliminé(s) !
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <ul class="list-disc list-inside space-y-1">
                <li v-for="player in recentEliminatedPlayers" :key="player.playerId">
                  {{ player.playerName }} a été éliminé (0 points)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques du jeu -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-2xl font-bold text-gray-900">{{ players.length }}</div>
          <div class="text-sm text-gray-500">Joueurs total</div>
        </div>
        <div class="bg-green-100 rounded-lg shadow p-4">
          <div class="text-2xl font-bold text-green-600">{{ activePlayers.length }}</div>
          <div class="text-sm text-gray-500">Joueurs actifs</div>
        </div>
        <div class="bg-red-100 rounded-lg shadow p-4">
          <div class="text-2xl font-bold text-red-600">{{ eliminatedCount }}</div>
          <div class="text-sm text-gray-500">Joueurs éliminés</div>
        </div>
      </div>

      <!-- Liste des joueurs avec scores -->
      <div class="bg-white rounded-2xl shadow-2xl p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">
          Classement en temps réel
        </h2>
        
        <div class="space-y-3">
          <transition-group name="player-list" tag="div">
            <div
              v-for="(player, index) in sortedPlayers"
              :key="player.id"
              :class="[
                'flex items-center justify-between p-4 rounded-lg transition-all duration-500',
                player.eliminated ? 'bg-red-50 border-2 border-red-200 opacity-75' : '',
                !player.eliminated && showResults && player.lastPointChange !== 0 ? 
                  (player.lastPointChange > 0 ? 'bg-green-100 animate-pulse' : 'bg-red-100 animate-pulse') : 
                  !player.eliminated ? 'bg-gray-100' : ''
              ]"
            >
              <div class="flex items-center space-x-4">
                <!-- Position -->
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                     :class="player.eliminated ? 'bg-red-500 text-white' : getPositionClass(index)">
                  {{ player.eliminated ? '💀' : getActivePosition(player) }}
                </div>
                
                <!-- Nom du joueur -->
                <div>
                  <div class="flex items-center space-x-2">
                    <p class="font-semibold text-lg" :class="player.eliminated ? 'line-through text-gray-500' : ''">
                      {{ player.name }}
                    </p>
                    <span v-if="player.eliminated" class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      ÉLIMINÉ
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">
                    {{ player.eliminated ? '💀 Éliminé à 0 points' : (player.hasAnswered ? '✓ A répondu' : '⏳ En attente') }}
                  </p>
                </div>
              </div>
              
              <!-- Score -->
              <div class="flex items-center space-x-4">
                <!-- Animation du changement de score -->
                <transition name="score-change">
                  <div v-if="!player.eliminated && showResults && player.lastPointChange !== 0" 
                       class="text-2xl font-bold"
                       :class="player.lastPointChange > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ player.lastPointChange > 0 ? '+1' : '-1' }}
                  </div>
                </transition>
                
                <!-- Score actuel -->
                <div class="text-3xl font-bold" :class="player.eliminated ? 'text-red-600' : 'text-gray-800'">
                  {{ player.score }}
                  <span class="text-sm font-normal text-gray-500">pts</span>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- Message de fin de partie -->
      <div v-if="gameEnded" class="mt-6 bg-white rounded-2xl shadow-2xl p-8 text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Partie terminée!</h2>
        
        <div v-if="winner" class="mb-6">
          <div class="text-xl mb-2">🏆 Gagnant: <span class="font-bold text-yellow-600">{{ winner.playerName }}</span></div>
          <div class="text-lg">Score final: {{ winner.score }} points</div>
        </div>
        
        <div v-else class="mb-6">
          <div class="text-xl text-red-600 font-bold">Tous les joueurs ont été éliminés!</div>
          <div class="text-lg text-gray-600">Aucun gagnant</div>
        </div>

        <div v-if="gameEndReason === 'elimination'" class="bg-yellow-100 border border-yellow-400 rounded-lg p-4">
          <p class="text-yellow-800 font-medium">
            🚨 Partie terminée par élimination - Un ou plusieurs joueurs ont atteint 0 points
          </p>
        </div>
        
        <!-- Classement final -->
        <div class="mt-6">
          <h3 class="text-xl font-semibold mb-4">Classement final</h3>
          <div class="space-y-2">
            <div v-for="(player, index) in finalScores" :key="player.playerId"
                 class="flex justify-between items-center p-3 rounded"
                 :class="player.eliminated ? 'bg-red-50' : 'bg-gray-50'">
              <div class="flex items-center space-x-3">
                <span class="font-bold">{{ index + 1 }}.</span>
                <span :class="player.eliminated ? 'line-through text-gray-500' : ''">
                  {{ player.playerName }}
                </span>
                <span v-if="player.eliminated" class="text-red-500 text-sm">(Éliminé)</span>
              </div>
              <span class="font-bold" :class="player.eliminated ? 'text-red-600' : ''">
                {{ player.score }} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { $socket } = useNuxtApp()

// State
const gameCode = ref('')
const players = ref([])
const currentQuestion = ref(null)
const timeRemaining = ref(20)
const playersAnswered = ref(0)
const showResults = ref(false)
const gameEnded = ref(false)
const winner = ref(null)
const eliminatedPlayers = ref([])
const recentEliminatedPlayers = ref([])
const finalScores = ref([])
const gameEndReason = ref('')
const qrCodeContainer = ref(null)
const gameUrl = ref('')

// Computed
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => {
    // Les joueurs non éliminés en premier, puis par score
    if (a.eliminated && !b.eliminated) return 1;
    if (!a.eliminated && b.eliminated) return -1;
    return b.score - a.score;
  })
})

const activePlayers = computed(() => {
  return players.value.filter(player => !player.eliminated)
})

const eliminatedCount = computed(() => {
  return players.value.filter(player => player.eliminated).length
})

// Méthodes
const getPositionClass = (index) => {
  // Calculer la position parmi les joueurs actifs seulement
  const activeIndex = getActivePosition(sortedPlayers.value[index]) - 1
  switch(activeIndex) {
    case 0: return 'bg-yellow-400 text-white'
    case 1: return 'bg-gray-400 text-white'
    case 2: return 'bg-orange-600 text-white'
    default: return 'bg-gray-300 text-gray-700'
  }
}

const getActivePosition = (player) => {
  if (player.eliminated) return '❌'
  const activePlayersSorted = activePlayers.value.sort((a, b) => b.score - a.score)
  return activePlayersSorted.findIndex(p => p.id === player.id) + 1
}

const getBaseUrl = () => {
  // En développement
  if (process.dev || window.location.hostname === 'localhost') {
    return 'http://localhost:3000'
  }
  
  // En production - utiliser l'URL actuelle
  return window.location.origin
}

const generateQRCode = () => {
  if (!qrCodeContainer.value || !gameCode.value) return
  
  // Nettoyer le conteneur
  qrCodeContainer.value.innerHTML = ''
  
  const baseUrl = getBaseUrl()
  gameUrl.value = `${baseUrl}/game?gameId=${gameCode.value}`
  
  // Créer le QR code avec l'API QR Server
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(gameUrl.value)}&bgcolor=FFFFFF&color=000000&margin=10`
  
  const img = document.createElement('img')
  img.src = qrCodeUrl
  img.alt = 'QR Code pour rejoindre la partie'
  img.className = 'rounded-lg shadow-sm'
  img.style.width = '120px'
  img.style.height = '120px'
  
  qrCodeContainer.value.appendChild(img)
}

// Lifecycle
onMounted(() => {
  gameCode.value = route.query.gameId || ''
  if (!gameCode.value) {
    router.push('/admin')
    return
  }

  if (!$socket.connected) {
    $socket.connect()
  }

  // Générer le QR code après le montage
  nextTick(() => {
    generateQRCode()
  })

  // Récupérer les infos de la room
  $socket.emit('get-room-info', gameCode.value)
  
  // Écouter les événements
  $socket.on('room-info', ({ room }) => {
    if (room) {
      players.value = room.players
    }
  })

  $socket.on('new-question', (question) => {
    currentQuestion.value = question
    timeRemaining.value = question.timeRemaining
    playersAnswered.value = 0
    showResults.value = false
    recentEliminatedPlayers.value = []
    
    // Réinitialiser l'état des joueurs
    players.value.forEach(player => {
      if (!player.eliminated) {
        player.hasAnswered = false
        player.lastPointChange = 0
      }
    })
  })

  $socket.on('time-update', ({ timeRemaining: time }) => {
    timeRemaining.value = time
  })

  $socket.on('player-answered', ({ playerId, totalAnswered }) => {
    playersAnswered.value = totalAnswered
    const player = players.value.find(p => p.id === playerId)
    if (player && !player.eliminated) {
      player.hasAnswered = true
    }
  })

  $socket.on('question-results', ({ results, eliminatedPlayers: newEliminated }) => {
    showResults.value = true
    
    if (newEliminated && newEliminated.length > 0) {
      recentEliminatedPlayers.value = newEliminated
      eliminatedPlayers.value = [...eliminatedPlayers.value, ...newEliminated]
    }
    
    // Mettre à jour les scores et les changements
    results.forEach(result => {
      const player = players.value.find(p => p.id === result.playerId)
      if (player) {
        player.score = result.newScore
        player.lastPointChange = result.pointChange
        player.eliminated = result.eliminated
      }
    })
  })

  $socket.on('game-ended', ({ finalScores: scores, winner: gameWinner, reason, eliminatedPlayers: finalEliminated }) => {
    gameEnded.value = true
    winner.value = gameWinner
    finalScores.value = scores
    gameEndReason.value = reason
    
    if (reason === 'elimination') {
      console.log('Partie terminée par élimination')
    }
  })

  $socket.on('player-joined', ({ players: allPlayers }) => {
    players.value = allPlayers
  })

  $socket.on('player-left', ({ players: remainingPlayers }) => {
    players.value = remainingPlayers
  })
})

onUnmounted(() => {
  $socket.off('room-info')
  $socket.off('new-question')
  $socket.off('time-update')
  $socket.off('player-answered')
  $socket.off('question-results')
  $socket.off('game-ended')
  $socket.off('player-joined')
  $socket.off('player-left')
})
</script>

<style scoped>
/* Animations */
.player-list-move,
.player-list-enter-active,
.player-list-leave-active {
  transition: all 0.5s ease;
}

.player-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.player-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.score-change-enter-active,
.score-change-leave-active {
  transition: all 0.3s ease;
}

.score-change-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.score-change-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}
</style>