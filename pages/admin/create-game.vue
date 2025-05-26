<template>
  <div class="flex flex-col items-center bg-gray-100">
    <h2 class="text-lg">Créer une partie</h2>
  </div>
  <div class="flex flex-col items-center mt-4">
    <button
      class="px-4 py-3 rounded-xl bg-blue-500 text-white text-lg"
      @click="createGame"
    >
      Créer une partie
    </button>
  </div>
</template>

<script>
function createGame() {}

function generateRandomChars() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  result = result.toUpperCase(); // Convertir en majuscules
  return result;
}

// Exemple d'utilisation
console.log(generateRandomChars()); // Ex: "aB3kL9"
console.log(generateRandomChars()); // Ex: "P2mX7q"
</script>
