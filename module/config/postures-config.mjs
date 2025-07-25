/**
 * Configuration centralisée des postures du système JaySpik
 *
 * Ce fichier permet de gérer facilement toutes les postures du système.
 * Pour ajouter une nouvelle posture :
 * 1. Ajoutez une entrée dans POSTURES_CONFIG
 * 2. Le système se mettra automatiquement à jour
 *
 * @author JaySpik System
 */

export const POSTURES_CONFIG = {
  none: {
    label: "Aucun",
    description: "Aucune posture active",
    icon: "fas fa-circle", // Icône FontAwesome de fallback
    localIcon: "systems/jay-spik/assets/postures/none.webp", // Votre icône locale
    color: "#666666",
    isDefault: true,
  },

  offensive: {
    label: "Offensif",
    description:
      "La posture offensive permet à un personnage d'infliger automatiquement le maximum de dégâts possibles, sans avoir à jeter de dé. En revanche, toute possibilité de défense est annulée. De plus, les valeurs de critiques augmentent de +5 points. Ce qui signifie que les réussites critiques passent à 1 - 10 inclus et que les échecs critiques passent à 91 - 100 inclus.",
    icon: "fas fa-sword", // Icône FontAwesome de fallback
    localIcon: "systems/jay-spik/assets/postures/offensive.png", // Votre icône locale
    color: "#ff4444",
    effects: {
      // Exemple d'effets - à ajuster selon vos besoins
      //   damage: 10,
      //   defense: -5,
    },
  },

  defensive: {
    label: "Défensif",
    description:
      "La posture défensive permet à l'utilisateur de répondre à une attaque réussie par une action de défense, comme une parade ou une esquive, annulant les dégâts. En revanche, l'utilisateur doit jeter des dés pour déterminer les dégâts qu'il provoque en cas d'attaque. L'esquive n'est normalement pas active contre une attaque magique mais, pour ne pas la réduire à une attaque à 'dégâts automatique', le joueur en posture défensive peut esquiver les attaques magiques sur une réussite critique.",
    icon: "fas fa-shield-alt", // Icône FontAwesome de fallback
    localIcon: "systems/jay-spik/assets/postures/defensive.png", // Votre icône locale
    color: "#4444ff",
    effects: {
      // Exemple d'effets - à ajuster selon vos besoins
      //   damage: -5,
      //   defense: 10,
    },
  },

  concentration: {
    label: "Concentration",
    description:
      "La posture de focus réduit le nombre de points de mana nécessaires pour utiliser la magie et octroie un bonus de 5% aux jets de dés. On ne peut cependant pas esquiver.",
    icon: "fas fa-eye", // Icône FontAwesome de fallback
    localIcon: "systems/jay-spik/assets/postures/concentration.png", // Votre icône locale
    color: "#9944ff",
    effects: {
      // Exemple d'effets - à ajuster selon vos besoins
      //   mental: 10,
      //   spellPower: 15,
      mental: 5,
      physique: 5,
      social: 5,
    },
  },
};

/**
 * Obtient la configuration d'une posture
 * @param {string} postureKey - La clé de la posture
 * @returns {object|null} La configuration de la posture ou null si non trouvée
 */
export function getPostureConfig(postureKey) {
  return POSTURES_CONFIG[postureKey] || null;
}

/**
 * Obtient le chemin de l'icône à utiliser pour une posture
 * Préfère l'icône locale si elle existe, sinon utilise l'icône FontAwesome
 * @param {string} postureKey - La clé de la posture
 * @returns {string} Le chemin de l'icône à utiliser
 */
export function getPostureIcon(postureKey) {
  const config = getPostureConfig(postureKey);
  if (!config) return "icons/sundries/misc/button-circle-steel.webp";

  // Si une icône locale est définie, l'utiliser en priorité
  if (config.localIcon) {
    return config.localIcon;
  }

  // Sinon, mapper l'icône FontAwesome vers une icône Foundry
  const iconMap = {
    "fas fa-sword": "icons/weapons/swords/sword-broad-blue.webp",
    "fas fa-shield-alt": "icons/equipment/shield/shield-round-boss-steel.webp",
    "fas fa-eye": "icons/magic/perception/eye-ringed-glow-angry-large-red.webp",
    "fas fa-circle": "icons/sundries/misc/button-circle-steel.webp",
  };

  return iconMap[config.icon] || "icons/sundries/misc/button-circle-steel.webp";
}

/**
 * Obtient toutes les postures sous forme de liste pour les menus déroulants
 * @returns {Array} Liste des postures avec leur clé et configuration
 */
export function getPosturesForSelect() {
  return Object.entries(POSTURES_CONFIG).map(([key, config]) => ({
    key,
    ...config,
  }));
}

/**
 * Obtient la posture par défaut
 * @returns {string} La clé de la posture par défaut
 */
export function getDefaultPosture() {
  const defaultEntry = Object.entries(POSTURES_CONFIG).find(
    ([key, config]) => config.isDefault
  );
  return defaultEntry ? defaultEntry[0] : "none";
}
