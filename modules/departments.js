function initDepartmentsModule() {
    console.log('Initialisation du module Départements...');
    // Événements du formulaire département
    const addDepartmentBtn = document.getElementById('addDepartmentBtn');
    if (addDepartmentBtn) {
        addDepartmentBtn.addEventListener('click', showDepartmentForm);
    } 
    const cancelDepartmentBtn = document.getElementById('cancelDepartmentBtn');
    if (cancelDepartmentBtn) {
        cancelDepartmentBtn.addEventListener('click', hideDepartmentForm);
    }
    const departmentForm = document.getElementById('departmentForm');
    if (departmentForm) {
        departmentForm.addEventListener('submit', handleDepartmentFormSubmit);
    }
    // Remplir le sélecteur de responsables
    populateManagerSelect(); 
    console.log('Module Départements initialisé');
}

// Afficher le formulaire département
function showDepartmentForm() {
    const formContainer = document.getElementById('departmentFormContainer');
    const form = document.getElementById('departmentForm');
    
    if (!formContainer || !form) return;
    form.reset();
    form.classList.remove('was-validated');
    
    // Afficher le formulaire
    formContainer.classList.remove('d-none');
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Cacher le formulaire département
function hideDepartmentForm() {
    const formContainer = document.getElementById('departmentFormContainer');
    if (formContainer) {
        formContainer.classList.add('d-none');
    }
}

// Gérer la soumission du formulaire département
function handleDepartmentFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }
    
    // Récupérer les données du formulaire
    const departmentData = {
        id: getNextId(AppState.departments),
        name: document.getElementById('deptName').value,
        description: document.getElementById('deptDescription').value,
        manager: document.getElementById('deptManager').value,
        employeeCount: 0 
    };
    
    addDepartment(departmentData);
    hideDepartmentForm();
}

// Ajouter un nouveau département
function addDepartment(departmentData) {
    // Vérifier si le département existe déjà
    const deptExists = AppState.departments.some(dept => 
        dept.name.toLowerCase() === departmentData.name.toLowerCase()
    );
    
    if (deptExists) {
        showToast('Un département avec ce nom existe déjà', 'warning');
        return;
    }
    
    // Calculer le nombre d'employés dans ce département
    departmentData.employeeCount = AppState.employees.filter(emp => 
        emp.department === departmentData.name
    ).length;
    
    AppState.departments.push(departmentData);
    saveDepartmentsToStorage();
    
    // Mettre à jour l'affichage
    renderDepartmentsList();
    
    // Mettre à jour le sélecteur de départements dans le module employés
    if (typeof populateDepartmentSelect === 'function') populateDepartmentSelect();
    if (typeof updateDashboard === 'function') updateDashboard();
    
    showToast(`Département "${departmentData.name}" ajouté avec succès`, 'success');
    console.log('Nouveau département ajouté:', departmentData);
}

// Supprimer un département
function deleteDepartment(departmentId) {
    const deptIndex = AppState.departments.findIndex(dept => dept.id == departmentId);
    
    if (deptIndex !== -1) {
        const department = AppState.departments[deptIndex];
        
        // Vérifier si des employés sont affectés à ce département
        const employeesInDept = AppState.employees.filter(emp => emp.department === department.name);
        
        if (employeesInDept.length > 0) {
            showToast(`Impossible de supprimer le département "${department.name}" car ${employeesInDept.length} employé(s) y sont affectés.`, 'danger');
            return;
        }
        
        AppState.departments.splice(deptIndex, 1);
        saveDepartmentsToStorage();
        renderDepartmentsList();
        
        // Mettre à jour le sélecteur de départements dans le module employés
        if (typeof populateDepartmentSelect === 'function') populateDepartmentSelect();
        
        // Mettre à jour le dashboard si nécessaire
        if (typeof updateDashboard === 'function') updateDashboard();
        
        showToast(`Département "${department.name}" supprimé avec succès`, 'success');
        console.log('Département supprimé:', department);
    }
}

// Remplir le sélecteur de responsables
function populateManagerSelect() {
    const managerSelect = document.getElementById('deptManager');
    if (!managerSelect) return;
    
    // Vider les options
    while (managerSelect.options.length > 1) {
        managerSelect.remove(1);
    }
    
    // Ajouter les employés comme options
    AppState.employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = `${employee.firstName} ${employee.lastName}`;
        option.textContent = `${employee.firstName} ${employee.lastName} (${employee.position})`;
        managerSelect.appendChild(option);
    });
}

// Rendre la liste des départements sous forme de cartes
function renderDepartmentsList() {
    const departmentsList = document.getElementById('departmentsList');
    const noDepartmentsMessage = document.getElementById('noDepartmentsMessage');
    
    if (!departmentsList || !noDepartmentsMessage) return;
    departmentsList.innerHTML = '';
    
    // Afficher le message si aucun département
    if (AppState.departments.length === 0) {
        noDepartmentsMessage.classList.remove('d-none');
        return;
    }
    
    noDepartmentsMessage.classList.add('d-none');
    
    // Pour chaque département, créer une carte
    AppState.departments.forEach(department => {
        // Calculer le nombre d'employés dans ce département
        const employeeCount = AppState.employees.filter(emp => 
            emp.department === department.name
        ).length;
        

        department.employeeCount = employeeCount;
        // Calculer le salaire moyen dans ce département
        const deptEmployees = AppState.employees.filter(emp => emp.department === department.name);
        const avgSalary = deptEmployees.length > 0 
            ? deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length
            : 0;
        
        // Créer la carte
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        
        col.innerHTML = `
            <div class="card department-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title mb-0">${department.name}</h5>
                        <span class="badge bg-primary">${employeeCount} employé${employeeCount !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <p class="card-text text-muted">${department.description || 'Aucune description'}</p>
                    
                    <div class="mb-3">
                        <small class="text-muted">
                            <i class="fas fa-user-tie me-1"></i>
                            Responsable: ${department.manager || 'Non assigné'}
                        </small>
                    </div>
                    
                    <div class="mb-3">
                        <small class="text-muted">
                            <i class="fas fa-euro-sign me-1"></i>
                            Salaire moyen: ${formatCurrency(avgSalary)}
                        </small>
                    </div>
                    
                    <div class="mt-3 d-flex justify-content-between">
                        <small class="text-muted">ID: ${department.id}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-danger delete-department" 
                                    data-id="${department.id}" 
                                    data-name="${department.name}"
                                    data-type="department"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#confirmModal"
                                    title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        departmentsList.appendChild(col);
    });
}

window.initDepartmentsModule = initDepartmentsModule;
window.renderDepartmentsList = renderDepartmentsList;
window.populateManagerSelect = populateManagerSelect;
window.deleteDepartment = deleteDepartment;