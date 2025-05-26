<template>
  <div class="flex flex-col items-center bg-gray-100 min-h-screen py-8">
    <h2 class="text-3xl font-bold mb-8">Créer une partie</h2>
    
    <div class="flex flex-col items-center">
      <button
        class="px-6 py-4 rounded-xl bg-blue-500 text-white text-xl font-semibold cursor-pointer hover:bg-blue-600 transition-colors duration-300"
        @click="createGame"
      >
        Créer une partie
      </button>

      <div v-if="gameId" class="mt-6 p-4 bg-white rounded-lg shadow">
        <p class="text-gray-700 text-lg">ID de la partie : <span class="font-bold">{{ gameId }}</span></p>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const { $socket } = useNuxtApp();

const gameId = ref(null);
const error = ref(null);

onMounted(() => {
  // Se connecter au serveur WebSocket
  $socket.connect();

  // Écouter la confirmation de création de room
  $socket.on('room-created', ({ gameId: roomId }) => {
    console.log('Room créée avec succès:', roomId);
    // Rediriger vers le dashboard
    router.push(`/admin/dashboard?gameId=${roomId}`);
  });

  // Gérer les erreurs
  $socket.on('room-error', (errorMessage) => {
    error.value = errorMessage;
  });
});

onUnmounted(() => {
  $socket.off('room-created');
  $socket.off('room-error');
});

const generateRandomChars = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  
  return result;
};

const createGame = () => {
  gameId.value = generateRandomChars();
  console.log("Création de la partie avec ID:", gameId.value);
  
  // Émettre l'événement pour créer la room
  $socket.emit('create-room', gameId.value);
};
</script>