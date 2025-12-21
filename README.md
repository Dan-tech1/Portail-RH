# Portail RH - Smart Backoffice Dashboard

## Description du projet
Ce projet est une application web de type "Backoffice Dashboard" pour la gestion des ressources humaines, développée dans le cadre du module Développement Web. L'application permet de gérer les employés et les départements d'une entreprise, visualiser des statistiques et intégrer des données externes via une API.

## Fonctionnalités principales

### 1. Dashboard
- Affichage des KPI (Indicateurs Clés de Performance) :
  - Nombre total d'employés
  - Nombre de départements
  - Masse salariale totale
  - Taux d'inactivité
- Graphiques interactifs :
  - Répartition des salaires par département
  - Répartition des employés par genre
  - Évolution des embauches sur 6 mois
- Intégration avec l'API RandomUser pour suggérer de nouveaux employés

### 2. Module 1 : Gestion des employés (CRUD complet)
- Ajout d'un employé via formulaire validé
- Modification des informations d'un employé
- Suppression avec confirmation
- Recherche par mot-clé (nom, prénom, email, poste, département)
- Tri par nom, salaire ou date d'embauche
- Affichage des détails d'un employé
- Sauvegarde automatique dans le localStorage

### 3. Module 2 : Gestion des départements (CRUD simplifié)
- Ajout d'un département
- Suppression (vérification qu'aucun employé n'est affecté)
- Affichage sous forme de cartes avec statistiques
- Attribution d'un responsable

### 4. Module 3 : Statistiques et API
- Tableau de bord avec KPI calculés en temps réel
- Graphiques générés avec Chart.js
- Appel asynchrone à l'API RandomUser
- Mise à jour d'un KPI avec les données de l'API
- Génération de rapport (simulé)

## Technologies utilisées
- **HTML5** : Structure de la SPA (Single Page Application)
- **CSS3** : Styles personnalisés avec variables CSS
- **JavaScript Vanilla** : Logique de l'application sans framework
- **Bootstrap 5** : Framework CSS pour le design responsive
- **Chart.js** : Bibliothèque pour les graphiques
- **Font Awesome** : Icônes
- **LocalStorage** : Persistance des données
- **API RandomUser** : Source de données externes

## Architecture du projet