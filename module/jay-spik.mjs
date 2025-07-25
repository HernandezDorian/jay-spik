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
 * @param {string} fontAwesomeClass - Classe FontAwesome (ex: "fas fa-shield-alt")
 * @returns {string} Chemin vers l'icône ou icône par défaut
 */
function convertFontAwesomeToPath(fontAwesomeClass) {
  // Mapping des icônes FontAwesome vers des icônes SVG natives de FoundryVTT
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
  };

  const iconPath = iconMapping[fontAwesomeClass];
  return iconPath || "icons/svg/aura.svg";
}

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.jayspik = {
    JaySpikActor,
    JaySpikItem,
    rollItemMacro,
    DamageManager,
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

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = JaySpikActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
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
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Enregistrer les status effects personnalisés pour JaySpik
  CONFIG.statusEffects = CONFIG.statusEffects || [];

  // Ajouter nos status effects personnalisés (exclure "none")
  Object.entries(JAY_SPIK.statuses || {}).forEach(([key, config]) => {
    if (key !== "none" && config.icon) {
      CONFIG.statusEffects.push({
        id: `jayspik-${key}`,
        name: config.label,
        icon: convertFontAwesomeToPath(config.icon),
        description: config.description,
      });
    }
  });

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

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

// Helper pour additionner deux valeurs
Handlebars.registerHelper("add", function (a, b) {
  return (a || 0) + (b || 0);
});

// Helper pour vérifier l'égalité
Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  // Initialize the damage manager for socket communication
  DamageManager.initialize();

  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));

  // Hook pour afficher les icônes de statut sur les tokens
  // Note: Désactivé car nous utilisons maintenant les effets natifs de FoundryVTT
  // Hooks.on("refreshToken", (token) => {
  //   updateTokenStatusDisplay(token);
  // });

  // Hook pour mettre à jour les statuts quand l'acteur change
  Hooks.on("updateActor", (actor, changes) => {
    if (changes.system?.status !== undefined) {
      // Mettre à jour les Active Effects pour afficher sur les tokens
      updateStatusActiveEffect(actor, changes.system.status);
    }
  });

  // Hook pour s'assurer que les tokens affichent bien les effets actifs
  Hooks.on("createToken", (token) => {
    // Vérifier si l'acteur du token a un statut actif
    const actor = token.actor;
    if (actor?.system?.status && actor.system.status !== "none") {
      // Forcer la mise à jour des effets actifs
      setTimeout(() => {
        updateStatusActiveEffect(actor, actor.system.status);
      }, 100);
    }
  });

  // Informer les utilisateurs du système de gestion des dégâts
  if (!game.user.isGM && game.users.some((u) => u.isGM && u.active)) {
    ui.notifications.info(
      "Système de dégâts automatisé activé. Les dégâts seront appliqués automatiquement par le GM."
    );
  } else if (!game.user.isGM && !game.users.some((u) => u.isGM && u.active)) {
    ui.notifications.warn(
      "Aucun GM connecté. Les dégâts ne pourront pas être appliqués automatiquement."
    );
  }

  // Initialiser les effets actifs des acteurs existants au démarrage
  game.actors.forEach((actor) => {
    if (actor.system?.status && actor.system.status !== "none") {
      // Appliquer l'effet actif sur l'acteur
      updateStatusActiveEffect(actor, actor.system.status);
    }
  });
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.jayspik.rollItemMacro("${data.uuid}");`;
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

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: "Item",
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}

/* -------------------------------------------- */
/*  Chat Message Hooks                          */
/* -------------------------------------------- */

// Gestionnaire de clics pour les boutons d'application de dégâts
Hooks.on("renderChatMessage", (message, html, data) => {
  html.find(".apply-damage").click(async (event) => {
    event.preventDefault();

    // Seuls les GMs peuvent appliquer les dégâts
    if (!game.user.isGM) {
      ui.notifications.warn("Seul le GM peut appliquer les dégâts.");
      return;
    }

    const button = event.currentTarget;
    const targets = JSON.parse(button.dataset.targets);
    const damage = parseInt(button.dataset.damage);
    const armorPiercing = button.dataset.armorPiercing === "true";
    const itemName = button.dataset.itemName;

    console.log("Application des dégâts via bouton chat:", {
      targets,
      damage,
      armorPiercing,
    });

    // Debugging détaillé
    console.log("=== DEBUG DÉTAILLÉ ===");
    console.log("Nombre de cibles:", targets.length);
    console.log("game.user.isGM:", game.user.isGM);
    console.log("game.actors:", game.actors);
    console.log("canvas.tokens:", canvas.tokens?.objects);

    try {
      const results = [];

      for (const target of targets) {
        console.log(`--- Traitement de la cible: ${target.name} ---`);
        console.log("Target data:", target);

        // IMPORTANT: Récupérer d'abord l'acteur via le token (priorité car c'est ce qui est sur la scène)
        let actor = null;

        // 1. Essayer via le token sur le canvas (ActorDelta si token lié)
        if (target.id) {
          const token = canvas.tokens.get(target.id);
          console.log(`canvas.tokens.get(${target.id}):`, token);
          if (token && token.actor) {
            actor = token.actor;
            console.log(
              "✅ Acteur récupéré via canvas token (priorité):",
              actor
            );
            console.log("Type d'acteur:", actor.constructor.name);
          }
        }

        // 2. Si pas trouvé, essayer via les token documents de la scène
        if (!actor && target.id) {
          console.log("Essai via game.scenes.current.tokens");
          const tokenDoc = game.scenes.current?.tokens?.get(target.id);
          console.log(`Token document trouvé:`, tokenDoc);
          if (tokenDoc?.actor) {
            actor = tokenDoc.actor;
            console.log("✅ Acteur récupéré via token document:", actor);
            console.log("Type d'acteur:", actor.constructor.name);
          }
        }

        // 3. En dernier recours, utiliser l'acteur de base
        if (!actor) {
          console.log("Fallback: récupération via game.actors");
          actor = game.actors.get(target.actorId);
          console.log(`game.actors.get(${target.actorId}):`, actor);
          if (actor) {
            console.log(
              "⚠️ Acteur récupéré via game.actors (fallback):",
              actor
            );
            console.log("Type d'acteur:", actor.constructor.name);
          }
        }

        if (!actor) {
          console.warn(`Acteur définitivement non trouvé: ${target.name}`);
          results.push({
            target: target.name,
            error: "Acteur non trouvé",
            damageRolled: damage,
            finalDamage: 0,
            armor: 0,
            blocked: 0,
          });
          continue;
        }

        console.log(
          `Acteur trouvé: ${actor.name} (Type: ${actor.constructor.name})`
        );
        console.log("actor.system:", actor.system);
        console.log(
          "typeof actor.system.applyDamage:",
          typeof actor.system.applyDamage
        );

        try {
          // Essayer d'abord la méthode alternative applyDamageDirectly
          if (
            actor.system &&
            typeof actor.system.applyDamageDirectly === "function"
          ) {
            console.log(
              `==> Application des dégâts via applyDamageDirectly pour ${actor.name}`
            );
            console.log(
              `Paramètres: damage=${damage}, armorPiercing=${armorPiercing}`
            );

            const result = await actor.system.applyDamageDirectly(
              damage,
              armorPiercing,
              actor
            );
            console.log("Résultat de applyDamageDirectly:", result);

            result.target = actor.name;
            results.push(result);
          }
          // Sinon utiliser la méthode applyDamage de l'acteur si elle existe
          else if (
            actor.system &&
            typeof actor.system.applyDamage === "function"
          ) {
            console.log(
              `==> Application des dégâts via applyDamage pour ${actor.name}`
            );
            console.log(
              `Paramètres: damage=${damage}, armorPiercing=${armorPiercing}`
            );

            const result = await actor.system.applyDamage(
              damage,
              armorPiercing
            );
            console.log("Résultat de applyDamage:", result);

            result.target = actor.name;
            results.push(result);
          } else {
            console.log(
              `==> Application manuelle des dégâts pour ${actor.name}`
            );
            console.log(
              "actor.system.getTotalArmor:",
              typeof actor.system.getTotalArmor
            );

            // Méthode manuelle si applyDamage n'existe pas
            const armor = armorPiercing
              ? 0
              : actor.system.getTotalArmor
              ? actor.system.getTotalArmor()
              : 0;
            console.log(`Armure calculée: ${armor}`);

            const finalDamage = Math.max(0, damage - armor);
            const blocked = damage - finalDamage;
            console.log(`Dégâts: ${damage} - ${armor} = ${finalDamage}`);

            if (finalDamage > 0) {
              const currentHealth = actor.system.health.value;
              const newHealth = Math.max(0, currentHealth - finalDamage);
              console.log(`Santé: ${currentHealth} -> ${newHealth}`);

              console.log("Appel de actor.update...");
              const updateResult = await actor.update({
                "system.health.value": newHealth,
              });
              console.log("Résultat de l'update:", updateResult);

              console.log(
                `Dégâts appliqués à ${actor.name}: ${currentHealth} -> ${newHealth}`
              );
            } else {
              console.log("Aucun dégât à appliquer (finalDamage <= 0)");
            }

            results.push({
              target: actor.name,
              damageRolled: damage,
              armor: armor,
              finalDamage: finalDamage,
              blocked: blocked,
              armorPiercing: armorPiercing,
            });
          }
        } catch (actorError) {
          console.error(
            `Erreur lors de l'application des dégâts à ${actor.name}:`,
            actorError
          );
          results.push({
            target: actor.name,
            error: actorError.message,
            damageRolled: damage,
            finalDamage: 0,
            armor: 0,
            blocked: 0,
          });
        }
      }

      console.log("=== FIN DEBUG - Résultats finaux ===");
      console.log("Results:", results);

      // Créer un message de résultats
      let resultContent = `<div class="damage-results"><h4>Résultats de ${itemName}</h4>`;

      results.forEach((result) => {
        if (result.error) {
          resultContent += `<p><strong>${result.target}:</strong> <em>${result.error}</em></p>`;
        } else {
          const armorText =
            result.armor > 0 ? ` (${result.blocked} bloqués par l'armure)` : "";
          resultContent += `<p><strong>${result.target}:</strong> ${result.finalDamage} dégâts${armorText}</p>`;
        }
      });

      resultContent += "</div>";

      // Envoyer le message de résultats
      await ChatMessage.create({
        user: game.user.id,
        content: resultContent,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      });

      // Désactiver le bouton pour éviter les doubles applications
      button.disabled = true;
      button.textContent = "Dégâts appliqués";
      button.style.opacity = "0.5";

      ui.notifications.success("Dégâts appliqués avec succès!");
    } catch (error) {
      console.error("Erreur lors de l'application des dégâts:", error);
      ui.notifications.error(
        `Erreur lors de l'application des dégâts: ${error.message}`
      );
    }
  });
});

