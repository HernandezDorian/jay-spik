// ===============================================
// SYSTÈME DE POSTURES ULTRA-SIMPLE - VERSION 2.0
// ===============================================

/* 
OBJECTIF SIMPLE :
- Choisir une posture dans la fiche
- Ça crée UN effet temporaire sur le token
- Changer de posture supprime l'ancien et crée le nouveau
- C'est tout !
*/

// Import document classes.
import { JaySpikActor } from "./documents/actor.mjs";
import { JaySpikItem } from "./documents/item.mjs";
// Import sheet classes.
import { JaySpikActorSheet } from "./sheets/actor-sheet.mjs";
import { JaySpikItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { JAY_SPIK } from "./helpers/config.mjs";
import { DamageManager } from "./helpers/damage-manager.mjs";
// Import DataModel classes
import * as models from "./data/_module.mjs";

/* -------------------------------------------- */
/*  Conversion d'icônes                         */
/* -------------------------------------------- */

function convertFontAwesomeToPath(fontAwesomeClass) {
  const iconMapping = {
    "fas fa-shield-alt": "icons/svg/shield.svg",
    "fas fa-sword": "icons/svg/sword.svg",
    "fas fa-brain": "icons/svg/eye.svg",
    "fas fa-user-ninja": "icons/svg/mystery-man.svg",
    "fas fa-fire": "icons/svg/fire.svg",
    "fas fa-bolt": "icons/svg/lightning.svg",
    "fas fa-leaf": "icons/svg/oak.svg",
    "fas fa-snowflake": "icons/svg/ice-aura.svg",
    "fas fa-heart": "icons/svg/heal.svg",
    "fas fa-skull": "icons/svg/poison.svg",
    "fas fa-fist-raised": "icons/svg/combat.svg",
    "fas fa-running": "icons/svg/wing.svg",
    "perso fa-mon-focus":
      "systems/jay-spik/icons/brain-illustration-12-svgrepo-com.svg",
  };
  return iconMapping[fontAwesomeClass] || "icons/svg/aura.svg";
}

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  // Add utility classes to the global game object
  game.jayspik = {
    JaySpikActor,
    JaySpikItem,
    rollItemMacro,
    DamageManager,
  };

  // Add custom constants for configuration.
  CONFIG.JAY_SPIK = JAY_SPIK;

  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.dex.mod",
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = JaySpikActor;
  CONFIG.Actor.dataModels = {
    character: models.JaySpikCharacter,
    npc: models.JaySpikNPC,
  };
  CONFIG.Item.documentClass = JaySpikItem;
  CONFIG.Item.dataModels = {
    item: models.JaySpikItem,
    feature: models.JaySpikFeature,
    spell: models.JaySpikSpell,
    equipment: models.JaySpikEquipment,
  };

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("jay-spik", JaySpikActorSheet, {
    makeDefault: true,
    label: "JAY_SPIK.SheetLabels.Actor",
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("jay-spik", JaySpikItemSheet, {
    makeDefault: true,
    label: "JAY_SPIK.SheetLabels.Item",
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("add", function (a, b) {
  return (a || 0) + (b || 0);
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

/* -------------------------------------------- */
/*  Ready Hook - VERSION ULTRA-SIMPLE          */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("✨ JaySpik | Système de postures simple activé");

  // UN SEUL HOOK ultra-simple
  Hooks.on("updateActor", (actor, changes, options, userId) => {
    if (changes.system?.status !== undefined) {
      console.log(
        `📝 Changement posture: ${actor.name} -> ${changes.system.status}`
      );

      // SIMPLE : Délai court puis traitement
      setTimeout(() => {
        handlePostureChange(actor, changes.system.status);
      }, 50);
    }
  });
});

/* -------------------------------------------- */
/*  Gestion des postures - VERSION SIMPLE      */
/* -------------------------------------------- */

async function handlePostureChange(actor, newPosture) {
  console.log(`🎭 Traitement posture ${actor.name}: ${newPosture}`);

  try {
    // ÉTAPE 1: Supprimer TOUS les anciens effets de posture (simple)
    const oldEffects = actor.effects.filter(
      (effect) => effect.flags?.jayspik?.isPosture === true
    );

    if (oldEffects.length > 0) {
      const effectIds = oldEffects.map((e) => e.id);
      console.log(`🗑️ Suppression ${effectIds.length} ancien(s) effet(s)`);

      // Suppression simple en lot
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
    }

    // ÉTAPE 2: Créer le nouvel effet si ce n'est pas "none"
    if (newPosture && newPosture !== "none") {
      await createPostureEffect(actor, newPosture);
    }

    console.log(`✅ Posture ${newPosture} appliquée à ${actor.name}`);
  } catch (error) {
    console.error(`❌ Erreur posture ${actor.name}:`, error);
  }
}

async function createPostureEffect(actor, postureKey) {
  const postureConfig = CONFIG.JAY_SPIK?.statuses?.[postureKey];

  if (!postureConfig) {
    console.warn(`⚠️ Configuration manquante pour: ${postureKey}`);
    return;
  }

  // Effet temporaire ultra-simple
  const effectData = {
    name: `Posture: ${postureConfig.label}`,
    icon: convertFontAwesomeToPath(postureConfig.icon),
    description: postureConfig.description || `Posture ${postureConfig.label}`,
    changes: [], // Pas de changement de stats - purement visuel
    flags: {
      jayspik: {
        isPosture: true,
        postureKey: postureKey,
      },
    },
    disabled: false,
    transfer: true, // Visible sur les tokens
    origin: actor.uuid,
    statuses: [`jayspik-posture-${postureKey}`], // Pour l'affichage token
  };

  console.log(`🎨 Création effet: ${effectData.name}`);
  await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }

  const item = await Item.fromDropData(data);
  const command = `game.jayspik.rollItemMacro("${item.name}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "jay-spik.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);

  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item)
    return ui.notifications.warn(
      `Your controlled Actor does not have an item named ${itemName}`
    );

  return item.roll();
}

// Expose functions globally
globalThis.rollItemMacro = rollItemMacro;

/* -------------------------------------------- */
/*  Hooks d'initialisation                      */
/* -------------------------------------------- */

Hooks.once("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

console.log("✅ JaySpik | Système de postures simple chargé");
