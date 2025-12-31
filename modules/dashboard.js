let salaryChartInstance = null;
let genderChartInstance = null;
let hiringTrendChartInstance = null;

// Initialisation du module dashboard
function initDashboardModule() {
    console.log('Initialisation du module Dashboard...');
    updateDashboard();
    console.log('Module Dashboard initialisé');
}

// Mettre à jour le dashboard
function updateDashboard() {
    console.log('Mise à jour du dashboard...');
    updateKPICards();
    updateCharts();
    loadAPIUsers();
}

// Mettre à jour les cartes KPI
function updateKPICards() {
    const kpiContainer = document.querySelector('#kpiCards');
    if (!kpiContainer) return;
    
    // Calculer les statistiques
    const totalEmployees = AppState.employees.length;
    const totalDepartments = AppState.departments.length;
    const totalSalary = AppState.employees.reduce((sum, emp) => sum + emp.salary, 0);
    const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
    const activeEmployees = AppState.employees.filter(emp => emp.status === 'Actif').length;
    const inactiveRate = totalEmployees > 0 ? 
        ((totalEmployees - activeEmployees) / totalEmployees * 100).toFixed(1) : 0;
    
    // Créer les cartes KPI
    kpiContainer.innerHTML = `
        <div class="col-md-3 mb-3">
            <div class="card kpi-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Employés totaux</h6>
                            <h2 class="card-title kpi-value">${totalEmployees}</h2>
                        </div>
                        <div class="bg-primary rounded-circle p-3">
                            <i class="fas fa-users fa-2x text-white"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">
                            <span class="kpi-change positive">
                                <i class="fas fa-arrow-up me-1"></i>${activeEmployees} actifs
                            </span>
                        </small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3 mb-3">
            <div class="card kpi-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Départements</h6>
                            <h2 class="card-title kpi-value">${totalDepartments}</h2>
                        </div>
                        <div class="bg-success rounded-circle p-3">
                            <i class="fas fa-building fa-2x text-white"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">Moyenne: ${(totalEmployees/totalDepartments).toFixed(1)} employés/dépt</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3 mb-3">
            <div class="card kpi-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Masse salariale</h6>
                            <h2 class="card-title kpi-value">${formatCurrency(totalSalary)}</h2>
                        </div>
                        <div class="bg-warning rounded-circle p-3">
                            <i class="fas fa-euro-sign fa-2x text-white"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">Moyenne: ${formatCurrency(avgSalary)}/employé</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="col-md-3 mb-3">
            <div class="card kpi-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="card-subtitle mb-2 text-muted">Taux d'inactivité</h6>
                            <h2 class="card-title kpi-value">${inactiveRate}%</h2>
                        </div>
                        <div class="bg-info rounded-circle p-3">
                            <i class="fas fa-chart-pie fa-2x text-white"></i>
                        </div>
                    </div>
                    <div class="mt-2">
                        <small class="text-muted">${totalEmployees - activeEmployees} employés inactifs</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Mettre à jour les graphiques
function updateCharts() {
    updateSalaryChart();
    updateGenderChart();
    updateHiringTrendChart();
    updateStatistics();
}

// Mettre à jour le graphique des salaires par département
function updateSalaryChart() {
    const ctx = document.getElementById('salaryChart');
    if (!ctx) return;
    
    // Grouper les employés par département et calculer le salaire moyen
    const departmentStats = {};
    
    AppState.employees.forEach(employee => {
        if (!departmentStats[employee.department]) {
            departmentStats[employee.department] = {
                total: 0,
                count: 0
            };
        }
        departmentStats[employee.department].total += employee.salary;
        departmentStats[employee.department].count += 1;
    });
    
    const departments = Object.keys(departmentStats);
    const avgSalaries = departments.map(dept => 
        departmentStats[dept].total / departmentStats[dept].count
    );
    const employeeCounts = departments.map(dept => departmentStats[dept].count);
    const backgroundColors = [
        'rgba(67, 97, 238, 0.7)',
        'rgba(76, 201, 240, 0.7)',
        'rgba(247, 37, 133, 0.7)',
        'rgba(255, 193, 7, 0.7)',
        'rgba(40, 167, 69, 0.7)',
        'rgba(108, 117, 125, 0.7)'
    ];
    
    // Détruire l'instance précédente si elle existe
    if (salaryChartInstance) {
        salaryChartInstance.destroy();
    }
    
    // Créer le nouveau graphique
    salaryChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: departments,
            datasets: [{
                label: 'Salaire moyen (€)',
                data: avgSalaries,
                backgroundColor: backgroundColors.slice(0, departments.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dept = departments[context.dataIndex];
                            const count = employeeCounts[context.dataIndex];
                            return [
                                `Salaire moyen: ${formatCurrency(context.parsed.y)}`,
                                `Employés: ${count}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Mettre à jour le graphique de répartition par genre
function updateGenderChart() {
    const ctx = document.getElementById('genderChart');
    if (!ctx) return;
    
    // Compter les employés par genre
    const genderCounts = {
        'Homme': 0,
        'Femme': 0,
        'Autre': 0
    };
    
    AppState.employees.forEach(employee => {
        const gender = employee.gender || 'Homme';
        if (genderCounts[gender] !== undefined) {
            genderCounts[gender] += 1;
        } else {
            genderCounts['Autre'] += 1;
        }
    });
    
    const genders = Object.keys(genderCounts).filter(g => genderCounts[g] > 0);
    const counts = genders.map(g => genderCounts[g]);
    
    const backgroundColors = [
        'rgba(67, 97, 238, 0.7)',   
        'rgba(247, 37, 133, 0.7)',  
        'rgba(108, 117, 125, 0.7)'
    ];
    
    // Détruire l'instance précédente si elle existe
    if (genderChartInstance) {
        genderChartInstance.destroy();
    }
    
    // Créer le nouveau graphique
    genderChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: genders,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, genders.length),
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = counts.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.parsed / total) * 100);
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Mettre à jour le graphique des tendances d'embauche
function updateHiringTrendChart() {
    const ctx = document.getElementById('hiringTrendChart');
    if (!ctx) return;
    
    // Grouper les embauches par mois
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        last6Months.push({
            label: monthYear,
            year: date.getFullYear(),
            month: date.getMonth()
        });
    }
    
    // Compter les embauches par mois
    const hiresByMonth = last6Months.map(month => {
        return AppState.employees.filter(emp => {
            const hireDate = new Date(emp.hireDate);
            return hireDate.getFullYear() === month.year && 
                   hireDate.getMonth() === month.month;
        }).length;
    });
    
    // Détruire l'instance précédente si elle existe
    if (hiringTrendChartInstance) {
        hiringTrendChartInstance.destroy();
    }
    
    // Créer le nouveau graphique
    hiringTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last6Months.map(m => m.label),
            datasets: [{
                label: 'Nombre d\'embauches',
                data: hiresByMonth,
                borderColor: 'rgba(67, 97, 238, 1)',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateStatistics() {
    // Calculer le taux de rotation
    const totalEmployees = AppState.employees.length;
    const inactiveEmployees = AppState.employees.filter(emp => emp.status === 'Inactif').length;
    const turnoverRate = totalEmployees > 0 ? ((inactiveEmployees / totalEmployees) * 100).toFixed(1) : 0;

    const turnoverRateElement = document.getElementById('turnoverRate');
    if (turnoverRateElement) {
        turnoverRateElement.textContent = `${turnoverRate}%`;
    }
    
    // Calculer le salaire moyen
    const totalSalary = AppState.employees.reduce((sum, emp) => sum + emp.salary, 0);
    const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
    
    const avgSalaryElement = document.getElementById('avgSalary');
    if (avgSalaryElement) {
        avgSalaryElement.textContent = formatCurrency(avgSalary);
    }
    updateDepartmentStatsTable();
}

// Mettre à jour le tableau des statistiques par département
function updateDepartmentStatsTable() {
    const tableBody = document.getElementById('departmentStats');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    // Pour chaque département, calculer les statistiques
    AppState.departments.forEach(department => {
        const deptEmployees = AppState.employees.filter(emp => emp.department === department.name);
        const employeeCount = deptEmployees.length;
        
        if (employeeCount === 0) {
            tableBody.innerHTML += `
                <tr>
                    <td>${department.name}</td>
                    <td>0</td>
                    <td>0€</td>
                    <td>0€</td>
                    <td>Aucune</td>
                </tr>
            `;
            return;
        }
        
        // Calculer les statistiques
        const totalSalary = deptEmployees.reduce((sum, emp) => sum + emp.salary, 0);
        const avgSalary = totalSalary / employeeCount;
        
        // Trouver la dernière date d'embauche
        const lastHireDate = deptEmployees
            .map(emp => new Date(emp.hireDate))
            .reduce((latest, current) => latest > current ? latest : current);
        tableBody.innerHTML += `
            <tr>
                <td>${department.name}</td>
                <td>${employeeCount}</td>
                <td>${formatCurrency(avgSalary)}</td>
                <td>${formatCurrency(totalSalary)}</td>
                <td>${formatDate(lastHireDate)}</td>
            </tr>
        `;
    });
}

// Charger les utilisateurs depuis l'API RandomUser
function loadAPIUsers() {
    const apiUsersContainer = document.getElementById('apiUsers');
    if (!apiUsersContainer) return;
    
    // Afficher un indicateur de chargement
    apiUsersContainer.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2">Chargement des suggestions d'employés...</p>
        </div>
    `;
    
    // Appeler l'API RandomUser
    fetch('https://randomuser.me/api/?results=4&nat=fr')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayAPIUsers(data.results);
            updateKPIWithAPIData(data.results);
        })
        .catch(error => {
            console.error('Erreur lors du chargement des données API:', error);
            apiUsersContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Impossible de charger les suggestions. Veuillez réessayer plus tard.
                    </div>
                </div>
            `;
        });
}

