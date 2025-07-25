/**
 * Configuration centralisée des statuts du système JaySpik
 *
 * Ce fichier permet de gérer facilement tous les statuts du système.
 * Pour ajouter un nouveau statut :
 * 1. Ajoutez une entrée dans STATUS_CONFIG
 * 2. Le système se mettra automatiquement à jour
 *
 * Les statuts affichent uniquement une icône sur le token,
 * sans aucun effet sur les statistiques.
 *
 * @author JaySpik System
 */

export const STATUS_CONFIG = {
  // Option par défaut : aucun statut
  none: {
    label: "Aucun",
    description: "Aucun statut particulier",
    icon: "",
    color: "#999999",
  },

  // Statuts disponibles
  defensive: {
    label: "Défensive",
    description:
      "La posture défensive permet à l'utilisateur de répondre à une attaque réussie par une action de défense, comme une parade ou une esquive, annulant les dégâts. En revanche, l'utilisateur doit jeter des dés pour déterminer les dégâts qu'il provoque en cas d'attaque. L'esquive n'est normalement pas active contre une attaque magique mais, pour ne pas la réduire à une attaque à 'dégâts automatique', le joueur en posture défensive peut esquiver les attaques magiques sur une réussite critique.",
    icon: "fas fa-shield-alt",
    color: "#2196f3",
  },

  aggressive: {
    label: "Offensive",
    description:
      "La posture offensive permet à un personnage d'infliger automatiquement le maximum de dégâts possibles, sans avoir à jeter de dé. En revanche, toute possibilité de défense est annulée. De plus, les valeurs de critiques augmentent de +5 points. Ce qui signifie que les réussites critiques passent à 1 - 10 inclus et que les échecs critiques passent à 91 - 100 inclus.",
    icon: "fas fa-sword",
    color: "#f44336",
  },

  focused: {
    label: "Concentré",
    description:
      "La posture de focus réduit le nombre de points de mana nécessaires pour utiliser la magie et octroie un bonus de 5% aux jets de dés. On ne peut cependant pas esquiver.",
    icon: "perso fa-mon-focus",
    color: "#9c27b0",
  },

  // Exemple d'ajout facile d'un nouveau statut
  //   stealthy: {
  //     label: "Furtif",
  //     description:
  //       "Le personnage se déplace dans l'ombre, privilégiant la discrétion",
  //     icon: "fas fa-user-ninja",
  //     color: "#607d8b",
  //   },

  //   berserker: {
  //     label: "Berserk",
  //     description: "Le personnage entre dans une rage incontrôlable",
  //     icon: "fas fa-fire",
  //     color: "#ff5722",
  //   },

  // Pour ajouter un nouveau statut, ajoutez une entrée comme ci-dessus :
  // nouveauStatut: {
  //   label: "Nouveau Statut",
  //   description: "Description du nouveau statut qui apparaîtra au survol",
  //   icon: "fas fa-star",
  //   color: "#4caf50",
  // }
};

/**
 * Génère automatiquement la liste des statuts pour l'interface
 */
export function getStatusList() {
  return Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    key,
    ...config,
  }));
}

/**
 * Récupère la configuration d'un statut
 * @param {string} statusKey - Clé du statut
 * @returns {Object|null} Configuration du statut ou null
 */
export function getStatusConfig(statusKey) {
  return STATUS_CONFIG[statusKey] || null;
}

/**
 * Génère les données nécessaires pour CONFIG.JAY_SPIK
 */
export function generateStatusConfig() {
  const statuses = {};

  for (const [key, config] of Object.entries(STATUS_CONFIG)) {
    statuses[key] = {
      label: config.label,
      description: config.description,
      icon: config.icon,
      color: config.color,
    };
  }

  return { statuses };
}
