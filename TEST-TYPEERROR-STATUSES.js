// Test de Validation - Correction TypeError statuses
// À exécuter dans la console F12 de FoundryVTT

console.log("🔧 TEST - CORRECTION TYPEERROR STATUSES");
console.log("=======================================");

// Fonction pour analyser les types de statuses dans les effets
function analyzeStatusTypes() {
  console.log("\n📊 ANALYSE DES TYPES DE STATUSES");
  console.log("=================================");

  let totalEffects = 0;
  let arrayStatuses = 0;
  let nonArrayStatuses = 0;
  let undefinedStatuses = 0;
  let nullStatuses = 0;
  let problemEffects = [];

  game.actors.forEach((actor) => {
    actor.effects.forEach((effect) => {
      totalEffects++;

      if (effect.statuses === undefined) {
        undefinedStatuses++;
      } else if (effect.statuses === null) {
        nullStatuses++;
      } else if (Array.isArray(effect.statuses)) {
        arrayStatuses++;
      } else {
        nonArrayStatuses++;
        problemEffects.push({
          actor: actor.name,
          effect: effect.name,
          statusesType: typeof effect.statuses,
          statusesValue: effect.statuses,
        });
      }
    });
  });

  console.log(`📈 Total effets analysés: ${totalEffects}`);
  console.log(`✅ Statuses Array: ${arrayStatuses}`);
  console.log(`⚪ Statuses undefined: ${undefinedStatuses}`);
  console.log(`⚪ Statuses null: ${nullStatuses}`);
  console.log(`❌ Statuses non-Array: ${nonArrayStatuses}`);

  if (problemEffects.length > 0) {
    console.log("\n⚠️ EFFETS PROBLÉMATIQUES:");
    problemEffects.forEach((p) => {
      console.log(
        `  - ${p.actor}: ${p.effect} (type: ${
          p.statusesType
        }, value: ${JSON.stringify(p.statusesValue)})`
      );
    });
  } else {
    console.log("\n✅ Aucun effet problématique détecté");
  }

  return { totalEffects, arrayStatuses, nonArrayStatuses, problemEffects };
}

// Test de robustesse des vérifications
function testStatusChecks() {
  console.log("\n🛡️ TEST DE ROBUSTESSE");
  console.log("=====================");

  // Créer des objets d'effet simulés avec différents types de statuses
  const mockEffects = [
    { name: "Test Array", statuses: ["test-status"] },
    { name: "Test Undefined", statuses: undefined },
    { name: "Test Null", statuses: null },
    { name: "Test String", statuses: "test-string" },
    { name: "Test Number", statuses: 123 },
    { name: "Test Object", statuses: { test: "object" } },
    { name: "Test Empty Array", statuses: [] },
  ];

  let successCount = 0;
  let errorCount = 0;

  mockEffects.forEach((effect) => {
    try {
      // Simuler notre nouvelle logique de vérification
      const result =
        Array.isArray(effect.statuses) &&
        effect.statuses.some((s) => s.startsWith("jayspik-"));
      console.log(
        `✅ ${effect.name}: ${result} (type: ${typeof effect.statuses})`
      );
      successCount++;
    } catch (error) {
      console.log(`❌ ${effect.name}: ERREUR - ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\n📊 Résultats: ${successCount} succès, ${errorCount} erreurs`);

  if (errorCount === 0) {
    console.log("🎉 Toutes les vérifications sont robustes !");
  } else {
    console.log("⚠️ Des erreurs persistent dans la logique");
  }

  return { successCount, errorCount };
}

// Test de changement de statut en situation réelle
async function testStatusChange() {
  console.log("\n🎮 TEST CHANGEMENT DE STATUT");
  console.log("=============================");

  const testActor = game.actors.find((a) => a.type === "character");
  if (!testActor) {
    console.error("❌ Aucun personnage trouvé pour le test");
    return;
  }

  console.log(`Test sur ${testActor.name}`);

  let errorOccurred = false;

  // Capturer les erreurs
  const originalError = console.error;
  console.error = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("statuses?.includes is not a function") ||
      message.includes("statuses?.some is not a function")
    ) {
      errorOccurred = true;
      console.log(`🔴 ERREUR DÉTECTÉE: ${message}`);
    }
    originalError.apply(console, args);
  };

  try {
    // Test de changements multiples
    await testActor.update({ "system.status": "defensive" });
    await new Promise((resolve) => setTimeout(resolve, 200));

    await testActor.update({ "system.status": "offensive" });
    await new Promise((resolve) => setTimeout(resolve, 200));

    await testActor.update({ "system.status": "focused" });
    await new Promise((resolve) => setTimeout(resolve, 200));

    await testActor.update({ "system.status": "none" });
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!errorOccurred) {
      console.log("✅ Aucune erreur TypeError détectée lors des changements");
    } else {
      console.log("❌ Erreur TypeError détectée - correction incomplète");
    }
  } catch (error) {
    console.log(`❌ Erreur lors des tests: ${error.message}`);
  } finally {
    // Restaurer console.error
    console.error = originalError;
  }

  return !errorOccurred;
}