// Test manuel pour debug - à supprimer après
window.testApplyDamage = async function (actorId, damage) {
  console.log("=== TEST MANUEL D'APPLICATION DE DÉGÂTS ===");

  const actor = game.actors.get(actorId);
  console.log("Acteur trouvé:", actor);

  if (!actor) {
    console.error("Acteur non trouvé:", actorId);
    return;
  }

  const currentHealth = actor.system.health.value;
  console.log("Santé actuelle:", currentHealth);

  const newHealth = Math.max(0, currentHealth - damage);
  console.log("Nouvelle santé:", newHealth);

  try {
    const result = await actor.update({
      "system.health.value": newHealth,
    });
    console.log("Résultat de l'update:", result);
    console.log("Santé après update:", actor.system.health.value);
  } catch (error) {
    console.error("Erreur lors de l'update:", error);
  }
};

/* -------------------------------------------- */
/*  Token Status Effects Management            */
/* -------------------------------------------- */
/*  Active Effects Status Management           */
/* -------------------------------------------- */

/**
 * Met à jour l'Active Effect de statut d'un acteur (comme les Temporary Effects)
 * @param {Actor} actor - L'acteur
 * @param {string} newStatus - Le nouveau statut ("none" pour supprimer)
 */
async function updateStatusActiveEffect(actor, newStatus) {
  // Supprimer l'ancien effet de statut s'il existe
  await removeExistingStatusEffect(actor);

  // Si le nouveau statut n'est pas "none", créer un nouvel Active Effect
  if (newStatus && newStatus !== "none") {
    await createStatusActiveEffect(actor, newStatus);
  }
}

