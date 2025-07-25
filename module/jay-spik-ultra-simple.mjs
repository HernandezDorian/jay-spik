// ===============================================
// JAY-SPIK SYSTEM - VERSION ULTRA SIMPLE
// Juste: supprimer anciens effets + créer nouveau
// ===============================================

console.log("🎯 JAY-SPIK | Version ultra-simple");

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
/*  Icônes des Postures                         */
/* -------------------------------------------- */

const POSTURE_ICONS = {
  none: null,
  defensive: "icons/svg/shield.svg",
  aggressive: "icons/svg/sword.svg",
  focused: "systems/jay-spik/icons/brain-illustration-12-svgrepo-com.svg",
};

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("🔧 JAY-SPIK | Initialisation");

  // Add utility classes to the global game object
  game.jayspik = {
    JaySpikActor,
    JaySpikItem,
    DamageManager,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.JAY_SPIK = JAY_SPIK;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20 + @abilities.dex.mod",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = JaySpikActor;
  CONFIG.Item.documentClass = JaySpikItem;
  CONFIG.Actor.dataModels = models.actor;
  CONFIG.Item.dataModels = models.item;

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

// Handlebars helpers
Handlebars.registerHelper("concat", function () {
  var outStr = "";
  for (var arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

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
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("🎯 JAY-SPIK | Système de postures activé");
});

/* -------------------------------------------- */
/*  Hook ULTRA-SIMPLE pour les postures         */
/* -------------------------------------------- */

Hooks.on("updateActor", async (actor, changes, options, userId) => {
  // Seulement si le statut a changé
  if (!changes.system?.status) return;

  console.log(
    `JAY-SPIK: ${actor.name} change de posture -> ${changes.system.status}`
  );

  // ÉTAPE 1: SUPPRIMER TOUS LES ANCIENS EFFETS DE POSTURE
  const oldEffects = actor.effects.filter((e) => e.flags?.jaySpik?.isPosture);
  if (oldEffects.length > 0) {
    await actor.deleteEmbeddedDocuments(
      "ActiveEffect",
      oldEffects.map((e) => e.id)
    );
    console.log(`JAY-SPIK: Supprimé ${oldEffects.length} ancien(s) effet(s)`);
  }

  // ÉTAPE 2: CRÉER LE NOUVEL EFFET SI BESOIN
  const newPosture = changes.system.status;
  if (newPosture && newPosture !== "none" && POSTURE_ICONS[newPosture]) {
    const config = JAY_SPIK.statuses?.[newPosture];
    if (config) {
      const effectData = {
        name: config.label,
        icon: POSTURE_ICONS[newPosture],
        description: config.description,
        changes: [],
        disabled: false,
        transfer: true,
        flags: {
          jaySpik: { isPosture: true },
        },
      };

      await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
      console.log(`JAY-SPIK: Créé effet ${config.label}`);
    }
  }
});

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

console.log("✅ JAY-SPIK | Version ultra-simple chargée");
