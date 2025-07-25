import { generateAbilitiesConfig } from "../config/stats-config.mjs";

export const JAY_SPIK = {};

/**
 * Configuration des statistiques générée automatiquement
 * à partir du fichier stats-config.mjs
 */
const { abilities, abilityAbbreviations } = generateAbilitiesConfig();

JAY_SPIK.abilities = abilities;
JAY_SPIK.abilityAbbreviations = abilityAbbreviations;
