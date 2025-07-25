/**
 * EXEMPLE : Comment ajouter une nouvelle statistique
 *
 * Ce fichier montre comment ajouter facilement une nouvelle statistique
 * au système JaySpik en utilisant le fichier stats-config.mjs
 */

// ========================================
// ÉTAPE 1 : Ouvrir stats-config.mjs
// ========================================
// Aller dans module/config/stats-config.mjs

// ========================================
// ÉTAPE 2 : Ajouter votre nouvelle stat
// ========================================
// Dans l'objet STATS_CONFIG, ajouter :

export const EXEMPLE_AJOUT_STAT = {
  // Copier cette entrée dans STATS_CONFIG de stats-config.mjs
  magie: {
    label: "Magie", // ✅ Nom affiché dans l'interface
    description: "Pouvoir magique, mana", // ✅ Description (optionnelle)
    defaultValue: 30, // ✅ Valeur par défaut
    minValue: 0, // ✅ Minimum autorisé
    maxValue: 100, // ✅ Maximum autorisé
    color: "#9c27b0", // ✅ Couleur (optionnelle)
    icon: "fas fa-magic", // ✅ Icône (optionnelle)
  },
};

// ========================================
// ÉTAPE 3 : C'est tout !
// ========================================
// Le système se met automatiquement à jour :
// - Nouveau champ sur la fiche de personnage
// - Disponible dans les bonus d'objets
// - Jets automatiques fonctionnels
// - Calculs de bonus inclus

// ========================================
// EXEMPLE COMPLET avec plusieurs stats
// ========================================
export const EXEMPLE_SYSTEME_ETENDU = {
  // Stats de base
  mental: {
    label: "Mental",
    description: "Intelligence, volonté, magie",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    color: "#9c27b0",
    icon: "fas fa-brain",
  },

  physique: {
    label: "Physique",
    description: "Force, endurance, agilité",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    color: "#f44336",
    icon: "fas fa-dumbbell",
  },

  social: {
    label: "Social",
    description: "Charisme, persuasion, empathie",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    color: "#2196f3",
    icon: "fas fa-users",
  },

  // Nouvelles stats ajoutées
  magie: {
    label: "Magie",
    description: "Pouvoir magique, sorts, mana",
    defaultValue: 25,
    minValue: 0,
    maxValue: 100,
    color: "#9c27b0",
    icon: "fas fa-magic",
  },

  chance: {
    label: "Chance",
    description: "Fortune, destin, coups de chance",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    color: "#4caf50",
    icon: "fas fa-dice",
  },

  technique: {
    label: "Technique",
    description: "Compétences techniques, artisanat",
    defaultValue: 40,
    minValue: 0,
    maxValue: 100,
    color: "#ff9800",
    icon: "fas fa-cogs",
  },
};

// ========================================
// AVANTAGES du système centralisé
// ========================================
// ✅ Un seul fichier à modifier
// ✅ Pas besoin de toucher aux templates
// ✅ Pas besoin de modifier les modèles de données
// ✅ Automatiquement disponible partout
// ✅ Rétrocompatible avec les personnages existants
// ✅ Facile à maintenir et déboguer
