let currentSortField = 'lastName';
let currentSortDirection = 'asc';
let currentSearchTerm = '';

function initEmployeesModule() {
    console.log('Initialisation du module Employés...');
    
    // Événements du formulaire employé
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    if (addEmployeeBtn) {
        addEmployeeBtn.addEventListener('click', showEmployeeForm);
    }
    
    const cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');
    if (cancelEmployeeBtn) {
        cancelEmployeeBtn.addEventListener('click', hideEmployeeForm);
    }
    
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        employeeForm.addEventListener('submit', handleEmployeeFormSubmit);
    }
    
    // Événements de recherche et tri
    const employeeSearch = document.getElementById('employeeSearch');
    if (employeeSearch) {
        employeeSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.toLowerCase();
            renderEmployeesTable();
        });
    }
    
    const clearSearch = document.getElementById('clearSearch');
    if (clearSearch) {
        clearSearch.addEventListener('click', function() {
            document.getElementById('employeeSearch').value = '';
            currentSearchTerm = '';
            renderEmployeesTable();
        });
    }
    
    // Événements de tri
    const sortByNameBtn = document.getElementById('sortByName');
    if (sortByNameBtn) {
        sortByNameBtn.addEventListener('click', function() {
            currentSortField = 'lastName';
            currentSortDirection = currentSortField === 'lastName' && currentSortDirection === 'asc' ? 'desc' : 'asc';
            renderEmployeesTable();
        });
    }
    
    const sortBySalaryBtn = document.getElementById('sortBySalary');
    if (sortBySalaryBtn) {
        sortBySalaryBtn.addEventListener('click', function() {
            currentSortField = 'salary';
            currentSortDirection = currentSortField === 'salary' && currentSortDirection === 'asc' ? 'desc' : 'asc';
            renderEmployeesTable();
        });
    }
    
    const sortByDateBtn = document.getElementById('sortByDate');
    if (sortByDateBtn) {
        sortByDateBtn.addEventListener('click', function() {
            currentSortField = 'hireDate';
            currentSortDirection = currentSortField === 'hireDate' && currentSortDirection === 'asc' ? 'desc' : 'asc';
            renderEmployeesTable();
        });
    }
    
    populateDepartmentSelect();
    
    console.log('Module Employés initialisé');
}

// Afficher le formulaire employé (ajout ou modification)
function showEmployeeForm(employeeId = null) {
    const formContainer = document.getElementById('employeeFormContainer');
    const formTitle = document.getElementById('employeeFormTitle');
    const form = document.getElementById('employeeForm');
    
    if (!formContainer || !formTitle || !form) return;
    form.reset();
    form.classList.remove('was-validated');
    
    if (employeeId) {
        // Mode modification
        formTitle.textContent = 'Modifier un employé';
        const employee = AppState.employees.find(emp => emp.id == employeeId);
        
        if (employee) {
            // Remplir le formulaire avec les données de l'employé
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('firstName').value = employee.firstName;
            document.getElementById('lastName').value = employee.lastName;
            document.getElementById('email').value = employee.email;
            document.getElementById('phone').value = employee.phone || '';
            document.getElementById('department').value = employee.department;
            document.getElementById('position').value = employee.position;
            document.getElementById('salary').value = employee.salary;
            document.getElementById('hireDate').value = employee.hireDate;
            document.getElementById('status').value = employee.status || 'Actif';
            
            // Cocher le bon bouton radio pour le genre
            const genderRadios = document.querySelectorAll('input[name="gender"]');
            genderRadios.forEach(radio => {
                radio.checked = radio.value === employee.gender;
            });
        }
    } else {
        // Mode ajout
        formTitle.textContent = 'Ajouter un nouvel employé';
        document.getElementById('employeeId').value = '';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('hireDate').value = today;
    }
    formContainer.classList.remove('d-none');
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Cacher le formulaire employé
function hideEmployeeForm() {
    const formContainer = document.getElementById('employeeFormContainer');
    if (formContainer) {
        formContainer.classList.add('d-none');
    }
}

// Gérer la soumission du formulaire employé
function handleEmployeeFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Récupérer les données du formulaire
    const employeeId = document.getElementById('employeeId').value;
    const employeeData = {
        id: employeeId ? parseInt(employeeId) : getNextId(AppState.employees),
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        salary: parseFloat(document.getElementById('salary').value),
        hireDate: document.getElementById('hireDate').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value || 'Homme',
        status: document.getElementById('status').value || 'Actif'
    };
    
    if (employeeId) {
        updateEmployee(employeeData);
    } else {
        addEmployee(employeeData);
    }
    hideEmployeeForm();
}

