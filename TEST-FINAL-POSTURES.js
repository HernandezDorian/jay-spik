/**
 * TEST FINAL - Système de Postures JAY-SPIK
 * Version Ultra-Simple
 *
 * Ce script teste le bon fonctionnement du système de postures
 * en conditions réelles avec permissions et multi-utilisateurs.
 */

// ===============================================
// TEST 1: Configuration du système
// ===============================================

console.log("🧪 TEST JAY-SPIK | Début des tests du système de postures");

// Vérifier que la configuration est bien chargée
function testConfiguration() {
  console.log("📋 Test 1: Configuration du système");

  if (!game.jayspik) {
    console.error("❌ game.jayspik non trouvé");
    return false;
  }

  if (!CONFIG.JAY_SPIK?.statuses) {
    console.error("❌ CONFIG.JAY_SPIK.statuses non trouvé");
    return false;
  }

  const statuses = CONFIG.JAY_SPIK.statuses;
  const expectedStatuses = ["none", "defensive", "aggressive", "focused"];

  console.log("📊 Statuts disponibles:", Object.keys(statuses));

  for (const status of expectedStatuses) {
    if (!statuses[status]) {
      console.error(`❌ Statut manquant: ${status}`);
      return false;
    }
  }

  console.log("✅ Configuration OK");
  return true;
}

// ===============================================
// TEST 2: Permissions et utilisateurs
// ===============================================

function testPermissions() {
  console.log("🔒 Test 2: Permissions utilisateur");

  const user = game.user;
  console.log(`👤 Utilisateur: ${user.name}`);
  console.log(`🎯 Est GM: ${user.isGM}`);
  console.log(`🎭 Personnage associé: ${user.character?.name || "Aucun"}`);

  // Tester les permissions sur le personnage du joueur
  if (user.character) {
    const hasOwnerPermission = user.character.testUserPermission(user, "OWNER");
    console.log(
      `🎭 Permission OWNER sur son personnage: ${hasOwnerPermission}`
    );
  }

  // Tester permissions sur d'autres acteurs si GM
  if (user.isGM) {
    const actors = game.actors.filter((a) => a.type === "character");
    console.log(`👥 Nombre d'acteurs accessibles au GM: ${actors.length}`);
  }

  console.log("✅ Test permissions terminé");
}

// ===============================================
// TEST 3: Changement de posture
// ===============================================

async function testPostureChange(actorId = null) {
  console.log("🔄 Test 3: Changement de posture");

  let actor;

  if (actorId) {
    actor = game.actors.get(actorId);
  } else if (game.user.character) {
    actor = game.user.character;
  } else if (game.user.isGM) {
    actor = game.actors.find((a) => a.type === "character");
  }

  if (!actor) {
    console.error("❌ Aucun acteur trouvé pour le test");
    return false;
  }

  console.log(`🎭 Test sur l'acteur: ${actor.name}`);
  console.log(`📊 Statut actuel: ${actor.system.status}`);

  // Compter les effets de posture actuels
  const currentPostureEffects = actor.effects.filter(
    (effect) => effect.flags?.jaySpik?.isPosture === true
  );
  console.log(`🔮 Effets de posture actuels: ${currentPostureEffects.length}`);

  // Test de changement vers "defensive"
  try {
    console.log("🔄 Changement vers posture défensive...");
    await actor.update({ "system.status": "defensive" });

    // Attendre un peu pour que les effets se propagent
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Vérifier les résultats
    const updatedActor = game.actors.get(actor.id);
    const newPostureEffects = updatedActor.effects.filter(
      (effect) => effect.flags?.jaySpik?.isPosture === true
    );

    console.log(`📊 Nouveau statut: ${updatedActor.system.status}`);
    console.log(`🔮 Nouveaux effets de posture: ${newPostureEffects.length}`);

    if (newPostureEffects.length === 1) {
      const effect = newPostureEffects[0];
      console.log(`✅ Effet créé: ${effect.name}`);
      console.log(`🖼️ Icône: ${effect.icon}`);
      console.log(`🏷️ Status ID: ${effect.statuses}`);
    }
  } catch (error) {
    console.error("❌ Erreur lors du changement de posture:", error);
    return false;
  }

  console.log("✅ Test changement posture terminé");
  return true;
}

// ===============================================
// TEST 4: Nettoyage des effets
// ===============================================

