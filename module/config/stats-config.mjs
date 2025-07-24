/**
 * Configuration centralisée des statistiques du système JaySpik
 *
 * Ce fichier permet de gérer facilement toutes les statistiques du système.
 * Pour ajouter une nouvelle statistique :
 * 1. Ajoutez une entrée dans STATS_CONFIG
 * 2. Le système se mettra automatiquement à jour
 *
 * @author JaySpik System
 */

export const STATS_CONFIG = {
  // Clé de la stat : Configuration complète
  mental: {
    label: "Mental", // Nom affiché dans l'interface
    description: "Intelligence, volonté, magie, concentration", // Description optionnelle
    defaultValue: 50, // Valeur par défaut à la création
    minValue: 0, // Valeur minimum
    maxValue: 100, // Valeur maximum
    color: "#9c27b0", // Couleur associée (optionnel)
    icon: "fas fa-brain", // Icône FontAwesome (optionnel)
  },

  physique: {
    label: "Physique",
    description: "Force, endurance, agilité, constitution",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    color: "#f44336",
    icon: "fas fa-dumbbell",
  },

  social: {
    label: "Social",
    description: "Charisme, persuasion, empathie, leadership",
    defaultValue: 50,
    minValue: 0,
    maxValue: 100,
    color: "#2196f3",
    icon: "fas fa-users",
  },

  // Pour ajouter une nouvelle statistique, décommentez et adaptez :
  // nouvelleStat: {
  //   label: "Nouvelle Stat",
  //   description: "Description de la nouvelle statistique",
  //   defaultValue: 50,
  //   minValue: 0,
  //   maxValue: 100,
  //   color: "#4caf50",
  //   icon: "fas fa-star"
  // }
};

/**
 * Génère automatiquement la configuration pour FoundryVTT
 * à partir de STATS_CONFIG
 */
export function generateAbilitiesConfig() {
  const abilities = {};
  const abilityAbbreviations = {};

  for (const [key, config] of Object.entries(STATS_CONFIG)) {
    abilities[key] = config.label;
    abilityAbbreviations[key] = config.label.substring(0, 3).toUpperCase();
  }

  return { abilities, abilityAbbreviations };
}

/**
 * Génère le schéma des statistiques pour le modèle de données
 * @param {Object} fields - Foundry data fields
 * @returns {Object} Schéma des statistiques
 */
export function generateAbilitiesSchema(fields) {
  const requiredInteger = { required: true, nullable: false, integer: true };
  const abilitiesSchema = {};

  for (const [key, config] of Object.entries(STATS_CONFIG)) {
    abilitiesSchema[key] = new fields.SchemaField({
      value: new fields.NumberField({
        ...requiredInteger,
        initial: config.defaultValue,
        min: config.minValue,
        max: config.maxValue,
      }),
    });
  }

  return abilitiesSchema;
}

/**
 * Utilitaire pour récupérer la liste des clés de statistiques
 * @returns {Array} Tableau des clés de statistiques
 */
export function getStatsKeys() {
  return Object.keys(STATS_CONFIG);
}

/**
 * Utilitaire pour récupérer la configuration d'une statistique
 * @param {string} statKey - Clé de la statistique
 * @returns {Object|null} Configuration de la statistique ou null
 */
export function getStatConfig(statKey) {
  return STATS_CONFIG[statKey] || null;
}
