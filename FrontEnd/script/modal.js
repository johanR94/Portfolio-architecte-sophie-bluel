// Sélection des éléments du DOM liés à la modal et au formulaire d'ajout de nouveaux travaux
const submitButton = document.getElementById("modalFormSubmit"); // Bouton de soumission du formulaire d'ajout
const modalForm = document.querySelector(".modal-form"); // Formulaire d'ajout d'un nouveau travail
const miniatureShow = document.querySelector(".miniature"); // Section d'affichage des miniatures dans la modal
const closeIcon = document.querySelector(".fa-x"); // Icône de fermeture de la modal
const pictureInput = document.getElementById("picture-input"); // Input pour le fichier image
const titleInput = document.getElementById("title"); // Input pour le titre du travail
const modalShow = document.querySelector(".modal-show"); // Section principale de la modal
const modalReturn = document.querySelector(".fa-arrow-left"); // Flèche de retour dans la modal
const modalBackground = document.querySelector(".modalBackground"); // Arrière-plan de la modal
const modal = document.querySelector(".modal"); // Élément principal de la modal
const btnModalMini = document.querySelector(".btn-add-picture"); // Bouton pour afficher la première modal
const token = sessionStorage.getItem("token"); // Récupération du token pour l'authentification des requêtes API

// Fonction d'affichage des miniatures dans la modal
function miniaturePicture() {
  miniatureShow.innerHTML = ""; // Vider les miniatures existantes
  works.forEach((element) => {
    // Création de l'élément figure pour chaque miniature
    const figureMini = document.createElement("figure");
    figureMini.dataset.id = element.id;
    figureMini.innerHTML = ` 
      <img src="${element.imageUrl}" style="width: 76px; height: 102px;" />
      <span class="btn-delet"><i class="fa-solid fa-trash-can"></i></span>
    `;
    miniatureShow.appendChild(figureMini); // Ajouter la figure à la section des miniatures

    // Ajout de l'événement de suppression d'image
    const deleteButton = figureMini.querySelector(".btn-delet"); // Sélectionner le bouton de suppression pour chaque miniature
    if (deleteButton) {
      deleteButton.addEventListener("click", (e) => {
        if (confirm("Voulez-vous vraiment supprimer cette image ?")) {
          deleteImage(element.id, figureMini); // Appel de la fonction de suppression d'image
        }
      });
    }
  });
}

// Fonction pour supprimer une image
async function deleteImage(imageId, figureElement) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${imageId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Authentification avec le token
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }

    figureElement.remove(); // Retirer l'élément du DOM après suppression réussie
    // Mise à jour des travaux après la suppression

    works = works.filter((work) => work.id !== imageId); // Supprimer le travail de la liste des travaux
    miniaturePicture();
    showWork(0);
    closeModal();
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image :", error);
    alert(
      "Une erreur est survenue lors de la suppression. Veuillez réessayer."
    );
  }
}

// Gestion de l'affichage et de la navigation dans la modal
function setupEventListeners() {
  if (editAdminButton) {
    editAdminButton.addEventListener("click", (e) => {
      modal.style.display = "flex"; // Afficher la modal
      modalBackground.style.display = "block"; // Afficher l'arrière-plan de la modal
    });
  }

  if (closeIcon) closeIcon.addEventListener("click", closeModal); // Fermer la modal au clic sur l'icône de fermeture
  if (modalBackground) modalBackground.addEventListener("click", closeModal); // Fermer la modal au clic sur l'arrière-plan

  if (btnModalMini) {
    btnModalMini.addEventListener("click", (e) => {
      modalShow.style.display = "none"; // Cacher la section principale de la modal
      modalForm.style.display = "flex"; // Afficher le formulaire d'ajout
      modalReturn.style.visibility = "visible"; // Afficher la flèche de retour
    });
  }

  if (modalReturn) {
    modalReturn.addEventListener("click", (e) => {
      modalShow.style.display = "flex"; // Réafficher la section principale de la modal
      modalForm.style.display = "none"; // Cacher le formulaire d'ajout
      modalReturn.style.visibility = "hidden"; // Cacher la flèche de retour
    });
  }

  addWork(); // Initialiser la gestion de l'ajout de travaux
}

// Fonction pour fermer la modal
function closeModal() {
  modal.style.display = "none"; // Cacher la modal
  modalBackground.style.display = "none"; // Cacher l'arrière-plan de la modal
  modalForm.reset(); // Réinitialiser le formulaire
}

// Fonction pour ajouter un nouveau travail
function addWork() {
  // Vérification de la validité du formulaire
  function validateForm() {
    const isFormValid =
      pictureInput.files.length > 0 &&
      titleInput.value.trim() &&
      categorySelect.value > 0;
    submitButton.classList.toggle("enabled", isFormValid); // Activer ou désactiver le bouton de soumission selon la validité du formulaire
    submitButton.disabled = !isFormValid;
  }

  // Ajout des écouteurs d'événements pour la validation du formulaire
  pictureInput.addEventListener("change", validateForm);
  titleInput.addEventListener("input", validateForm);
  categorySelect.addEventListener("change", validateForm);

  // Gestion de la prévisualisation de l'image
  pictureInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewImage = document.getElementById("previewImage");
        previewImage.src = e.target.result; // Afficher l'image sélectionnée en prévisualisation
        document.getElementById("previewContainer").style.display = "block"; // Afficher le conteneur de prévisualisation
      };
      reader.readAsDataURL(file); // Lire le fichier pour en générer une URL
    }
  });

  // Gestion de la suppression de la prévisualisation
  document
    .getElementById("removePreview")
    .addEventListener("click", function () {
      const previewContainer = document.getElementById("previewContainer");
      const previewImage = document.getElementById("previewImage");
      previewImage.src = ""; // Vider la source de l'image prévisualisée
      previewContainer.style.display = "none"; // Cacher le conteneur de prévisualisation
      pictureInput.value = ""; // Réinitialiser l'input de fichier
      validateForm(); // Valider à nouveau le formulaire après suppression de la prévisualisation
    });

  // Gestion de la soumission du formulaire d'ajout
  modalForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("image", await pictureInput.files[0]); // Ajouter l'image au formulaire
    formData.append("title", titleInput.value.trim()); // Ajouter le titre au formulaire
    formData.append("category", categorySelect.value); // Ajouter la catégorie au formulaire

    postNewWork(formData); // Appeler la fonction pour envoyer le formulaire à l'API
    closeModal();
    validateForm();
    previewContainer.style.display = "none"; // Cacher le conteneur de prévisualisation
  });
}

// Fonction pour envoyer un nouveau travail à l'API
async function postNewWork(formData) {
  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Authentification avec le token
      },
      body: formData, // Contenu du formulaire à envoyer
    });

    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    const newWork = await response.json(); // Récupération de la réponse sous forme de JSON
    works.push(newWork); // Ajouter le nouveau travail à la liste des travaux existants
    closeModal(); // Fermer la modal après ajout
    showWork(0); // Réafficher les travaux mis à jour
    miniaturePicture(); // Mettre à jour les miniatures dans la modal
  } catch (error) {
    console.error("Erreur lors de l'ajout du travail :", error);
  }
}
