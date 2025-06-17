<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
    <!-- En attente du début -->
    <div v-if="gameStatus === 'waiting'" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div class="text-6xl mb-4">🎮</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Bienvenue {{ playerName }}!</h2>
        <p class="text-gray-600 mb-4">Tu es connecté à la partie</p>
        <div class="bg-gray-100 rounded-lg p-4 mb-4">
          <p class="text-lg font-mono">{{ gameCode }}</p>
        </div>
        <p class="text-gray-500">En attente du lancement de la partie...</p>
        
        <!-- État de connexion -->
        <div class="mt-4 text-sm">
          État: <span :class="connected ? 'text-green-500' : 'text-red-500'">
            {{ connected ? 'Connecté' : 'Déconnecté' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Question en cours -->
    <div v-else-if="gameStatus === 'question' && currentQuestion" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <!-- Header avec score et timer -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-lg font-semibold">
            Score: <span class="text-2xl text-blue-600">{{ playerScore }}</span> points
          </div>
          <div class="text-lg font-semibold">
            Question {{ currentQuestion.questionNumber }}/{{ currentQuestion.totalQuestions }}
          </div>
          <div class="text-lg font-semibold">
            Temps: <span class="text-2xl" :class="timeRemaining <= 5 ? 'text-red-600 animate-pulse' : 'text-green-600'">
              {{ timeRemaining }}s
            </span>
          </div>
        </div>

        <!-- Question -->
        <h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">
          {{ currentQuestion.question }}
        </h2>

        <!-- Options de réponse -->
        <div class="grid grid-cols-2 gap-4">
          <button
              v-for="(option, index) in shuffledOptions"
              :key="index"
              @click="submitAnswer(index)"
              :disabled="hasAnswered"
              :class="[
                'p-6 rounded-lg font-semibold text-lg transition-all duration-300',
                hasAnswered && selectedAnswer === index
                  ? 'bg-blue-500 text-white scale-105 shadow-lg'
                  : hasAnswered
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gray-100 hover:bg-blue-100 hover:scale-105 cursor-pointer shadow-md'
              ]">
            {{ option }}
          </button>
        </div>

        <!-- Statut de réponse -->
        <div v-if="hasAnswered" class="mt-6 text-center">
          <p class="text-gray-600 text-lg">✓ Réponse enregistrée!</p>
          <p class="text-sm text-gray-500 mt-2">
            En attente de la fin du temps...
          </p>
        </div>
      </div>
    </div>

    <!-- Résultats de la question -->
    <div v-else-if="gameStatus === 'results' && questionResults" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
        <h2 class="text-2xl font-bold mb-6">Résultats</h2>
        
        <!-- Résultat personnel -->
        <div class="mb-8">
          <div v-if="myResult && myResult.isCorrect" class="text-green-600">
            <div class="text-6xl mb-2">✅</div>
            <p class="text-2xl font-bold">Bonne réponse!</p>
            <p class="text-lg mt-2">+1 point</p>
          </div>
          <div v-else class="text-red-600">
            <div class="text-6xl mb-2">❌</div>
            <p class="text-2xl font-bold">{{ myResult && myResult.answered ? 'Mauvaise réponse' : 'Pas de réponse' }}</p>
            <p class="text-lg mt-2">-1 point</p>
          </div>
        </div>

        <!-- Score actuel -->
        <div class="bg-gray-100 rounded-lg p-4 mb-6">
          <p class="text-lg text-gray-600">Ton score actuel</p>
          <p class="text-3xl font-bold text-gray-800">{{ playerScore }} points</p>
        </div>

        <!-- Compte à rebours -->
        <p class="text-gray-500">Prochaine question dans {{ countdownToNext }} secondes...</p>
      </div>
    </div>

    <!-- Fin de partie -->
    <div v-else-if="gameStatus === 'ended'" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
        <h2 class="text-3xl font-bold mb-6">Partie terminée!</h2>
        
        <!-- Message de victoire/défaite -->
        <div class="mb-6">
          <div v-if="isWinner" class="text-yellow-500">
            <div class="text-6xl mb-2">🏆</div>
            <p class="text-2xl font-bold">Félicitations!</p>
            <p class="text-lg">Tu as gagné!</p>
          </div>
          <div v-else class="text-blue-500">
            <div class="text-6xl mb-2">🎯</div>
            <p class="text-2xl font-bold">Bien joué!</p>
            <p class="text-lg">Tu es {{ playerPosition }}{{ getPositionSuffix(playerPosition) }}</p>
          </div>
        </div>
        
        <!-- Classement final -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Classement final</h3>
          <div class="space-y-2">
            <div
              v-for="(player, index) in finalScores"
              :key="player.playerId"
              :class="[
                'flex justify-between items-center p-3 rounded-lg',
                player.playerId === $socket.id ? 'bg-blue-100 font-bold' : 'bg-gray-100'
              ]"
            >
              <div class="flex items-center space-x-3">
                <span class="text-lg">
                  {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.` }}
                </span>
                <span>{{ player.playerName }}</span>
              </div>
              <span class="text-lg">{{ player.score }} pts</span>
            </div>
          </div>
        </div>

        <button
          @click="backToHome"
          class="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>

    <!-- Message d'erreur ou de déconnexion -->
    <div v-if="error" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 text-center">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Erreur</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="backToHome"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Retour à l'accueil
        </button>
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
const gameStatus = ref('waiting') // waiting, question, results, ended
const playerName = ref('')
const playerScore = ref(7)
const currentQuestion = ref(null)
const shuffledOptions = ref([])
const timeRemaining = ref(20)
const hasAnswered = ref(false)
const selectedAnswer = ref(null)
const questionResults = ref(null)
const myResult = ref(null)
const countdownToNext = ref(10)
const finalScores = ref([])
const connected = ref(false)
const error = ref('')

// Computed
const isWinner = computed(() => {
  if (!finalScores.value.length) return false
  return finalScores.value[0]?.playerId === $socket.id
})

const playerPosition = computed(() => {
  const index = finalScores.value.findIndex(player => player.playerId === $socket.id)
  return index + 1
})

// Méthodes
const submitAnswer = (answer) => {
  if (hasAnswered.value) return
  
  hasAnswered.value = true
  selectedAnswer.value = answer
  
  $socket.emit('submit-answer', {
    gameId: gameCode.value,
    answer: answer
  })
}

const backToHome = () => {
  router.push('/')
}

const getPositionSuffix = (position) => {
  if (position === 1) return 'er'
  return 'ème'
}

function shuffleArray(array) {
  return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
}


// Lifecycle
onMounted(() => {
  gameCode.value = route.query.gameId || ''
  playerName.value = localStorage.getItem('playerName') || 'Joueur'
  
  if (!gameCode.value) {
    router.push('/')
    return
  }

  if (!$socket.connected) {
    $socket.connect()
  }

  connected.value = $socket.connected

  // Événements de connexion
  $socket.on('connect', () => {
    connected.value = true
    // Rejoindre la room automatiquement à la connexion
    $socket.emit('join-room', {
      gameId: gameCode.value,
      playerName: playerName.value
    })
  })

  $socket.on('disconnect', () => {
    connected.value = false
    error.value = 'Connexion perdue avec le serveur'
  })

  // Gestion des erreurs
  $socket.on('join-error', (message) => {
    error.value = message
  })

  $socket.on('host-disconnected', () => {
    error.value = 'L\'hôte de la partie s\'est déconnecté'
  })

  // Événements de jeu
  $socket.on('joined-room', ({ players }) => {
    gameStatus.value = 'waiting'
    error.value = ''
  })

  $socket.on('game-started-player', () => {
    gameStatus.value = 'waiting'
  })

  $socket.on('new-question', (question) => {
    gameStatus.value = 'question'
    currentQuestion.value = question
    timeRemaining.value = question.timeRemaining
    hasAnswered.value = false
    selectedAnswer.value = null
    questionResults.value = null
    myResult.value = null

    shuffledOptions.value = shuffleArray(question.options)
  })

  $socket.on('time-update', ({ timeRemaining: time }) => {
    timeRemaining.value = time
  })

  $socket.on('question-results', ({ correctAnswer, results }) => {
    gameStatus.value = 'results'
    questionResults.value = { correctAnswer, results }
    
    // Trouver mon résultat
    myResult.value = results.find(r => r.playerId === $socket.id)
    if (myResult.value) {
      playerScore.value = myResult.value.newScore
    }
    
    // Compte à rebours pour la prochaine question
    countdownToNext.value = 10
    const countdown = setInterval(() => {
      countdownToNext.value--
      if (countdownToNext.value <= 0) {
        clearInterval(countdown)
      }
    }, 1000)
  })

  $socket.on('game-ended', ({ finalScores: scores }) => {
    gameStatus.value = 'ended'
    finalScores.value = scores
  })

  // Si déjà connecté, rejoindre immédiatement
  if (connected.value) {
    $socket.emit('join-room', {
      gameId: gameCode.value,
      playerName: playerName.value
    })
  }
})

onUnmounted(() => {
  // Nettoyer tous les listeners
  $socket.off('connect')
  $socket.off('disconnect')
  $socket.off('join-error')
  $socket.off('host-disconnected')
  $socket.off('joined-room')
  $socket.off('game-started-player')
  $socket.off('new-question')
  $socket.off('time-update')
  $socket.off('question-results')
  $socket.off('game-ended')
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}
</style>