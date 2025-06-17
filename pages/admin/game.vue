<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Tableau de bord - Partie en cours</h1>
        <div class="text-white">
          <span class="text-xl">Code: </span>
          <span class="text-2xl font-mono font-bold">{{ gameCode }}</span>
        </div>
      </div>

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
          {{ playersAnswered }}/{{ players.length }} joueurs ont répondu
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
                showResults && player.lastPointChange !== 0 ? 
                  (player.lastPointChange > 0 ? 'bg-green-100 animate-pulse' : 'bg-red-100 animate-pulse') : 
                  'bg-gray-100'
              ]"
            >
              <div class="flex items-center space-x-4">
                <!-- Position -->
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                     :class="getPositionClass(index)">
                  {{ index + 1 }}
                </div>
                
                <!-- Nom du joueur -->
                <div>
                  <p class="font-semibold text-lg">{{ player.name }}</p>
                  <p class="text-sm text-gray-500">{{ player.hasAnswered ? '✓ A répondu' : '⏳ En attente' }}</p>
                </div>
              </div>
              
              <!-- Score -->
              <div class="flex items-center space-x-4">
                <!-- Animation du changement de score -->
                <transition name="score-change">
                  <div v-if="showResults && player.lastPointChange !== 0" 
                       class="text-2xl font-bold"
                       :class="player.lastPointChange > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ player.lastPointChange > 0 ? '+1' : '-1' }}
                  </div>
                </transition>
                
                <!-- Score actuel -->
                <div class="text-3xl font-bold text-gray-800">
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
        <div class="text-xl mb-2">🏆 Gagnant: <span class="font-bold text-gold-600">{{ winner.playerName }}</span></div>
        <div class="text-lg">Score final: {{ winner.score }} points</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
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

// Computed
const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => b.score - a.score)
})

// Méthodes
const getPositionClass = (index) => {
  switch(index) {
    case 0: return 'bg-yellow-400 text-white'
    case 1: return 'bg-gray-400 text-white'
    case 2: return 'bg-orange-600 text-white'
    default: return 'bg-gray-300 text-gray-700'
  }
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
    
    // Réinitialiser l'état des joueurs
    players.value.forEach(player => {
      player.hasAnswered = false
      player.lastPointChange = 0
    })
  })

  $socket.on('time-update', ({ timeRemaining: time }) => {
    timeRemaining.value = time
  })

  $socket.on('player-answered', ({ playerId, totalAnswered }) => {
    playersAnswered.value = totalAnswered
    const player = players.value.find(p => p.id === playerId)
    if (player) {
      player.hasAnswered = true
    }
  })

  $socket.on('question-results', ({ results }) => {
    showResults.value = true
    
    // Mettre à jour les scores et les changements
    results.forEach(result => {
      const player = players.value.find(p => p.id === result.playerId)
      if (player) {
        player.score = result.newScore
        player.lastPointChange = result.pointChange
      }
    })
  })

  $socket.on('game-ended', ({ finalScores, winner: gameWinner }) => {
    gameEnded.value = true
    winner.value = gameWinner
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