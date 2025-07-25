// Test de Validation - Correction des Erreurs de Concurrence
// À exécuter dans la console F12 de FoundryVTT

console.log("=== TESTS DE VALIDATION - EFFETS DE STATUT ===");

// Test 1 : Vérifier qu'il n'y a pas d'effets multiples
function testNoMultipleEffects() {
  console.log("\n--- Test 1 : Vérification des effets uniques ---");

  game.actors.forEach((actor) => {
    if (actor.type === "character" || actor.type === "npc") {
      const statusEffects = actor.effects.filter(
        (effect) =>
          effect.flags?.jaySpik?.isStatusEffect ||
          effect.statuses?.some((s) => s.startsWith("jayspik-"))
      );

      if (statusEffects.length > 1) {
        console.error(
          `❌ ${actor.name} a ${statusEffects.length} effets de statut !`
        );
      } else if (statusEffects.length === 1) {
        console.log(
          `✅ ${actor.name} : 1 effet de statut (${statusEffects[0].name})`
        );
      } else {
        console.log(`✅ ${actor.name} : aucun effet de statut`);
      }
    }
  });
}

// Test 2 : Changements rapides de statut
async function testRapidStatusChanges() {
  console.log("\n--- Test 2 : Changements rapides de statut ---");

  const testActor = game.actors.find((a) => a.type === "character");
  if (!testActor) {
    console.error("❌ Aucun personnage trouvé pour le test");
    return;
  }

  console.log(`Test sur ${testActor.name}`);

  try {
    // Série de changements rapides
    await testActor.update({ "system.status": "defensive" });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await testActor.update({ "system.status": "offensive" });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await testActor.update({ "system.status": "focused" });
    await new Promise((resolve) => setTimeout(resolve, 50));

    await testActor.update({ "system.status": "none" });
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Vérifier le résultat
    const statusEffects = testActor.effects.filter(
      (effect) =>
        effect.flags?.jaySpik?.isStatusEffect ||
        effect.statuses?.some((s) => s.startsWith("jayspik-"))
    );

    if (statusEffects.length === 0) {
      console.log("✅ Changements rapides réussis, aucun effet restant");
    } else {
      console.error(
        `❌ ${statusEffects.length} effet(s) restant(s) après test`
      );
    }
  } catch (error) {
    console.error("❌ Erreur lors des changements rapides:", error);
  }
}

// Test 3 : Stress test avec plusieurs acteurs
async function testMultipleActorsStress() {
  console.log("\n--- Test 3 : Stress test avec plusieurs acteurs ---");

  const actors = game.actors.filter(
    (a) => a.type === "character" || a.type === "npc"
  );
  const statuses = ["defensive", "offensive", "focused", "none"];

  console.log(`Test sur ${actors.length} acteurs`);

  const promises = actors.map((actor, index) => {
    const status = statuses[index % statuses.length];
    return new Promise(async (resolve) => {
      try {
        await actor.update({ "system.status": status });
        resolve(`✅ ${actor.name}: ${status}`);
      } catch (error) {
        resolve(`❌ ${actor.name}: ERREUR - ${error.message}`);
      }
    });
  });

  const results = await Promise.all(promises);
  results.forEach((result) => console.log(result));

  // Attendre un peu puis vérifier
  await new Promise((resolve) => setTimeout(resolve, 500));
  testNoMultipleEffects();
}

// Test 4 : Vérifier les verrous de concurrence
async function testConcurrencyLocks() {
  console.log("\n--- Test 4 : Test des verrous de concurrence ---");

  const testActor = game.actors.find((a) => a.type === "character");
  if (!testActor) {
    console.error("❌ Aucun personnage trouvé pour le test");
    return;
  }

  console.log(`Test de concurrence sur ${testActor.name}`);

  // Lancer plusieurs mises à jour simultanées
  const promises = [
    testActor.update({ "system.status": "defensive" }),
    testActor.update({ "system.status": "offensive" }),
    testActor.update({ "system.status": "focused" }),
    testActor.update({ "system.status": "none" }),
  ];

  try {
    await Promise.all(promises);
    console.log("✅ Mises à jour simultanées terminées");

    // Vérifier le résultat final
    await new Promise((resolve) => setTimeout(resolve, 200));
    testNoMultipleEffects();
  } catch (error) {
    console.error("❌ Erreur lors du test de concurrence:", error);
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log("🚀 Démarrage des tests de validation...");

  // Test initial
  testNoMultipleEffects();

  // Tests asynchrones
  await testRapidStatusChanges();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await testMultipleActorsStress();
  await new Promise((resolve) => setTimeout(resolve, 500));

  await testConcurrencyLocks();

  console.log("\n✅ Tous les tests terminés !");
  console.log(
    "Vérifiez la console pour détecter d'éventuelles erreurs 'does not exist'"
  );
}

// Exporter les fonctions pour utilisation manuelle
window.testStatusEffects = {
  runAllTests,
  testNoMultipleEffects,
  testRapidStatusChanges,
  testMultipleActorsStress,
  testConcurrencyLocks,
};

console.log("Tests chargés ! Utilisez :");
console.log("- testStatusEffects.runAllTests() pour tous les tests");
console.log(
  "- testStatusEffects.testNoMultipleEffects() pour vérifier les doublons"
);
console.log(
  "- testStatusEffects.testRapidStatusChanges() pour tester les changements rapides"
);