// Test complet
async function runTypeErrorTests() {
  console.log("🚀 DÉMARRAGE DES TESTS TYPEERROR...");

  // 1. Analyser les types actuels
  const analysis = analyzeStatusTypes();

  // 2. Tester la robustesse
  const robustness = testStatusChecks();

  // 3. Test en situation réelle
  const realTest = await testStatusChange();

  // 4. Résumé final
  setTimeout(() => {
    console.log("\n📋 RÉSUMÉ FINAL");
    console.log("===============");
    console.log(`📊 Effets analysés: ${analysis.totalEffects}`);
    console.log(
      `${
        analysis.problemEffects.length === 0 ? "✅" : "⚠️"
      } Effets problématiques: ${analysis.problemEffects.length}`
    );
    console.log(
      `${robustness.errorCount === 0 ? "✅" : "❌"} Tests de robustesse: ${
        robustness.successCount
      }/${robustness.successCount + robustness.errorCount}`
    );
    console.log(
      `${realTest ? "✅" : "❌"} Test en situation réelle: ${
        realTest ? "SUCCÈS" : "ÉCHEC"
      }`
    );

    if (
      analysis.problemEffects.length === 0 &&
      robustness.errorCount === 0 &&
      realTest
    ) {
      console.log("\n🎉 CORRECTION COMPLÈTE - TypeError résolu !");
    } else {
      console.log(
        "\n⚠️ Correction partielle - Vérifications supplémentaires nécessaires"
      );
    }
  }, 1000);
}

// Fonction de monitoring en temps réel des erreurs
function startErrorMonitoring() {
  console.log("\n👁️ SURVEILLANCE DES ERREURS ACTIVÉE");
  console.log("====================================");

  let errorCount = 0;
  const originalError = console.error;

  console.error = function (...args) {
    const message = args.join(" ");
    if (
      message.includes("statuses") &&
      (message.includes("is not a function") || message.includes("TypeError"))
    ) {
      errorCount++;
      console.log(
        `🔴 [${new Date().toLocaleTimeString()}] ERREUR STATUSES #${errorCount}: ${message}`
      );
    }
    originalError.apply(console, args);
  };

  // Arrêter après 5 minutes
  setTimeout(() => {
    console.error = originalError;
    console.log(
      `👁️ Surveillance terminée - ${errorCount} erreur(s) détectée(s)`
    );
  }, 300000);

  return { stop: () => (console.error = originalError) };
}

// Exporter les fonctions
window.typeErrorTest = {
  runTypeErrorTests,
  analyzeStatusTypes,
  testStatusChecks,
  testStatusChange,
  startErrorMonitoring,
};

console.log("\n📋 FONCTIONS DISPONIBLES:");
console.log("- typeErrorTest.runTypeErrorTests() → Test complet");
console.log("- typeErrorTest.analyzeStatusTypes() → Analyser les types");
console.log("- typeErrorTest.testStatusChange() → Test changement statut");
console.log("- typeErrorTest.startErrorMonitoring() → Surveillance temps réel");
console.log("\n💡 Lancez typeErrorTest.runTypeErrorTests() pour commencer");

// Auto-lancement de l'analyse
analyzeStatusTypes();