// Ajouter un nouvel employé
function addEmployee(employeeData) {
    // Vérifier si l'email existe déjà
    const emailExists = AppState.employees.some(emp => emp.email === employeeData.email);
    if (emailExists) {
        showToast('Un employé avec cet email existe déjà', 'warning');
        return;
    }
    
    AppState.employees.push(employeeData);
    saveEmployeesToStorage();
    renderEmployeesTable();
    if (typeof updateDashboard === 'function') updateDashboard();
    
    showToast(`Employé ${employeeData.firstName} ${employeeData.lastName} ajouté avec succès`, 'success');
    console.log('Nouvel employé ajouté:', employeeData);
}

// Mettre à jour un employé existant
function updateEmployee(employeeData) {
    const index = AppState.employees.findIndex(emp => emp.id === employeeData.id);
    
    if (index !== -1) {
        AppState.employees[index] = employeeData;
        saveEmployeesToStorage();
        renderEmployeesTable();
        if (typeof updateDashboard === 'function') updateDashboard();
        
        showToast(`Employé ${employeeData.firstName} ${employeeData.lastName} mis à jour avec succès`, 'success');
        console.log('Employé mis à jour:', employeeData);
    }
}

// Supprimer un employé
function deleteEmployee(employeeId) {
    const employeeIndex = AppState.employees.findIndex(emp => emp.id == employeeId);
    
    if (employeeIndex !== -1) {
        const employee = AppState.employees[employeeIndex];
        AppState.employees.splice(employeeIndex, 1);
        saveEmployeesToStorage();
        
        renderEmployeesTable();
        if (typeof updateDashboard === 'function') updateDashboard();
        
        showToast(`Employé ${employee.firstName} ${employee.lastName} supprimé avec succès`, 'success');
        console.log('Employé supprimé:', employee);
    }
}

// Remplir le sélecteur de départements
function populateDepartmentSelect() {
    const departmentSelect = document.getElementById('department');
    if (!departmentSelect) return;
    
    // Sauvegarder la valeur sélectionnée
    const selectedValue = departmentSelect.value;
    
    // Vider les options existantes sauf la première
    while (departmentSelect.options.length > 1) {
        departmentSelect.remove(1);
    }
    
    // Ajouter les départements
    AppState.departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
    });
    
    // Restaurer la valeur sélectionnée si elle existe encore
    if (selectedValue && AppState.departments.some(dept => dept.name === selectedValue)) {
        departmentSelect.value = selectedValue;
    }
}

// Rendre le tableau des employés
function renderEmployeesTable() {
    const tableBody = document.getElementById('employeesTableBody');
    const noEmployeesMessage = document.getElementById('noEmployeesMessage');
    if (!tableBody || !noEmployeesMessage) return;
    
    // Filtrer et trier les employés
    let filteredEmployees = [...AppState.employees];
    
    // Appliquer la recherche
    if (currentSearchTerm) {
        filteredEmployees = filteredEmployees.filter(employee => 
            employee.firstName.toLowerCase().includes(currentSearchTerm) ||
            employee.lastName.toLowerCase().includes(currentSearchTerm) ||
            employee.email.toLowerCase().includes(currentSearchTerm) ||
            employee.position.toLowerCase().includes(currentSearchTerm) ||
            employee.department.toLowerCase().includes(currentSearchTerm)
        );
    }
    
    // Appliquer le tri
    filteredEmployees.sort((a, b) => {
        let aValue = a[currentSortField];
        let bValue = b[currentSortField];
        
        // Pour le tri par nom, combiner prénom et nom
        if (currentSortField === 'lastName') {
            aValue = `${a.lastName} ${a.firstName}`.toLowerCase();
            bValue = `${b.lastName} ${b.firstName}`.toLowerCase();
        }
        
        if (aValue < bValue) return currentSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    tableBody.innerHTML = '';
    
    // Afficher le message si aucun employé
    if (filteredEmployees.length === 0) {
        noEmployeesMessage.classList.remove('d-none');
        return;
    }
    noEmployeesMessage.classList.add('d-none');
    
    // Remplir le tableau
    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.className = 'new-item';
        
        // Déterminer la classe CSS selon le statut
        let statusClass = 'bg-success';
        if (employee.status === 'Inactif') statusClass = 'bg-danger';
        if (employee.status === 'Congé') statusClass = 'bg-warning';
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>
                <strong>${employee.firstName} ${employee.lastName}</strong><br>
                <small class="text-muted">${employee.email}</small>
            </td>
            <td>
                <span class="badge bg-primary">${employee.department}</span>
            </td>
            <td>${employee.position}</td>
            <td>${formatCurrency(employee.salary)}</td>
            <td>${formatDate(employee.hireDate)}</td>
            <td>
                <span class="badge ${statusClass}">${employee.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 view-employee" data-id="${employee.id}" title="Voir les détails">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1 edit-employee" data-id="${employee.id}" title="Modifier">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-employee" 
                        data-id="${employee.id}" 
                        data-name="${employee.firstName} ${employee.lastName}"
                        data-type="employee"
                        data-bs-toggle="modal" 
                        data-bs-target="#confirmModal"
                        title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    addEmployeeButtonEvents();
}

// Ajouter les événements aux boutons d'action des employés
function addEmployeeButtonEvents() {
    // Boutons de visualisation
    const viewButtons = document.querySelectorAll('.view-employee');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            viewEmployeeDetails(employeeId);
        });
    });
    
    // Boutons de modification
    const editButtons = document.querySelectorAll('.edit-employee');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            showEmployeeForm(employeeId);
        });
    });
}

