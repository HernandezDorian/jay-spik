// ===============================================
// TEST RAPIDE - PROBLÈME JOUEURS VS GM
// ===============================================

console.log("🕵️ TEST RAPIDE - Différences Joueurs/GM");

// Informations sur l'utilisateur actuel
const currentUser = game.user;
console.log(
  `👤 Utilisateur actuel: ${currentUser.name} (${
    currentUser.isGM ? "GM" : "Joueur"
  })`
);

// Fonction pour tester les permissions sur un acteur
function testActorPermissions(actorName) {
  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error(`❌ Acteur '${actorName}' non trouvé`);
    return;
  }

  console.group(`🎭 Test permissions - ${actor.name}`);

  // Tester différents niveaux de permission
  const permissions = ["NONE", "LIMITED", "OBSERVER", "OWNER"];
  permissions.forEach((level) => {
    const hasPermission = actor.testUserPermission(currentUser, level);
    const icon = hasPermission ? "✅" : "❌";
    console.log(`${icon} ${level}: ${hasPermission}`);
  });

  // Tester si on peut modifier les ActiveEffect
  const canModifyEffects =
    actor.testUserPermission(currentUser, "OWNER") || currentUser.isGM;
  console.log(
    `🎯 Peut modifier ActiveEffect: ${canModifyEffects ? "OUI" : "NON"}`
  );

  // Compter les effets de statut actuels
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

  console.log(`📊 Effets de statut actuels: ${statusEffects.length}`);
  if (statusEffects.length > 0) {
    statusEffects.forEach((effect, i) => {
      console.log(`  [${i}] ${effect.name} (${effect.id})`);
    });
  }

  console.groupEnd();
  return { actor, canModifyEffects, statusEffects };
}

// Fonction pour simuler un changement de statut et mesurer le timing
async function simulateStatusChange(actorName, newStatus) {
  console.group(`⏱️ Test timing changement - ${actorName} -> ${newStatus}`);

  const startTime = Date.now();
  const actor = game.actors.getName(actorName);

  if (!actor) {
    console.error("Acteur non trouvé");
    console.groupEnd();
    return;
  }

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
  }).length;

  console.log(`📊 Effets AVANT: ${beforeEffects}`);
  console.log(`👤 Type utilisateur: ${currentUser.isGM ? "GM" : "Joueur"}`);

  try {
    // Effectuer le changement
    await actor.update({ "system.status": newStatus });
    const updateTime = Date.now() - startTime;
    console.log(`⚡ Temps update: ${updateTime}ms`);

    // Vérifier à intervalles réguliers
    const checkTimes = [100, 250, 500, 1000, 2000];

    for (const delay of checkTimes) {
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          delay - (checkTimes[checkTimes.indexOf(delay) - 1] || 0)
        )
      );

      const effectsCount = actor.effects.filter((effect) => {
        try {
          return (
            effect.flags?.jaySpik?.isStatusEffect ||
            (Array.isArray(effect.statuses) &&
              effect.statuses.some((s) => s.startsWith("jayspik-")))
          );
        } catch (e) {
          return false;
        }
      }).length;

      const status =
        effectsCount > 1
          ? "🚨 DOUBLON"
          : effectsCount === 1
          ? "✅ OK"
          : "⚪ AUCUN";
      console.log(`📊 T+${delay}ms: ${effectsCount} effets - ${status}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du changement:", error);
  }

  console.groupEnd();
}

// Test automatique si il y a des acteurs
if (game.actors.size > 0) {
  const testActor = game.actors.contents[0];
  console.log(`🎯 Acteur de test: ${testActor.name}`);

  // Tester les permissions
  const permResult = testActorPermissions(testActor.name);

  // Fonctions de test disponibles
  window.testPermissions = testActorPermissions;
  window.testStatusTiming = simulateStatusChange;

  // Test rapide des permissions sur tous les acteurs
  window.testAllActorPermissions = function () {
    console.group("🔍 Test permissions tous acteurs");
    game.actors.forEach((actor) => {
      const canModify =
        actor.testUserPermission(currentUser, "OWNER") || currentUser.isGM;
      const icon = canModify ? "✅" : "❌";
      console.log(
        `${icon} ${actor.name}: ${
          canModify ? "PEUT MODIFIER" : "LECTURE SEULE"
        }`
      );
    });
    console.groupEnd();
  };

  // Test de changements multiples
  window.testMultipleChanges = async function (actorName, count = 3) {
    console.log(`🔄 Test ${count} changements rapides pour ${actorName}`);
    const statuses = ["defensive", "aggressive", "focused", "none"];

    for (let i = 0; i < count; i++) {
      const status = statuses[i % statuses.length];
      console.log(`\n--- Changement ${i + 1}/${count} ---`);
      await simulateStatusChange(actorName, status);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Pause entre tests
    }
  };
} else {
  console.warn("⚠️ Aucun acteur disponible pour les tests");
}

console.log("=== FONCTIONS DE TEST DISPONIBLES ===");
console.log("- window.testPermissions('NomActeur')");
console.log("- window.testStatusTiming('NomActeur', 'defensive')");
console.log("- window.testAllActorPermissions()");
console.log("- window.testMultipleChanges('NomActeur', 3)");

console.log("\n💡 RECOMMANDATIONS:");
if (currentUser.isGM) {
  console.log("👑 Vous êtes GM - testez avec un compte joueur pour comparer");
} else {
  console.log("👤 Vous êtes joueur - comparez avec les actions GM");
}
console.log("📊 Surveillez les messages '[MONITOR]' dans la console");
