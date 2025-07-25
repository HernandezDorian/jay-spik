import { generateAbilitiesConfig } from "../config/stats-config.mjs";
import {
  generateStatusConfig,
  STATUS_CONFIG,
} from "../config/status-config.mjs";

export const JAY_SPIK = {};

/**
 * Configuration des statistiques générée automatiquement
 * à partir du fichier stats-config.mjs
 */
const { abilities, abilityAbbreviations } = generateAbilitiesConfig();

/**
 * Configuration des statuts générée automatiquement
 * à partir du fichier status-config.mjs
 */
const { statuses } = generateStatusConfig();

// Ajouter l'option "Aucun" pour l'interface
statuses.none = {
  label: "Aucun",
  description: "Aucun statut actif",
  icon: "",
  color: "#666666",
};

// Génération des effets de statuts pour un accès rapide
const statusEffects = {};
for (const [key, config] of Object.entries(STATUS_CONFIG)) {
  statusEffects[key] = config.effects || {};
}
// Pas d'effets pour "none"
statusEffects.none = {};

JAY_SPIK.abilities = abilities;
JAY_SPIK.abilityAbbreviations = abilityAbbreviations;
JAY_SPIK.statuses = statuses;
JAY_SPIK.statusEffects = statusEffects;