/**
 * Supprime l'Active Effect de statut existant
 * @param {Actor} actor - L'acteur
 */
async function removeExistingStatusEffect(actor) {
  const existingEffect = actor.effects.find(
    (effect) => effect.flags?.jaySpik?.isStatusEffect
  );

  if (existingEffect) {
    await existingEffect.delete();
  }
}

/**
 * Crée un Temporary Effect de statut (s'affiche sur les tokens)
 * @param {Actor} actor - L'acteur
 * @param {string} statusKey - La clé du statut
 */
async function createStatusActiveEffect(actor, statusKey) {
  const statusConfig = CONFIG.JAY_SPIK?.statuses?.[statusKey];
  if (!statusConfig) return;

  // Créer un Temporary Effect (pas un Active Effect passif)
  const effectData = {
    name: statusConfig.label,
    icon: convertFontAwesomeToPath(statusConfig.icon),
    changes: [], // Pas de changement de stats - effet purement visuel
    flags: {
      jaySpik: {
        isStatusEffect: true,
        statusKey: statusKey,
      },
      core: {
        statusId: `jayspik-${statusKey}`,
      },
    },
    duration: {
      // Propriétés pour un Temporary Effect
      rounds: undefined,
      seconds: undefined,
      startRound: undefined,
      startTime: undefined,
    },
    disabled: false,
    transfer: true, // CRUCIAL : permet l'affichage sur les tokens
    origin: actor.uuid, // Important pour les Temporary Effects
    statuses: [`jayspik-${statusKey}`], // Status ID pour l'affichage sur token
  };

  await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
}

