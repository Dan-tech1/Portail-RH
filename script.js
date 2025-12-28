// class AppState pour stocker l'état global de l'application
const AppState = {
  currentSection: "dashboard",
  employees: [],
  departments: [],
  charts: {},

  // Données de test initiales
  initialEmployees: [
    {
      id: 1,
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@entreprise.com",
      phone: "01 23 45 67 89",
      department: "IT",
      position: "Développeur Full-Stack",
      salary: 45000,
      hireDate: "2023-03-15",
      gender: "Homme",
      status: "Actif",
    },
    {
      id: 2,
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@entreprise.com",
      phone: "01 98 76 54 32",
      department: "Marketing",
      position: "Chef de projet",
      salary: 52000,
      hireDate: "2022-08-22",
      gender: "Femme",
      status: "Actif",
    },
    {
      id: 3,
      firstName: "Pierre",
      lastName: "Bernard",
      email: "pierre.bernard@entreprise.com",
      phone: "06 12 34 56 78",
      department: "Finance",
      position: "Analyste financier",
      salary: 48000,
      hireDate: "2024-01-10",
      gender: "Homme",
      status: "Congé",
    },
    {
        id: 4,
        firstName: "Sophie",
        lastName: "Laurent",
        email: "sophie.laurent@entreprise.com",
        phone: "06 54 32 10 98",
        department: "RH",
        position: "Responsable RH",
        salary: 50000,
        hireDate: "2023-11-05",
        gender: "Femme",
        status: "Actif",
      }
    ],
    initialDepartments: [
      {
        id: 1,
      name: "IT",
      description: "Technologies de l'information",
      manager: "Jean Dupont",
      employeeCount: 5,
    },
    {
      id: 2,
      name: "Marketing",
      description: "Marketing et communication",
      manager: "Marie Martin",
      employeeCount: 8,
    },
    {
      id: 3,
      name: "Finance",
      description: "Comptabilité et finances",
      manager: "Pierre Bernard",
      employeeCount: 6,
    },
    {
      id: 4,
      name: "RH",
      description: "Ressources Humaines",
      manager: "Sophie Laurent",
      employeeCount: 4,
    },
  ],
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Portail RH - Initialisation...");
  initData();

  // Initialiser la navigation SPA et les événements globaux
  initNavigation();
  initEvents();
  showSection(AppState.currentSection);

  if (typeof initEmployeesModule === "function") initEmployeesModule();
  if (typeof initDepartmentsModule === "function") initDepartmentsModule();
  if (typeof initDashboardModule === "function") initDashboardModule();
  console.log("Application initialisée avec succès!");
});

// Initialiser les données depuis le localStorage
function initData() {
  const savedEmployees = localStorage.getItem("rh_employees");
  if (savedEmployees) {
    AppState.employees = JSON.parse(savedEmployees);
  } else {
    // Utiliser les données initiales
    AppState.employees = [...AppState.initialEmployees];
    saveEmployeesToStorage();
  }

  // Charger les départements
  const savedDepartments = localStorage.getItem("rh_departments");
  if (savedDepartments) {
    AppState.departments = JSON.parse(savedDepartments);
  } else {
    // Utiliser les données initiales
    AppState.departments = [...AppState.initialDepartments];
    saveDepartmentsToStorage();
  }
}

// Sauvegarder les employés dans le localStorage
function saveEmployeesToStorage() {
  localStorage.setItem("rh_employees", JSON.stringify(AppState.employees));
  console.log("Employés sauvegardés dans le localStorage");
}

// Sauvegarder les départements dans le localStorage
function saveDepartmentsToStorage() {
  localStorage.setItem("rh_departments", JSON.stringify(AppState.departments));
  console.log("Départements sauvegardés dans le localStorage");
}

// Initialiser la navigation SPA
function initNavigation() {
  const navLinks = document.querySelectorAll(".nav-link[data-section]");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("data-section");

      // Mettre à jour l'état actif
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // Afficher la section
      showSection(sectionId);

      // Fermer la sidebar sur mobile
      if (window.innerWidth < 768) {
        const sidebar = document.getElementById("sidebar");
        sidebar.classList.remove("active");
      }
    });
  });

    // Toggle de la sidebar pour mobile
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      const sidebar = document.getElementById("sidebar");
      sidebar.classList.toggle("active");
    });
  }
}

// Afficher une section spécifique et gérer les mises à jour
function showSection(sectionId) {
  AppState.currentSection = sectionId;

  // Cacher toutes les sections
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // Afficher la section demandée
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active");

    // Mettre à jour le titre de la page et déclencher les mises à jour spécifiques à la section
    updatePageTitle(sectionId);

    switch (sectionId) {
      case "dashboard":
        if (typeof updateDashboard === "function") updateDashboard();
        break;
      case "employees":
        if (typeof renderEmployeesTable === "function") renderEmployeesTable();
        if (typeof populateDepartmentSelect === "function")
          populateDepartmentSelect();
        break;
      case "departments":
        if (typeof renderDepartmentsList === "function")
          renderDepartmentsList();
        if (typeof populateManagerSelect === "function")
          populateManagerSelect();
        break;
      case "stats":
        if (typeof updateStatistics === "function") updateStatistics();
        break;
    }
  }

  console.log(`Section affichée: ${sectionId}`);
}

