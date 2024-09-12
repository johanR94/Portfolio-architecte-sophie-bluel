// Récupération des éléments DOM
const portfolio = document.getElementById("portfolio"); // Section des projets
const gallery = document.querySelector(".gallery"); // Récuperation de la gallery
const editAdminButton = document.querySelector(".modifier"); // Permet l'ouvertur de la modal
const logOut = document.querySelector(".logOut"); //Déconnexion
const login = document.querySelector(".logIn"); //Connexion
const BannerAdmin = document.querySelector(".administrateur"); //bannière admin
const filter = document.querySelector(".filter"); //Div des bouttons de filtrage
const categorySelect = document.getElementById("categorie"); //Sélecteur de catégorie

// Récupération des travaux de l'API
async function fetchWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
  return response.json();
}

// Initialisation des données
let works = [];

// function initialisation
async function init() {
  try {
    works = await fetchWorks();
    showWork(0);
    miniaturePicture();
    setupEventListeners();
    checkAdminMode();
  } catch (error) {
    const errorLoad = document.createElement("p");
    errorLoad.innerHTML = `Erreur de connection au serveur veuillez patientez`;
    errorLoad.classList.add("errorLoad");
    portfolio.appendChild(errorLoad);
    console.error("Erreur lors de l'initialisation :", error);
  }
}

// Création des filtres
async function createFilters() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();

    // Création du bouton "Tous"
    const allButton = document.createElement("button");
    allButton.innerText = "Tous";
    allButton.dataset.id = 0; // ID 0 pour afficher tous les projets
    allButton.classList.add("btn-selected"); // Le bouton "Tous" est sélectionné par défaut
    filter.appendChild(allButton);

    // Création des boutons pour chaque catégorie récupérée
    categories.forEach((category) => {
      const buttonElement = document.createElement("button");
      buttonElement.innerText = category.name;
      buttonElement.dataset.id = category.id;
      buttonElement.classList.add("btn-notSelected"); // Tous les autres boutons ne sont pas sélectionnés
      filter.appendChild(buttonElement);
    });

    // Écoute des clics sur les boutons
    document.querySelectorAll(".filter button").forEach((button) => {
      button.addEventListener("click", filterWorks);
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
  }
}

// Affichage des travaux filtrés
function showWork(categoryId) {
  gallery.innerHTML = "";
  works.forEach((element) => {
    if (categoryId === 0 || element.categoryId === categoryId) {
      const figure = document.createElement("figure");
      figure.innerHTML = `<img src="${element.imageUrl}" /><figcaption>${element.title}</figcaption>`;
      gallery.appendChild(figure);
    }
  });
}

// Gestion du filtrage des travaux
function filterWorks(e) {
  const categoryId = parseInt(e.currentTarget.dataset.id, 10);
  document.querySelectorAll(".filter button").forEach((button) => {
    button.classList.toggle("btn-selected", button === e.currentTarget);
    button.classList.toggle("btn-notSelected", button !== e.currentTarget);
  });
  //rappel de la fonction selon le bouton cliquer
  showWork(categoryId);
}

// Gestion du mode administrateur
function checkAdminMode() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  // Fonction utilitaire pour mettre à jour la visibilité d'un élément
  const setElementVisibility = (element, displayStyle) => {
    if (element) {
      element.style.display = displayStyle;
    }
  };
  // Définir la visibilité en fonction de l'état de connexion
  const updateVisibility = (isAdmin) => {
    setElementVisibility(BannerAdmin, isAdmin ? "flex" : "none");
    setElementVisibility(editAdminButton, isAdmin ? "inline" : "none");
    setElementVisibility(filter, isAdmin ? "none" : "flex");
    setElementVisibility(logOut, isAdmin ? "block" : "none");
    setElementVisibility(login, isAdmin ? "none" : "block");
  };
  // Initialiser la visibilité selon l'état de connexion actuel
  updateVisibility(isLoggedIn);
  // Si l'utilisateur est connecté, gérer la déconnexion
  if (logOut) {
    logOut.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn"); // Supprimer l'élément isLoggedIn
      updateVisibility(false); // Mettre à jour la visibilité une fois déconnecté
    });
  }
}

// Fonction utilitaire pour la gestion de la visibilité des éléments
function setVisibility(elements) {
  elements.forEach(([el, style]) => {
    if (el) el.style.display = style;
  });
}

// Lancement de l'initialisation
init();
createFilters();
