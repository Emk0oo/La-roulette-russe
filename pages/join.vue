<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Rejoindre une partie</h1>
      
      <div v-if="!joined" class="space-y-6">
        <!-- Code de partie -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Code de la partie</label>
          <input
            v-model="gameCode"
            type="text"
            maxlength="6"
            placeholder="ABC123"
            :class="[
              'w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500',
              fromQrCode ? 'bg-green-50 border-green-300' : ''
            ]"
            @input="gameCode = gameCode.toUpperCase()"
          >
          <p v-if="fromQrCode" class="text-sm text-green-600 mt-1 text-center">
            ✅ Code détecté automatiquement
          </p>
        </div>
        
        <!-- Nom du joueur -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ton nom</label>
          <input
            v-model="playerName"
            type="text"
            placeholder="Entre ton nom"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="joinGame"
            ref="playerNameInput"
          >
        </div>
        
        <!-- Bouton rejoindre -->
        <button
          @click="joinGame"
          :disabled="!gameCode || !playerName"
          class="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Rejoindre la partie
        </button>
        
        <!-- Message d'erreur -->
        <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-lg text-center">
          {{ error }}
        </div>

        <!-- Instructions pour scanner QR -->
        <div v-if="!fromQrCode" class="text-center">
          <p class="text-sm text-gray-500">
            💡 Tu peux aussi scanner le QR code sur l'écran de l'organisateur
          </p>
        </div>
      </div>
      
      <!-- État connecté -->
      <div v-else class="text-center">
        <div class="text-6xl mb-4">{{ playerEmoji }}</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Bienvenue {{ playerName }}!</h2>
        <p class="text-gray-600 mb-4">Tu es connecté à la partie</p>
        <div class="bg-gray-100 rounded-lg p-4 mb-4">
          <p class="text-lg font-mono">{{ gameCode }}</p>
        </div>
        <p class="text-gray-500">En attente du lancement de la partie...</p>
        
        <!-- Indicateur que c'est venu du QR code -->
        <div v-if="fromQrCode" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-700">
            📱 Connexion via QR code réussie !
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $socket } = useNuxtApp()
const router = useRouter()
const route = useRoute()

const gameCode = ref('')
const playerName = ref('')
const joined = ref(false)
const error = ref('')
const playerEmoji = ref('🎮')
const fromQrCode = ref(false)
const playerNameInput = ref(null)

onMounted(() => {
  // Vérifier si un gameId est passé en paramètre d'URL
  const gameIdFromUrl = route.query.gameId
  if (gameIdFromUrl) {
    gameCode.value = gameIdFromUrl.toString().toUpperCase()
    fromQrCode.value = true
    
    // Mettre le focus sur le champ nom du joueur pour une meilleure UX
    nextTick(() => {
      if (playerNameInput.value) {
        playerNameInput.value.focus()
      }
    })
  }

  // Récupérer le nom du joueur depuis localStorage s'il existe
  const savedPlayerName = localStorage.getItem('playerName')
  if (savedPlayerName) {
    playerName.value = savedPlayerName
  }

  if (!$socket.connected) {
    $socket.connect()
  }
  
  // Écouter la confirmation de connexion
  $socket.on('joined-room', ({ gameId, players }) => {
    console.log('Rejoint la room avec succès')
    joined.value = true
    error.value = ''
    
    // Générer un emoji pour le joueur
    const emojis = ['🦊', '🐸', '🦁', '🐼', '🐨', '🐯', '🦄', '🐧', '🦉', '🐙']
    playerEmoji.value = emojis[Math.floor(Math.random() * emojis.length)]
  })
  
  // Écouter les erreurs
  $socket.on('join-error', (errorMessage) => {
    error.value = errorMessage
  })
  
  // Écouter le démarrage de la partie
  $socket.on('game-started-player', ({ gameId }) => {
    console.log('La partie commence! (Joueur)')
    // Les joueurs vont vers /game
    router.push(`/game?gameId=${gameId}`)
  })
  
  // Écouter la déconnexion de l'hôte
  $socket.on('host-disconnected', () => {
    alert('L\'hôte s\'est déconnecté. La partie est annulée.')
    joined.value = false
    gameCode.value = ''
    error.value = 'La partie a été annulée'
  })
})

onUnmounted(() => {
  $socket.off('joined-room')
  $socket.off('join-error')
  $socket.off('game-started-player')
  $socket.off('host-disconnected')
})

const joinGame = () => {
  if (!gameCode.value || !playerName.value) {
    error.value = 'Merci de remplir tous les champs'
    return
  }
  
  // Sauvegarder le nom du joueur
  localStorage.setItem('playerName', playerName.value)
  
  console.log('Tentative de connexion à la partie:', gameCode.value)
  $socket.emit('join-room', {
    gameId: gameCode.value,
    playerName: playerName.value
  })
}
</script>