// Afficher les détails d'un employé
function viewEmployeeDetails(employeeId) {
    const employee = AppState.employees.find(emp => emp.id == employeeId);
    
    if (!employee) {
        showToast('Employé non trouvé', 'warning');
        return;
    }
    
    // Créer une modal pour afficher les détails
    const modalHtml = `
        <div class="modal fade" id="employeeDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails de l'employé</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="mb-3">
                                    <div class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" 
                                         style="width: 120px; height: 120px; font-size: 3rem;">
                                        ${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}
                                    </div>
                                </div>
                                <h4>${employee.firstName} ${employee.lastName}</h4>
                                <p class="text-muted">${employee.position}</p>
                                
                                <div class="mt-3">
                                    <span class="badge ${employee.status === 'Actif' ? 'bg-success' : employee.status === 'Inactif' ? 'bg-danger' : 'bg-warning'}">
                                        ${employee.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div class="col-md-8">
                                <h5 class="border-bottom pb-2">Informations personnelles</h5>
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Email:</strong><br>
                                        ${employee.email}
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Téléphone:</strong><br>
                                        ${employee.phone || 'Non renseigné'}
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Genre:</strong><br>
                                        ${employee.gender}
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Date d'embauche:</strong><br>
                                        ${formatDate(employee.hireDate)}
                                    </div>
                                </div>
                                
                                <h5 class="border-bottom pb-2 mt-4">Informations professionnelles</h5>
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <strong>Département:</strong><br>
                                        <span class="badge bg-primary">${employee.department}</span>
                                    </div>
                                    <div class="col-sm-6">
                                        <strong>Salaire:</strong><br>
                                        ${formatCurrency(employee.salary)}
                                    </div>
                                </div>
                                
                                <div class="mt-4">
                                    <strong>Ancienneté:</strong><br>
                                    ${calculateSeniority(employee.hireDate)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary edit-from-modal" data-id="${employee.id}">
                            <i class="fas fa-edit me-1"></i> Modifier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter la modal au DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Afficher la modal
    const modal = new bootstrap.Modal(document.getElementById('employeeDetailsModal'));
    modal.show();
    
    const editButton = document.querySelector('.edit-from-modal');
    if (editButton) {
        editButton.addEventListener('click', function() {
            const employeeId = this.getAttribute('data-id');
            modal.hide();
            showEmployeeForm(employeeId);
        });
    }
    
    // Nettoyer la modal après sa fermeture
    document.getElementById('employeeDetailsModal').addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(this.parentElement);
    });
}

// Calculer l'ancienneté d'un employé
function calculateSeniority(hireDate) {
    const hire = new Date(hireDate);
    const now = new Date();
    
    let years = now.getFullYear() - hire.getFullYear();
    let months = now.getMonth() - hire.getMonth();
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    if (years === 0) {
        return `${months} mois`;
    } else if (months === 0) {
        return `${years} an${years > 1 ? 's' : ''}`;
    } else {
        return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    }
}
window.initEmployeesModule = initEmployeesModule;
window.renderEmployeesTable = renderEmployeesTable;
window.populateDepartmentSelect = populateDepartmentSelect;
window.deleteEmployee = deleteEmployee;