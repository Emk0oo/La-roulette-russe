<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md">
      <!-- Logo/Titre -->
      <h1 class="text-4xl font-bold text-center text-gray-800 mb-10">
        Roulette Russe
      </h1>
      
      <!-- Formulaire de connexion -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <form @submit.prevent="handleLogin">
          <!-- Champ du login -->
          <div class="mb-6">
            <label for="username" class="block text-gray-700 text-sm font-medium mb-2">Identifiant</label>
            <input 
              id="username" 
              type="text" 
              v-model="form.username" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Votre identifiant"
              required
            />
          </div>
          
          <!-- Champ du mot de passe -->
          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-medium mb-2">Mot de passe</label>
            <input 
              id="password" 
              type="password" 
              v-model="form.password" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Votre mot de passe"
              required
            />
          </div>
          
          <!-- Bouton de connexion -->
          <button 
            type="submit" 
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Se connecter
          </button>
        </form>
        
        <!-- Lien supplémentaire (optionnel) -->
        <!-- <div class="mt-4 text-center">
          <p class="text-sm text-gray-600">
            Vous n'avez pas de compte ? 
            <a href="#" class="text-blue-600 hover:underline">S'inscrire</a>
          </p>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
const form = reactive({
  username: '',
  password: ''
});

const router = useRouter();

function goToWaitingRoom() {
  // Redirection vers la salle d'attente
  router.push('/waiting-room');
}

function goToCreateGame() {
  // Redirection vers la page de création de jeu
  router.push('/admin/create-game');
}

const handleLogin = () => {
  // Ici, vous pourriez implémenter la logique de connexion
  console.log('Tentative de connexion avec', form.username);
  
  // Pour l'instant, on affiche juste une alerte
  // alert(`Tentative de connexion avec l'identifiant : ${form.username}`);

  if(form.username === 'admin' && form.password === 'admin') {
    // Redirection vers la page d'administration
    goToCreateGame();
  } else {
    // Afficher un message d'erreur
    // alert('Identifiant ou mot de passe incorrect');
    goToWaitingRoom();
  }
};
</script>