// Test Final - Validation de la Correction ActiveEffect
// À exécuter dans la console F12 après avoir implémenté les corrections

console.log("🔥 TEST FINAL - CORRECTION ACTIVEEFFECT");
console.log("======================================");

// Fonction pour compter les erreurs dans la console
let errorCount = 0;
let foundryErrorCount = 0;

// Intercepter temporairement console.error pour compter les erreurs
const originalConsoleError = console.error;
console.error = function (...args) {
  const message = args.join(" ");
  if (message.includes("ActiveEffect") && message.includes("does not exist")) {
    foundryErrorCount++;
    console.log(`🔴 ERREUR FOUNDRY DÉTECTÉE: ${message}`);
  } else {
    errorCount++;
  }
  originalConsoleError.apply(console, args);
};

// Test de stress ultime
async function stressTestUltimate() {
  console.log("\n🚀 DÉMARRAGE DU STRESS TEST ULTIME...");

  const actors = game.actors.filter(
    (a) => a.type === "character" || a.type === "npc"
  );
  if (actors.length === 0) {
    console.error("❌ Aucun acteur trouvé pour le test");
    return;
  }

  const statuses = [
    "defensive",
    "offensive",
    "focused",
    "furtive",
    "berserk",
    "none",
  ];

  // Phase 1 : Changements rapides multiples
  console.log("Phase 1 : Changements rapides multiples...");
  for (let i = 0; i < 20; i++) {
    const actor = actors[i % actors.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Ne pas attendre - créer une vraie condition de concurrence
    actor.update({ "system.status": status });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Phase 2 : Changements simultanés sur le même acteur
  console.log("Phase 2 : Changements simultanés sur le même acteur...");
  const testActor = actors[0];

  // Lancer 10 mises à jour simultanées
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      testActor.update({ "system.status": statuses[i % statuses.length] })
    );
  }

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log("Erreurs attendues lors des mises à jour simultanées");
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Phase 3 : Vérification finale
  console.log("Phase 3 : Vérification finale...");
  let totalEffects = 0;
  let multipleEffects = 0;

  actors.forEach((actor) => {
    const statusEffects = actor.effects.filter(
      (effect) =>
        effect.flags?.jaySpik?.isStatusEffect ||
        effect.statuses?.some((s) => s.startsWith("jayspik-"))
    );

    totalEffects += statusEffects.length;

    if (statusEffects.length > 1) {
      multipleEffects++;
      console.warn(`⚠️ ${actor.name} a ${statusEffects.length} effets !`);
    }
  });

  // Résultats finaux
  console.log("\n📊 RÉSULTATS FINAUX:");
  console.log("==================");
  console.log(`✅ Acteurs testés: ${actors.length}`);
  console.log(`✅ Total effets de statut: ${totalEffects}`);
  console.log(
    `${
      multipleEffects === 0 ? "✅" : "❌"
    } Acteurs avec effets multiples: ${multipleEffects}`
  );
  console.log(
    `${
      foundryErrorCount === 0 ? "✅" : "⚠️"
    } Erreurs FoundryVTT détectées: ${foundryErrorCount}`
  );
  console.log(
    `${errorCount === 0 ? "✅" : "❌"} Autres erreurs: ${errorCount}`
  );

  if (foundryErrorCount === 0 && multipleEffects === 0) {
    console.log("\n🎉 SUCCÈS TOTAL ! Correction parfaitement fonctionnelle !");
  } else if (foundryErrorCount === 0) {
    console.log(
      "\n✅ SUCCÈS ! Plus d'erreurs FoundryVTT, quelques effets multiples restants"
    );
  } else {
    console.log("\n⚠️ PARTIEL : Erreurs FoundryVTT encore présentes");
  }

  // Restaurer console.error
  console.error = originalConsoleError;
}

// Test rapide de validation
function quickValidation() {
  console.log("\n⚡ VALIDATION RAPIDE");
  console.log("===================");

  const actors = game.actors.filter(
    (a) => a.type === "character" || a.type === "npc"
  );
  let issues = 0;

  actors.forEach((actor) => {
    const statusEffects = actor.effects.filter(
      (effect) =>
        effect.flags?.jaySpik?.isStatusEffect ||
        effect.statuses?.some((s) => s.startsWith("jayspik-"))
    );

    if (statusEffects.length > 1) {
      console.warn(
        `⚠️ ${actor.name}: ${statusEffects.length} effets de statut`
      );
      issues++;
    }
  });

  if (issues === 0) {
    console.log("✅ Aucun problème détecté - système propre !");
  } else {
    console.warn(`⚠️ ${issues} acteur(s) avec des effets multiples détectés`);
  }

  return issues === 0;
}

// Exporter les fonctions
window.finalTest = {
  stressTestUltimate,
  quickValidation,
};

console.log("\n📋 FONCTIONS DISPONIBLES:");
console.log("- finalTest.quickValidation() → Vérification rapide");
console.log("- finalTest.stressTestUltimate() → Test de stress complet");
console.log("\n💡 Lancez d'abord quickValidation() pour l'état actuel");
console.log("💡 Puis stressTestUltimate() pour tester la robustesse");

// Auto-lancement de la validation rapide
quickValidation();