// Afficher les utilisateurs de l'API
function displayAPIUsers(users) {
    const apiUsersContainer = document.getElementById('apiUsers');
    if (!apiUsersContainer) return;
    
    apiUsersContainer.innerHTML = '';
    
    // Créer une carte pour chaque utilisateur
    users.forEach(user => {
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-6 mb-3';
        
        col.innerHTML = `
            <div class="api-user-card">
                <img src="${user.picture.large}" alt="${user.name.first} ${user.name.last}" 
                     class="api-user-img mb-3">
                <h6>${user.name.first} ${user.name.last}</h6>
                <p class="text-muted small mb-2">${user.email}</p>
                <p class="small">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    ${user.location.city}, ${user.location.country}
                </p>
                <button class="btn btn-sm btn-outline-primary mt-2 add-from-api" 
                        data-first="${user.name.first}"
                        data-last="${user.name.last}"
                        data-email="${user.email}"
                        data-phone="${user.phone}"
                        data-picture="${user.picture.large}">
                    <i class="fas fa-user-plus me-1"></i> Ajouter
                </button>
            </div>
        `;
        
        apiUsersContainer.appendChild(col);
    });
    
    // Ajouter les événements
    const addButtons = document.querySelectorAll('.add-from-api');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const firstName = this.getAttribute('data-first');
            const lastName = this.getAttribute('data-last');
            const email = this.getAttribute('data-email');
            const phone = this.getAttribute('data-phone');
            
            // Pré-remplir le formulaire d'ajout d'employé
            showEmployeeForm();
            // Remplir les champs avec les données de l'API
            document.getElementById('firstName').value = firstName;
            document.getElementById('lastName').value = lastName;
            document.getElementById('email').value = email;
            document.getElementById('phone').value = phone;
            document.getElementById('picture').value = user.picture.large;
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('hireDate').value = today;
            
            // Sélectionner un département aléatoire
            if (AppState.departments.length > 0) {
                const randomDept = AppState.departments[
                    Math.floor(Math.random() * AppState.departments.length)
                ].name;
                document.getElementById('department').value = randomDept;
            }
            
            // Définir un poste aléatoire
            const positions = ['Développeur', 'Designer', 'Commercial', 'Analyste', 'Chef de projet'];
            const randomPosition = positions[Math.floor(Math.random() * positions.length)];
            document.getElementById('position').value = randomPosition;
            
            // Définir un salaire aléatoire
            const randomSalary = Math.floor(Math.random() * 20000) + 30000;
            document.getElementById('salary').value = randomSalary;
            
            // Sélectionner un genre aléatoire
            const genderRadios = document.querySelectorAll('input[name="gender"]');
            const randomGender = genderRadios[Math.floor(Math.random() * genderRadios.length)].value;
            document.querySelector(`input[name="gender"][value="${randomGender}"]`).checked = true;
            
            showToast(`Formulaire pré-rempli avec ${firstName} ${lastName}`, 'info');
        });
    });
}

