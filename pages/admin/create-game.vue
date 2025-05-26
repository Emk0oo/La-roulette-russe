<template>
  <div class="flex flex-col items-center bg-gray-100">
    <h2 class="text-lg">Créer une partie</h2>
  </div>
  <div class="flex flex-col items-center mt-4">
    <button
      class="px-4 py-3 rounded-xl bg-blue-500 text-white text-lg cursor-pointer hover:bg-blue-600 transition-colors duration-300"
      @click="createGame"
    >
      Créer une partie
    </button>

    <div v-if="gameId != null" class="mt-4">
      <p class="text-gray-700">ID de la partie : {{ gameId }}</p>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();

let gameId = ref(null);

const generateRandomChars = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  result = result.toUpperCase(); // Convertir en majuscules
  return result;
};

const createGame = () => {
   gameId = generateRandomChars();
  console.log("Game ID:", gameId);
  goToDashboard();

};

const goToDashboard = () => {
  console.log("Navigating to dashboard");
  router.push("/admin/dashboard?gameId=" + gameId);
};
</script>