/* -------------------------------------------- */
/*  Anciennes fonctions Token (commentées)     */
/*  Maintenant remplacées par les status effects natifs */
/* -------------------------------------------- */

/*
 * Met à jour l'affichage du statut sur un token
 * @param {Token} token - Le token à mettre à jour
 */
/*
function updateTokenStatusDisplay(token) {
  if (!token?.actor?.system?.status || token.actor.system.status === "none") {
    // Pas de statut ou statut "none", supprimer l'icône si elle existe
    removeStatusIcon(token);
    return;
  }

  const status = token.actor.system.status;
  const statusConfig = CONFIG.JAY_SPIK?.statuses?.[status];

  if (!statusConfig) {
    removeStatusIcon(token);
    return;
  }

  // Créer ou mettre à jour l'icône de statut
  createStatusIcon(token, status, statusConfig);
}
*/

/*
 * Crée une icône de statut sur un token
 * @param {Token} token - Le token
 * @param {string} statusKey - La clé du statut
 * @param {Object} statusConfig - La configuration du statut
 */
/*
function createStatusIcon(token, statusKey, statusConfig) {
  // Supprimer l'ancienne icône si elle existe
  removeStatusIcon(token);

  // Créer le conteneur d'icône
  const iconElement = document.createElement("div");
  iconElement.className = `token-status-icon ${statusKey}`;
  iconElement.innerHTML = `<i class="${statusConfig.icon}"></i>`;
  iconElement.style.backgroundColor = statusConfig.color;
  iconElement.title = `${statusConfig.label}: ${getStatusDescription(
    statusKey
  )}`;

  // Ajouter l'icône au token
  const tokenElement = token.mesh?.texture?.baseTexture?.resource?.source;
  if (tokenElement?.parentElement) {
    iconElement.setAttribute("data-jay-spik-status", statusKey);
    tokenElement.parentElement.appendChild(iconElement);
  }
}
*/

/*
 * Supprime l'icône de statut d'un token
 * @param {Token} token - Le token
 */
/*
function removeStatusIcon(token) {
  const tokenElement = token.mesh?.texture?.baseTexture?.resource?.source;
  if (tokenElement?.parentElement) {
    const existingIcon = tokenElement.parentElement.querySelector(
      "[data-jay-spik-status]"
    );
    if (existingIcon) {
      existingIcon.remove();
    }
  }
}
*/

/*
 * Récupère la description d'un statut
 * @param {string} statusKey - La clé du statut
 * @returns {string} La description du statut
 */
/*
function getStatusDescription(statusKey) {
  const descriptions = {
    defensive:
      "Le personnage adopte une posture défensive, privilégiant la protection. +10 en défense, -5 en attaque.",
    aggressive:
      "Le personnage attaque sans retenue, sacrifiant sa défense pour l'offensive. +10 en attaque, -5 en défense.",
    focused:
      "Le personnage se concentre profondément, améliorant ses capacités mentales. +15 en mental, -10 en physique.",
  };

  return descriptions[statusKey] || "Statut inconnu";
}
*/
