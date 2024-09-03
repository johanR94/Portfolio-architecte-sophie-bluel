// Sélection des éléments du formulaire de login
const emailInput = document.querySelector('input[name="email"]');
const passwordInput = document.querySelector('input[name="password"]');
const loginButton = document.querySelector("#submit-login");
const loginForm = document.getElementById("loginForm");

// Création et ajout de l'élément pour le message d'erreur
const errorMessage = document.createElement("p");
errorMessage.style.display = "none";
errorMessage.style.color = "red";
errorMessage.style.textAlign = "center";
loginForm.appendChild(errorMessage);

// Gestion du clic sur le bouton de login
loginButton.addEventListener("click", async (event) => {
  event.preventDefault(); // Empêche la soumission du formulaire

  // Récupération des valeurs du formulaire
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Vérification des champs vides
  if (!email || !password) {
    afficherErreur("Veuillez remplir tous les champs");
    return;
  }

  // Tentative de connexion
  try {
    const token = await obtenirTokenUtilisateur(email, password);

    if (token) {
      // Si le token est reçu, on le stocke et on redirige l'utilisateur
      console.log("Token reçu :", token);
      localStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("token", token);
      masquerErreur();
      window.location.href = "./index.html"; // Redirection vers la page d'accueil
    }
  } catch (error) {
    // Gestion des erreurs
    afficherErreur(
      "Erreur lors de la tentative de connexion. Veuillez réessayer."
    );
    console.error("Échec de la connexion :", error);
  }
});

/**
 * Fonction pour obtenir le token de l'utilisateur via l'API
 * @param {string} email - L'adresse email de l'utilisateur
 * @param {string} password - Le mot de passe de l'utilisateur
 * @returns {Promise<string|null>} - Le token de l'utilisateur ou null en cas d'erreur
 */
async function obtenirTokenUtilisateur(email, password) {
  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Vérification de la réponse
    if (!response.ok) {
      if (response.status === 401) {
        afficherErreur("Erreur dans l'identifiant ou le mot de passe");
      } else {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }
    }

    // Traitement de la réponse JSON
    const data = await response.json();
    console.log("Données de réponse :", data);
    return data.token || null; // Retourne le token s'il est présent
  } catch (error) {
    console.error("Erreur lors de la requête de login :", error);
    throw error;
  }
}

/**
 * Fonction pour afficher un message d'erreur
 * @param {string} message - Le message d'erreur à afficher
 */
function afficherErreur(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

/**
 * Fonction pour masquer le message d'erreur
 */
function masquerErreur() {
  errorMessage.style.display = "none";
}
