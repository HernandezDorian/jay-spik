// ===============================================
// DIAGNOSTIC MULTI-UTILISATEURS - DOUBLONS
// ===============================================

console.log("🔍 DIAGNOSTIC MULTI-UTILISATEURS");

// Informations sur la session actuelle
console.log(
  `👤 Utilisateur actuel: ${game.user.name} (${
    game.user.isGM ? "GM" : "Joueur"
  })`
);
console.log(
  `👥 Utilisateurs connectés: ${game.users
    .filter((u) => u.active)
    .map((u) => u.name)
    .join(", ")}`
);

// Fonction pour surveiller TOUS les hooks updateActor
let hookCallCount = 0;
const originalHookCall = Hooks._call;

// Intercepter TOUS les appels de hooks
Hooks._call = function (hook, ...args) {
  if (hook === "updateActor") {
    const [actor, changes, options, userId] = args;

    if (changes.system?.status !== undefined) {
      hookCallCount++;

      console.warn(`🔄 HOOK updateActor #${hookCallCount}`);
      console.warn(
        `  📍 Client: ${game.user.name} (${game.user.isGM ? "GM" : "Joueur"})`
      );
      console.warn(`  🎭 Acteur: ${actor.name}`);
      console.warn(`  🔄 Statut: ${changes.system.status}`);
      console.warn(
        `  👤 Initié par: ${game.users.get(userId)?.name || userId}`
      );
      console.warn(`  🏷️ Options:`, options);

      // Vérifier les permissions sur ce client
      const canProcess =
        game.user.isGM || actor.testUserPermission(game.user, "OWNER");
      console.warn(`  🔑 Peut traiter: ${canProcess ? "OUI" : "NON"}`);

      // Compter les effets de statut AVANT
      const beforeEffects = actor.effects.filter((effect) => {
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
      console.warn(`  📊 Effets AVANT: ${beforeEffects.length}`);
    }
  }

  // Appeler la fonction originale
  return originalHookCall.apply(this, [hook, ...args]);
};

// Fonction pour tester un changement et voir tous les hooks
window.testMultiUserChange = function (actorName, newStatus) {
  console.group(`🧪 TEST MULTI-USER - ${actorName} -> ${newStatus}`);

  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error("Acteur non trouvé");
    console.groupEnd();
    return;
  }

  console.log("🚀 Déclenchement du changement...");
  hookCallCount = 0; // Reset compteur

  // Faire le changement
  actor.update({ "system.status": newStatus }).then(() => {
    // Vérifier après un délai
    setTimeout(() => {
      const finalEffects = actor.effects.filter((effect) => {
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

      console.log(`📊 RÉSULTAT FINAL:`);
      console.log(`  - Hooks déclenchés: ${hookCallCount}`);
      console.log(`  - Effets finaux: ${finalEffects.length}`);

      if (finalEffects.length > 1) {
        console.error(`🚨 DOUBLON DÉTECTÉ! ${finalEffects.length} effets`);
        finalEffects.forEach((effect, i) => {
          console.error(`  [${i}] ${effect.name} (${effect.id})`);
        });
      } else if (finalEffects.length === 1) {
        console.log(`✅ OK - 1 effet comme attendu`);
      } else {
        console.log(`⚪ Aucun effet (normal si statut = 'none')`);
      }

      console.groupEnd();
    }, 2000);
  });
};

// Fonction pour voir qui peut traiter quoi
window.showPermissionsMatrix = function () {
  console.group("🔐 MATRICE DES PERMISSIONS");

  game.actors.forEach((actor) => {
    const canProcess =
      game.user.isGM || actor.testUserPermission(game.user, "OWNER");
    const icon = canProcess ? "✅" : "❌";

    console.log(
      `${icon} ${actor.name}: ${canProcess ? "PEUT TRAITER" : "DÉLÉGATION GM"}`
    );
  });

  console.groupEnd();
};

// Fonction pour nettoyer les doublons en mode d'urgence
window.emergencyCleanupAll = function () {
  console.log("🚨 NETTOYAGE D'URGENCE GLOBAL");

  let totalCleaned = 0;

  game.actors.forEach((actor) => {
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

    if (statusEffects.length > 1) {
      console.log(
        `🧹 ${actor.name}: ${statusEffects.length} effets à nettoyer`
      );

      // Garder seulement le plus récent
      statusEffects.sort((a, b) => (b.createdTime || 0) - (a.createdTime || 0));
      const toDelete = statusEffects.slice(1);

      toDelete.forEach(async (effect) => {
        try {
          if (game.user.isGM || actor.testUserPermission(game.user, "OWNER")) {
            await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
            totalCleaned++;
            console.log(`  ✅ Supprimé: ${effect.name}`);
          } else {
            console.log(`  ❌ Pas de permissions pour: ${effect.name}`);
          }
        } catch (error) {
          console.log(`  ⚠️ Erreur: ${effect.name} - ${error.message}`);
        }
      });
    }
  });

  setTimeout(() => {
    console.log(`✅ Nettoyage terminé - ${totalCleaned} effets supprimés`);
  }, 1000);
};

console.log("=== FONCTIONS DE DIAGNOSTIC ===");
console.log("- window.testMultiUserChange('NomActeur', 'defensive')");
console.log("- window.showPermissionsMatrix()");
console.log("- window.emergencyCleanupAll()");
console.log(
  "\n👁️ Surveillance des hooks activée - tous les appels seront loggés"
);