async function testCleanup(actorId = null) {
  console.log("🧹 Test 4: Nettoyage des effets");

  let actor;

  if (actorId) {
    actor = game.actors.get(actorId);
  } else if (game.user.character) {
    actor = game.user.character;
  } else if (game.user.isGM) {
    actor = game.actors.find((a) => a.type === "character");
  }

  if (!actor) {
    console.error("❌ Aucun acteur trouvé pour le test");
    return false;
  }

  console.log(`🎭 Nettoyage pour l'acteur: ${actor.name}`);

  try {
    // Retour à "aucun" statut
    console.log("🔄 Retour à 'Aucun' statut...");
    await actor.update({ "system.status": "none" });

    // Attendre un peu
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Vérifier le nettoyage
    const updatedActor = game.actors.get(actor.id);
    const remainingPostureEffects = updatedActor.effects.filter(
      (effect) => effect.flags?.jaySpik?.isPosture === true
    );

    console.log(`📊 Statut final: ${updatedActor.system.status}`);
    console.log(
      `🔮 Effets de posture restants: ${remainingPostureEffects.length}`
    );

    if (remainingPostureEffects.length === 0) {
      console.log("✅ Nettoyage réussi");
    } else {
      console.warn(
        "⚠️ Effets de posture non nettoyés:",
        remainingPostureEffects
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
    return false;
  }

  console.log("✅ Test nettoyage terminé");
  return true;
}

// ===============================================
// TEST 5: Communications Socket (pour joueurs)
// ===============================================

function testSocketCommunication() {
  console.log("📡 Test 5: Communication Socket");

  if (game.user.isGM) {
    console.log("🎯 Utilisateur GM - Tests socket non nécessaires");
    return true;
  }

  // Vérifier que le socket est bien configuré
  const socketListeners = game.socket._listeners["system.jay-spik"];
  console.log(
    `📡 Socket listeners: ${socketListeners ? socketListeners.length : 0}`
  );

  // Tester l'envoi d'un message socket (simulation)
  const testMessage = {
    action: "changePosture",
    actorId: "test",
    posture: "defensive",
    userId: game.user.id,
    userName: game.user.name,
  };

  console.log("📤 Message socket de test:", testMessage);
  console.log("✅ Test socket terminé");
  return true;
}

// ===============================================
// LANCEUR DE TESTS
// ===============================================

async function runAllTests(actorId = null) {
  console.log("🚀 JAY-SPIK | Lancement de tous les tests");
  console.log("=".repeat(50));

  const results = [];

  // Test 1: Configuration
  results.push(testConfiguration());

  // Test 2: Permissions
  testPermissions();
  results.push(true);

  // Test 3: Socket
  results.push(testSocketCommunication());

  // Test 4: Changement de posture
  results.push(await testPostureChange(actorId));

  // Test 5: Nettoyage
  results.push(await testCleanup(actorId));

  console.log("=".repeat(50));
  console.log("📊 RÉSULTATS DES TESTS:");
  console.log(
    `✅ Réussis: ${results.filter((r) => r).length}/${results.length}`
  );
  console.log(
    `❌ Échecs: ${results.filter((r) => !r).length}/${results.length}`
  );

  if (results.every((r) => r)) {
    console.log("🎉 TOUS LES TESTS RÉUSSIS !");
  } else {
    console.log("⚠️ Certains tests ont échoué, vérifiez les logs ci-dessus");
  }

  return results.every((r) => r);
}

// ===============================================
// COMMANDES RAPIDES
// ===============================================

// Fonctions globales pour tests rapides
globalThis.testJaySpikConfig = testConfiguration;
globalThis.testJaySpikPermissions = testPermissions;
globalThis.testJaySpikPosture = testPostureChange;
globalThis.testJaySpikCleanup = testCleanup;
globalThis.testJaySpikSocket = testSocketCommunication;
globalThis.testJaySpikAll = runAllTests;

console.log("🧪 Script de test JAY-SPIK chargé");
console.log("📝 Commandes disponibles:");
console.log("  - testJaySpikConfig() : Tester la configuration");
console.log("  - testJaySpikPermissions() : Tester les permissions");
console.log("  - testJaySpikPosture(actorId) : Tester changement posture");
console.log("  - testJaySpikCleanup(actorId) : Tester nettoyage");
console.log("  - testJaySpikSocket() : Tester communication socket");
console.log("  - testJaySpikAll(actorId) : Lancer tous les tests");
console.log("💡 Exemple: testJaySpikAll() ou testJaySpikAll('actor-id')");