// Mettre à jour le titre de la page selon la section
function updatePageTitle(sectionId) {
  const titleElement = document.getElementById("pageTitle");
  const subtitleElement = document.getElementById("pageSubtitle");

  if (!titleElement || !subtitleElement) return;

  const titles = {
    dashboard: { main: "Dashboard", subtitle: "Tableau de bord RH" },
    employees: { main: "Employés", subtitle: "Gestion des employés" },
    departments: { main: "Départements", subtitle: "Gestion des départements" },
    stats: { main: "Statistiques", subtitle: "Analyses RH" },
  };

  const sectionTitles = titles[sectionId] || {
    main: "Dashboard",
    subtitle: "Tableau de bord RH",
  };

  titleElement.textContent = sectionTitles.main;
  subtitleElement.textContent = sectionTitles.subtitle;
}

// Initialiser les événements tous les elements globaux
function initEvents() {
  const refreshBtn = document.getElementById("refreshDashboard");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      if (typeof updateDashboard === "function") updateDashboard();
      showToast("Dashboard actualisé", "success");
    });
  }

  // Générer un rapport
  const reportBtn = document.getElementById("generateReport");
  if (reportBtn) {
    reportBtn.addEventListener("click", function () {
      generateReport();
    });
  }

  // Modal de confirmation pour suppression
  const confirmModal = document.getElementById("confirmModal");
  if (confirmModal) {
    confirmModal.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const itemType = button.getAttribute("data-type");
      const itemName = button.getAttribute("data-name");

      const messageElement = document.getElementById("confirmMessage");
      if (messageElement) {
        messageElement.textContent = `Êtes-vous sûr de vouloir supprimer ${
          itemType === "employee" ? "l'employé" : "le département"
        } "${itemName}" ? Cette action est irréversible.`;
      }

      // Stocker l'ID de l'élément à supprimer
      const itemId = button.getAttribute("data-id");
      const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

      if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = function () {
          if (itemType === "employee") {
            if (typeof deleteEmployee === "function") deleteEmployee(itemId);
          } else if (itemType === "department") {
            if (typeof deleteDepartment === "function")
              deleteDepartment(itemId);
          }

          // Fermer le modal
          const modal = bootstrap.Modal.getInstance(confirmModal);
          modal.hide();
        };
      }
    });
  }
}

// Générer un rapport PDF (simulé)
function generateReport() {
  showToast("Génération du rapport en cours...", "info");

  setTimeout(() => {
    const blob = new Blob(
      [
        `Rapport RH - ${new Date().toLocaleDateString("fr-FR")}\n\n` +
          `Nombre total d'employés: ${AppState.employees.length}\n` +
          `Nombre de départements: ${AppState.departments.length}\n` +
          `Masse salariale totale: ${calculateTotalSalary()}MAD\n` +
          `Date de génération: ${new Date().toLocaleString("fr-FR")}`,
      ],
      { type: "text/plain" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-rh-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Rapport généré avec succès!", "success");
  }, 1500);
}

// Calculer la masse salariale totale
function calculateTotalSalary() {
  return AppState.employees.reduce(
    (total, employee) => total + employee.salary,
    0
  );
}

// Afficher une notification toast
function showToast(message, type = "info") {
  // Créer un élément toast
  const toastContainer = document.createElement("div");
  toastContainer.className =
    "toast-container position-fixed bottom-0 end-0 p-3";

  const toastId = "toast-" + Date.now();
  const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

  toastContainer.innerHTML = toastHtml;
  document.body.appendChild(toastContainer);

  // Afficher le toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
  toast.show();

  // Supprimer le toast après sa disparition
  toastElement.addEventListener("hidden.bs.toast", function () {
    document.body.removeChild(toastContainer);
  });
}

// Obtenir le prochain ID pour une liste
function getNextId(items) {
  if (items.length === 0) return 1;
  const maxId = Math.max(...items.map((item) => item.id));
  return maxId + 1;
}

// Formater une date au format français
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
}

// Formater un montant en dirhams
function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MAD",
  }).format(amount);
}

// Exporter l'état global et les utilitaires pour les modules
window.AppState = AppState;
window.saveEmployeesToStorage = saveEmployeesToStorage;
window.saveDepartmentsToStorage = saveDepartmentsToStorage;
window.showToast = showToast;
window.getNextId = getNextId;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.showSection = showSection;
