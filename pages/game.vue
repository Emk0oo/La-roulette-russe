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

    <!-- Joueur éliminé -->
    <div v-else-if="gameStatus === 'eliminated'" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
        <!-- Animation d'élimination -->
        <div class="mb-6">
          <div class="text-8xl mb-4 animate-bounce">💀</div>
          <h2 class="text-3xl font-bold text-red-600 mb-2">ÉLIMINÉ!</h2>
          <p class="text-xl text-gray-700 mb-4">Tu as atteint 0 points</p>
        </div>

        <!-- Message d'élimination -->
        <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-red-800 mb-2">🚨 Game Over</h3>
          <p class="text-red-700">
            Tes points sont tombés à zéro. Tu es éliminé de cette partie mais tu peux continuer à regarder les autres joueurs!
          </p>
        </div>

        <!-- Statistiques personnelles -->
        <div class="bg-gray-100 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-gray-800 mb-2">Tes statistiques</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-600">Questions répondues</p>
              <p class="font-bold">{{ questionsAnswered }}</p>
            </div>
            <div>
              <p class="text-gray-600">Bonnes réponses</p>
              <p class="font-bold text-green-600">{{ correctAnswers }}</p>
            </div>
          </div>
        </div>

        <!-- Spectateur mode -->
        <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <h4 class="font-semibold text-blue-800 mb-2">👀 Mode Spectateur</h4>
          <p class="text-blue-700 text-sm">
            Tu peux maintenant regarder le reste de la partie en tant que spectateur.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-4 justify-center">
          <button
            @click="watchAsSpectator"
            class="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            👀 Regarder la suite
          </button>
          <button
            @click="backToHome"
            class="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
          >
            🏠 Retour à l'accueil
          </button>
        </div>
      </div>
    </div>

    <!-- Mode spectateur -->
    <div v-else-if="gameStatus === 'spectator'" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <!-- Header spectateur -->
        <div class="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-6 text-center">
          <h2 class="text-xl font-bold text-blue-800 mb-2">👀 Mode Spectateur</h2>
          <p class="text-blue-700">Tu regardes la partie en cours...</p>
        </div>

        <!-- Question actuelle pour spectateur -->
        <div v-if="currentQuestion" class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <div class="text-lg font-semibold">
              Question {{ currentQuestion.questionNumber }}/{{ currentQuestion.totalQuestions }}
            </div>
            <div class="text-lg font-semibold">
              Temps: <span class="text-2xl" :class="timeRemaining <= 5 ? 'text-red-600 animate-pulse' : 'text-green-600'">
                {{ timeRemaining }}s
              </span>
            </div>
          </div>

          <h3 class="text-xl font-bold text-gray-800 mb-4 text-center">
            {{ currentQuestion.question }}
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="p-4 rounded-lg bg-gray-100 text-center opacity-60"
            >
              {{ option }}
            </div>
          </div>
        </div>

        <!-- Joueurs restants -->
        <div v-if="activePlayers.length > 0" class="mb-6">
          <h4 class="font-semibold text-gray-800 mb-3">Joueurs encore en vie</h4>
          <div class="space-y-2">
            <div
              v-for="player in activePlayers"
              :key="player.id"
              class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <span class="font-medium">{{ player.name }}</span>
              <span class="font-bold text-blue-600">{{ player.score }} pts</span>
            </div>
          </div>
        </div>

        <button
          @click="backToHome"
          class="w-full px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
        >
          Quitter le spectateur
        </button>
      </div>
    </div>

    <!-- Question en cours (joueur actif) -->
    <div v-else-if="gameStatus === 'question' && currentQuestion" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <!-- Header avec score et timer -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-lg font-semibold">
            Score: <span class="text-2xl" :class="playerScore <= 1 ? 'text-red-600 animate-pulse' : 'text-blue-600'">
              {{ playerScore }}
            </span> points
            <div v-if="playerScore <= 1" class="text-xs text-red-600 font-bold mt-1">
              ⚠️ ATTENTION! Une mauvaise réponse = ÉLIMINATION!
            </div>
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
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            @click="submitAnswer(index)"
            :disabled="hasAnswered"
            :class="[
              'p-6 rounded-lg font-semibold text-lg transition-all duration-300',
              hasAnswered && selectedAnswer === index
                ? 'bg-blue-500 text-white scale-105 shadow-lg'
                : hasAnswered
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
                : playerScore <= 1
                ? 'bg-red-50 border-2 border-red-200 hover:bg-red-100 hover:scale-105 cursor-pointer shadow-md'
                : 'bg-gray-100 hover:bg-blue-100 hover:scale-105 cursor-pointer shadow-md'
            ]"
          >
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
            <div v-if="playerScore === 0" class="mt-4 p-4 bg-red-100 border-2 border-red-300 rounded-lg">
              <p class="text-red-800 font-bold">⚠️ Tu seras éliminé à la fin de ce résultat!</p>
            </div>
          </div>
        </div>

        <!-- Score actuel -->
        <div class="bg-gray-100 rounded-lg p-4 mb-6">
          <p class="text-lg text-gray-600">Ton score actuel</p>
          <p class="text-3xl font-bold" :class="playerScore === 0 ? 'text-red-600' : 'text-gray-800'">
            {{ playerScore }} points
          </p>
        </div>

        <!-- Éliminations annoncées -->
        <div v-if="eliminatedInThisRound.length > 0" class="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <h4 class="font-bold text-red-800 mb-2">Joueurs éliminés ce tour :</h4>
          <div class="space-y-1">
            <p v-for="eliminated in eliminatedInThisRound" :key="eliminated.playerId" class="text-red-700">
              💀 {{ eliminated.playerName }}
            </p>
          </div>
        </div>

        <!-- Compte à rebours -->
        <p class="text-gray-500">
          {{ playerScore === 0 ? 'Élimination dans' : 'Prochaine question dans' }} {{ countdownToNext }} secondes...
        </p>
      </div>
    </div>

    <!-- Fin de partie -->
    <div v-else-if="gameStatus === 'ended'" class="flex items-center justify-center min-h-screen">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center">
        <h2 class="text-3xl font-bold mb-6">Partie terminée!</h2>
        
        <!-- Message selon le statut du joueur -->
        <div class="mb-6">
          <!-- Joueur éliminé - Priorité absolue -->
          <div v-if="wasEliminated" class="text-red-500">
            <div class="text-8xl mb-4 animate-bounce">💀</div>
            <p class="text-3xl font-bold">Tu as été éliminé!</p>
            <p class="text-lg mt-2">Game Over - 0 points</p>
            <div class="bg-red-100 border-2 border-red-300 rounded-lg p-4 mt-4">
              <p class="text-red-800 font-bold">Tu es tombé à 0 points et as été éliminé de la partie</p>
            </div>
          </div>
          <!-- Gagnant - Seulement si pas éliminé -->
          <div v-else-if="isWinner" class="text-yellow-500">
            <div class="text-6xl mb-2">🏆</div>
            <p class="text-2xl font-bold">Félicitations!</p>
            <p class="text-lg">Tu as gagné!</p>
          </div>
          <!-- Autres joueurs - Seulement si pas éliminé -->
          <div v-else class="text-blue-500">
            <div class="text-6xl mb-2">🎯</div>
            <p class="text-2xl font-bold">Bien joué!</p>
            <p class="text-lg">Tu es {{ playerPosition }}{{ getPositionSuffix(playerPosition) }}</p>
          </div>
        </div>
        
        <!-- Raison de fin -->
        <div v-if="gameEndReason === 'elimination'" class="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
          <p class="text-yellow-800 font-medium">
            🚨 Partie terminée par élimination
          </p>
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
                player.playerId === $socket.id ? 'bg-blue-100 font-bold border-2 border-blue-300' : 'bg-gray-100',
                player.eliminated ? 'opacity-60' : ''
              ]"
            >
              <div class="flex items-center space-x-3">
                <span class="text-lg">
                  {{ player.eliminated ? '💀' : (index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`) }}
                </span>
                <span :class="player.eliminated ? 'line-through text-gray-500' : ''">
                  {{ player.playerName }}
                  {{ player.playerId === $socket.id ? ' (Toi)' : '' }}
                </span>
                <span v-if="player.eliminated" class="text-red-500 text-xs">(Éliminé)</span>
              </div>
              <span class="text-lg" :class="player.eliminated ? 'text-red-600' : ''">
                {{ player.score }} pts
              </span>
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
const gameStatus = ref('waiting') // waiting, question, results, ended, eliminated, spectator
const playerName = ref('')
const playerScore = ref(7)
const currentQuestion = ref(null)
const timeRemaining = ref(20)
const hasAnswered = ref(false)
const selectedAnswer = ref(null)
const questionResults = ref(null)
const myResult = ref(null)
const countdownToNext = ref(10)
const finalScores = ref([])
const connected = ref(false)
const error = ref('')
const wasEliminated = ref(false)
const questionsAnswered = ref(0)
const correctAnswers = ref(0)
const eliminatedInThisRound = ref([])
const activePlayers = ref([])
const gameEndReason = ref('')

// Computed
const isWinner = computed(() => {
  if (!finalScores.value.length || wasEliminated.value) return false
  const winner = finalScores.value.find(player => !player.eliminated)
  return winner?.playerId === $socket.id
})

const playerPosition = computed(() => {
  if (wasEliminated.value) {
    // Pour les joueurs éliminés, calculer la position parmi tous les joueurs
    const index = finalScores.value.findIndex(player => player.playerId === $socket.id)
    return index + 1
  }
  // Pour les joueurs actifs, calculer la position parmi les non-éliminés
  const activePlayers = finalScores.value.filter(player => !player.eliminated)
  const index = activePlayers.findIndex(player => player.playerId === $socket.id)
  return index + 1
})

// Méthodes
const submitAnswer = (answer) => {
  if (hasAnswered.value) return
  
  hasAnswered.value = true
  selectedAnswer.value = answer
  questionsAnswered.value++
  
  $socket.emit('submit-answer', {
    gameId: gameCode.value,
    answer: answer
  })
}

const watchAsSpectator = () => {
  gameStatus.value = 'spectator'
}

const backToHome = () => {
  router.push('/')
}

const getPositionSuffix = (position) => {
  if (position === 1) return 'er'
  return 'ème'
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
    activePlayers.value = players
  })

  $socket.on('game-started-player', () => {
    gameStatus.value = 'waiting'
  })

  $socket.on('new-question', (question) => {
    // Ne pas changer le status si le joueur est éliminé
    if (gameStatus.value !== 'eliminated') {
      gameStatus.value = 'question'
    }
    currentQuestion.value = question
    timeRemaining.value = question.timeRemaining
    hasAnswered.value = false
    selectedAnswer.value = null
    questionResults.value = null
    myResult.value = null
    eliminatedInThisRound.value = []
  })

  $socket.on('time-update', ({ timeRemaining: time }) => {
    timeRemaining.value = time
  })

  $socket.on('question-results', ({ correctAnswer, results, eliminatedPlayers }) => {
    questionResults.value = { correctAnswer, results }
    
    // Trouver mon résultat
    myResult.value = results.find(r => r.playerId === $socket.id)
    if (myResult.value) {
      playerScore.value = myResult.value.newScore
      if (myResult.value.isCorrect) {
        correctAnswers.value++
      }
      
      // Vérifier si je suis éliminé
      if (myResult.value.eliminated || myResult.value.newScore <= 0) {
        wasEliminated.value = true
        // Attendre la fin du compte à rebours avant de passer en mode éliminé
        setTimeout(() => {
          gameStatus.value = 'eliminated'
        }, 10000) // 10 secondes pour voir les résultats
      }
    }
    
    // Joueurs éliminés ce tour
    if (eliminatedPlayers && eliminatedPlayers.length > 0) {
      eliminatedInThisRound.value = eliminatedPlayers
    }
    
    // Mettre à jour la liste des joueurs actifs
    activePlayers.value = results.filter(r => !r.eliminated).map(r => ({
      id: r.playerId,
      name: r.playerName,
      score: r.newScore
    }))
    
    // Ne changer le status que si le joueur n'est pas éliminé
    if (gameStatus.value !== 'eliminated') {
      gameStatus.value = 'results'
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

  $socket.on('game-ended', ({ finalScores: scores, winner, reason }) => {
    gameStatus.value = 'ended'
    finalScores.value = scores
    gameEndReason.value = reason
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

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out infinite;
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>