// Mettre à jour un KPI avec les données de l'API
function updateKPIWithAPIData(users) {

    // mise à jour du KPI uniquement si des utilisateurs sont présents
    if (users && users.length > 0) {
        console.log(`Données API chargées: ${users.length} utilisateurs`);

        const kpiContainer = document.getElementById('kpiCards');
        if (kpiContainer) {
            // Ajouter un KPI supplémentaire pour les candidats de l'API
            const apiKPI = document.createElement('div');
            apiKPI.className = 'col-md-3 mb-3';
            apiKPI.innerHTML = `
                <div class="card kpi-card" style="border-left-color: #17a2b8;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Candidats API</h6>
                                <h2 class="card-title kpi-value">${users.length}</h2>
                            </div>
                            <div class="bg-info rounded-circle p-3">
                                <i class="fas fa-user-plus fa-2x text-white"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">Suggestions de l'API RandomUser</small>
                        </div>
                    </div>
                </div>
            `;
            
            // KPI ajouté à la fin ou avant le dernier KPI existant
            const existingKPIs = kpiContainer.children;
            if (existingKPIs.length >= 4) {
                kpiContainer.insertBefore(apiKPI, existingKPIs[3].nextSibling);
            }
        }
    }
}
window.initDashboardModule = initDashboardModule;
window.updateDashboard = updateDashboard;
window.updateStatistics = updateStatistics;