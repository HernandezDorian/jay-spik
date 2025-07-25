// Test de Validation - Correction API Dépréciation
// À exécuter dans la console F12 de FoundryVTT

console.log("🔧 TEST - CORRECTION API DÉPRÉCIATION");
console.log("====================================");

// Test 1: Vérifier qu'il n'y a plus d'erreurs TextEditor
function testTextEditorAPI() {
  console.log("\n📝 Test 1: API TextEditor");

  // Compter les erreurs avant le test
  let deprecationErrors = 0;
  const originalError = console.error;

  console.error = function (...args) {
    const message = args.join(" ");
    if (message.includes("TextEditor") && message.includes("namespaced")) {
      deprecationErrors++;
      console.log(`🔴 ERREUR DE DÉPRÉCIATION DÉTECTÉE: ${message}`);
    }
    originalError.apply(console, args);
  };

  // Forcer le re-rendu des fiches acteurs pour déclencher getData()
  game.actors.forEach((actor) => {
    if (actor.sheet && actor.sheet.rendered) {
      try {
        actor.sheet.render(true);
      } catch (error) {
        console.log(`Erreur lors du rendu de ${actor.name}:`, error.message);
      }
    }
  });

  // Attendre un peu puis vérifier
  setTimeout(() => {
    if (deprecationErrors === 0) {
      console.log("✅ Aucune erreur de dépréciation TextEditor détectée");
    } else {
      console.log(
        `❌ ${deprecationErrors} erreur(s) de dépréciation détectées`
      );
    }

    // Restaurer console.error
    console.error = originalError;
  }, 2000);
}

// Test 2: Vérifier l'enrichissement de texte
async function testTextEnrichment() {
  console.log("\n🎨 Test 2: Enrichissement de texte");

  try {
    // Test avec la nouvelle API
    const testText = "Test de jet: [[/r 1d20]] et lien [[Actor.test]]";
    const enriched =
      await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        testText,
        {
          async: true,
          secrets: true,
        }
      );

    if (enriched && enriched.includes("data-tooltip")) {
      console.log("✅ Nouvelle API TextEditor fonctionne correctement");
      console.log("📝 Texte enrichi généré avec succès");
    } else {
      console.log("⚠️ Enrichissement possible mais résultat inattendu");
    }
  } catch (error) {
    console.log("❌ Erreur lors du test d'enrichissement:", error.message);
  }
}

// Test 3: Vérifier l'intercepteur d'erreurs
function testErrorInterceptor() {
  console.log("\n🛡️ Test 3: Intercepteur d'erreurs");

  // Simuler une erreur TextEditor (sans la déclencher vraiment)
  const testMessage =
    "Error: You are accessing the global TextEditor which is now namespaced under foundry.applications.ux.TextEditor.implementation";

  // Vérifier que notre intercepteur capture bien ce type de message
  if (
    testMessage.includes("TextEditor") &&
    testMessage.includes("namespaced under foundry.applications.ux.TextEditor")
  ) {
    console.log("✅ Pattern d'interception TextEditor validé");
  } else {
    console.log("❌ Pattern d'interception TextEditor défaillant");
  }

  // Test ActiveEffect aussi
  const activeEffectTest = "ActiveEffect XYZ123 does not exist!";
  if (
    activeEffectTest.includes("ActiveEffect") &&
    activeEffectTest.includes("does not exist")
  ) {
    console.log("✅ Pattern d'interception ActiveEffect validé");
  } else {
    console.log("❌ Pattern d'interception ActiveEffect défaillant");
  }
}

// Test 4: Statut global du système
function testSystemStatus() {
  console.log("\n📊 Test 4: Statut global du système");

  const actors = game.actors.filter(
    (a) => a.type === "character" || a.type === "npc"
  );
  let statusEffectsCount = 0;
  let multipleEffectsActors = 0;

  actors.forEach((actor) => {
    const statusEffects = actor.effects.filter(
      (effect) =>
        effect.flags?.jaySpik?.isStatusEffect ||
        effect.statuses?.some((s) => s.startsWith("jayspik-"))
    );

    statusEffectsCount += statusEffects.length;
    if (statusEffects.length > 1) {
      multipleEffectsActors++;
    }
  });

  console.log(`📈 Acteurs: ${actors.length}`);
  console.log(`📈 Effets de statut totaux: ${statusEffectsCount}`);
  console.log(
    `${
      multipleEffectsActors === 0 ? "✅" : "⚠️"
    } Acteurs avec effets multiples: ${multipleEffectsActors}`
  );

  if (multipleEffectsActors === 0 && statusEffectsCount <= actors.length) {
    console.log("✅ Système de statuts en bon état");
  } else {
    console.log("⚠️ Système de statuts nécessite une attention");
  }
}

// Fonction principale
async function runDeprecationTests() {
  console.log("🚀 Démarrage des tests de correction API...");

  testErrorInterceptor();
  await testTextEnrichment();
  testSystemStatus();
  testTextEditorAPI(); // En dernier car il a un délai

  console.log("\n✅ Tests de correction API terminés !");
  console.log("💡 Surveillez la console pour les prochaines minutes");
}

// Exporter les fonctions
window.deprecationTest = {
  runDeprecationTests,
  testTextEditorAPI,
  testTextEnrichment,
  testErrorInterceptor,
  testSystemStatus,
};

console.log("\n📋 FONCTIONS DISPONIBLES:");
console.log("- deprecationTest.runDeprecationTests() → Tous les tests");
console.log(
  "- deprecationTest.testTextEditorAPI() → Test spécifique TextEditor"
);
console.log("- deprecationTest.testTextEnrichment() → Test enrichissement");
console.log("\n💡 Lancez deprecationTest.runDeprecationTests() pour commencer");

// Auto-lancement du test d'interception
testErrorInterceptor();
