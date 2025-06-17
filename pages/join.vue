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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="gameCode = gameCode.toUpperCase()"
          >
        </div>

        <!-- Section photo avec condition v-if/v-else -->
        <div class="space-y-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ta photo</label>

          <!-- Photo déjà prise -->
          <div v-if="photo" class="relative w-28 h-28 mx-auto rounded-full shadow-lg bg-white flex items-center justify-center">
            <img :src="photo" alt="Photo capturée" class="w-24 h-24 object-cover rounded-full">
            <button
                @click="restartCamera"
                class="absolute top-1 right-1 bg-gray-200 p-1 rounded-full shadow hover:bg-gray-300"
            >
              <span class="text-gray-700 text-xs">✕</span>
            </button>
          </div>

          <!-- Capture de photo -->
          <div v-else class="relative w-28 h-28 mx-auto rounded-full shadow-lg bg-white flex items-center justify-center">
            <video ref="videoRef" autoplay class="w-24 h-24 object-cover rounded-full bg-gray-100"></video>
            <button
                @click="capturePhoto"
                class="absolute bottom-1 bg-blue-500 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition"
            >
              📸
            </button>
          </div>

          <p class="text-sm text-gray-500 mt-2 text-center">La photo est optionnelle.</p>
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
      </div>

      <!-- État connecté -->
      <div v-else class="text-center">
        <img v-if="photo" :src="photo" alt="Photo du joueur" class="w-24 h-24 rounded-full mx-auto mb-4">
        <div v-else class="text-6xl mb-4">{{ playerEmoji }}</div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Bienvenue {{ playerName }}!</h2>
        <p class="text-gray-600 mb-4">Tu es connecté à la partie</p>
        <div class="bg-gray-100 rounded-lg p-4 mb-4">
          <p class="text-lg font-mono">{{ gameCode }}</p>
        </div>
        <p class="text-gray-500 mb-4">En attente du lancement de la partie...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { $socket } = useNuxtApp();
const router = useRouter();

const gameCode = ref('');
const playerName = ref('');
const joined = ref(false);
const error = ref('');
const photo = ref(null); // Pour stocker l'image capturée en base64
const playerEmoji = ref('🎮');
const videoRef = ref(null); // Référence au tag <video>
const stream = ref(null); // Stocke le flux vidéo

// Démarrer la caméra
const startCamera = async () => {
  try {
    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
    error.value = ''; // Réinitialiser les erreurs si tout fonctionne
  } catch (err) {
    console.error('Erreur lors de l\'accès à la caméra:', err);
    if (err.name === 'NotAllowedError') {
      error.value = 'Vous devez autoriser l\'accès à la caméra pour capturer une photo.';
    } else if (err.name === 'NotFoundError') {
      error.value = 'Aucune caméra n\'a été trouvée sur cet appareil.';
    } else {
      error.value = 'Une erreur inattendue s\'est produite lors de l\'accès à la caméra.';
    }
  }
};

// Capturer une photo
const capturePhoto = () => {
  const canvas = document.createElement('canvas');
  const video = videoRef.value;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  photo.value = canvas.toDataURL('image/png'); // Convertir l'image en base64

  // Arrêter le flux vidéo après capture
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
    stream.value = null;
  }
};

// Relancer la caméra après suppression de la photo
const restartCamera = () => {
  photo.value = null; // Réinitialiser la photo
  startCamera(); // Relancer la caméra
};

// Rejoindre une partie
const joinGame = () => {
  if (!gameCode.value || !playerName.value) {
    error.value = 'Merci de remplir tous les champs obligatoires.';
    return;
  }


  const payload = {
    gameId: gameCode.value,
    playerName: playerName.value,
  };



  localStorage.setItem('playerName', playerName.value);

  $socket.emit('join-room', payload);
};

// Démarrer la caméra au montage du composant
onMounted(() => {
  if (!$socket.connected) {
    $socket.connect();
  }
  startCamera();
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
});
</script>