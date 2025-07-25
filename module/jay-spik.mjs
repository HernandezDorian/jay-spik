// ===============================================
// RESTAURATION D'URGENCE - JAY-SPIK.MJS
// ===============================================

console.log("🚨 APPLICATION RESTAURATION D'URGENCE");

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
/*  Utility Functions                           */
/* -------------------------------------------- */

/**
 * Convertit une icône FontAwesome en chemin d'image utilisable par FoundryVTT
 */
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
  console.log("🔧 JaySpik | Initialisation d'urgence");

  // Add utility classes to the global game object
  game.jayspik = {
    JaySpikActor,
    JaySpikItem,
    rollItemMacro,
    DamageManager,
  };

  // Add custom constants for configuration.
  CONFIG.JAY_SPIK = JAY_SPIK;

  // Combat initiative
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

  CONFIG.ActiveEffect.legacyTransferral = false;

  // Status effects (version simple pour restauration)
  CONFIG.statusEffects = CONFIG.statusEffects || [];
  if (JAY_SPIK.statuses) {
    Object.entries(JAY_SPIK.statuses).forEach(([key, config]) => {
      if (key !== "none" && config.icon) {
        CONFIG.statusEffects.push({
          id: `jayspik-${key}`,
          name: config.label,
          icon: convertFontAwesomeToPath(config.icon),
          description: config.description,
        });
      }
    });
  }

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
/*  Ready Hook - Version simplifiée             */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("🚨 JaySpik | Mode d'urgence activé");

  // Hook simple pour les statuts (sans système de queue pour l'instant)
  Hooks.on("updateActor", (actor, changes, options, userId) => {
    if (changes.system?.status !== undefined) {
      console.log(
        `JaySpik: Changement statut ${actor.name} -> ${changes.system.status}`
      );

      // Version ultra-simple : supprimer tous les anciens effets, créer le nouveau
      setTimeout(() => {
        updateStatusSimple(actor, changes.system.status);
      }, 100);
    }
  });
});

/* -------------------------------------------- */
/*  Status Management - Version simple          */
/* -------------------------------------------- */

async function updateStatusSimple(actor, newStatus) {
  console.log(`JaySpik: [SIMPLE] Mise à jour ${actor.name} -> ${newStatus}`);

  try {
    // Supprimer tous les effets de statut existants
    const statusEffects = actor.effects.filter((effect) => {
      try {
        return (
          effect.flags?.jaySpik?.isStatusEffect ||
          (Array.isArray(effect.statuses) &&
            effect.statuses.some((s) => s.startsWith("jayspik-")))
        );
      } catch (e) {
        return false;
      }
    });

    if (statusEffects.length > 0) {
      const effectIds = statusEffects.map((e) => e.id);
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
      console.log(`JaySpik: Supprimé ${effectIds.length} effet(s)`);
    }

    // Créer le nouveau si nécessaire
    if (newStatus && newStatus !== "none") {
      const statusConfig = CONFIG.JAY_SPIK?.statuses?.[newStatus];
      if (statusConfig) {
        const effectData = {
          name: statusConfig.label,
          icon: convertFontAwesomeToPath(statusConfig.icon),
          description: statusConfig.description,
          changes: [],
          flags: {
            jaySpik: {
              isStatusEffect: true,
              statusKey: newStatus,
            },
            core: {
              statusId: `jayspik-${newStatus}`,
            },
          },
          disabled: false,
          transfer: true,
          origin: actor.uuid,
          statuses: [`jayspik-${newStatus}`],
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
        console.log(`JaySpik: Créé effet ${newStatus}`);
      }
    }
  } catch (error) {
    console.error("JaySpik: Erreur simple:", error);
  }
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

console.log("✅ JaySpik | Restauration d'urgence chargée");
