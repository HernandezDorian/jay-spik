// ===============================================
// JAY-SPIK SYSTEM - VERSION FINALE ULTRA-SIMPLE
// ===============================================

console.log("🎯 JAY-SPIK | Système final - ultra-simple");

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
/*  Configuration des Postures/Statuts         */
/* -------------------------------------------- */

const POSTURE_ICONS = {
  none: null,
  defensive: "icons/svg/shield.svg",
  aggressive: "icons/svg/sword.svg",
  focused: "systems/jay-spik/icons/brain-illustration-12-svgrepo-com.svg",
  stealth: "icons/svg/mystery-man.svg",
  rage: "icons/svg/fire.svg",
  speed: "icons/svg/lightning.svg",
  nature: "icons/svg/oak.svg",
  cold: "icons/svg/ice-aura.svg",
  healing: "icons/svg/heal.svg",
  poison: "icons/svg/poison.svg",
  combat: "icons/svg/combat.svg",
  flying: "icons/svg/wing.svg",
};

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("🔧 JAY-SPIK | Initialisation finale");

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
/*  Ready Hook - Système Ultra-Simple           */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("🎯 JAY-SPIK | Système de postures final activé");

  // Configuration du socket pour la communication GM/Joueurs
  game.socket.on("system.jay-spik", handleSocketMessage);
});

/* -------------------------------------------- */
/*  Gestion Socket - Communication GM/Joueurs   */
/* -------------------------------------------- */

async function handleSocketMessage(data) {
  // Seul le GM traite les demandes socket
  if (!game.user.isGM) return;

  console.log(
    `JAY-SPIK: [GM] Réception socket de ${data.userName}:`,
    data.action
  );

  if (data.action === "changePosture") {
    const actor = game.actors.get(data.actorId);
    if (actor) {
      console.log(
        `JAY-SPIK: [GM] Change posture ${actor.name} -> ${data.posture}`
      );

      // Marquer l'update pour éviter la boucle
      await actor.update(
        { "system.status": data.posture },
        { jaySpikSocketProcessed: true }
      );
    }
  }
}

/* -------------------------------------------- */
/*  Hook Principal - Changement de Posture      */
/* -------------------------------------------- */

Hooks.on("updateActor", async (actor, changes, options, userId) => {
  // Vérifier si c'est un changement de statut/posture
  if (changes.system?.status === undefined) return;

  const newPosture = changes.system.status;
  console.log(
    `JAY-SPIK: Changement posture détecté ${actor.name} -> ${newPosture}`
  );

  // Protection contre les appels multiples depuis le socket
  if (options?.jaySpikSocketProcessed) {
    console.log("JAY-SPIK: Changement déjà traité par socket, ignoré");
    return;
  }

  // Vérification des permissions
  const hasPermission =
    game.user.isGM || actor.testUserPermission(game.user, "OWNER");

  if (!hasPermission) {
    console.log(
      `JAY-SPIK: ${game.user.name} n'a pas les permissions, délégation au GM`
    );

    // Déléguer au GM via socket
    const activeGM = game.users.find((u) => u.isGM && u.active);
    if (activeGM) {
      game.socket.emit("system.jay-spik", {
        action: "changePosture",
        actorId: actor.id,
        posture: newPosture,
        userId: game.user.id,
        userName: game.user.name,
      });
      console.log("JAY-SPIK: Demande envoyée au GM");
    } else {
      ui.notifications.warn(
        "Aucun GM connecté pour traiter le changement de posture"
      );
    }
    return;
  }

  // L'utilisateur a les permissions, traiter le changement
  console.log(`JAY-SPIK: ${game.user.name} traite le changement`);
  await changeActorPosture(actor, newPosture);
});

/* -------------------------------------------- */
/*  Fonction Principale - Changement Posture    */
/* -------------------------------------------- */

async function changeActorPosture(actor, newPosture) {
  console.log(`JAY-SPIK: [POSTURE] ${actor.name} -> ${newPosture}`);

  try {
    // ÉTAPE 1: Supprimer TOUS les effets de posture existants
    const postureEffects = actor.effects.filter(
      (effect) => effect.flags?.jaySpik?.isPosture === true
    );

    if (postureEffects.length > 0) {
      const effectIds = postureEffects.map((e) => e.id);
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
      console.log(`JAY-SPIK: Supprimé ${effectIds.length} effet(s) de posture`);
    }

    // ÉTAPE 2: Créer le nouvel effet si nécessaire
    if (newPosture && newPosture !== "none" && POSTURE_ICONS[newPosture]) {
      const postureConfig = JAY_SPIK.statuses?.[newPosture];
      if (!postureConfig) {
        console.warn(
          `JAY-SPIK: Configuration manquante pour la posture: ${newPosture}`
        );
        return;
      }

      const effectData = {
        name: postureConfig.label || `Posture: ${newPosture}`,
        icon: POSTURE_ICONS[newPosture],
        description:
          postureConfig.description || `Posture ${newPosture} active`,
        changes: [], // Aucun effet sur les stats
        disabled: false,
        transfer: true,
        origin: actor.uuid,
        flags: {
          jaySpik: {
            isPosture: true,
            postureKey: newPosture,
          },
          core: {
            statusId: `jayspik-${newPosture}`,
          },
        },
        statuses: [`jayspik-${newPosture}`],
      };

      await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
      console.log(`JAY-SPIK: Créé effet de posture: ${newPosture}`);

      // Notification pour l'utilisateur
      if (game.user.character?.id === actor.id || game.user.isGM) {
        ui.notifications.info(`Posture changée: ${postureConfig.label}`);
      }
    } else {
      console.log("JAY-SPIK: Posture 'Aucun' - aucun effet créé");

      // Notification pour "Aucun"
      if (game.user.character?.id === actor.id || game.user.isGM) {
        ui.notifications.info("Posture supprimée");
      }
    }
  } catch (error) {
    console.error("JAY-SPIK: Erreur lors du changement de posture:", error);
    ui.notifications.error("Erreur lors du changement de posture");
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

console.log("✅ JAY-SPIK | Système final chargé avec succès");
