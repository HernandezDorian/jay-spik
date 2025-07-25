// ===============================================
// TEST IMMÉDIAT - NOUVELLE SOLUTION ANTI-DOUBLON
// ===============================================

console.log("🔥 TEST IMMÉDIAT DE LA NOUVELLE SOLUTION");

// Vérification que les nouvelles fonctions existent
const functionsToCheck = [
  "queueStatusUpdate",
  "processStatusUpdateQueue",
  "updateStatusActiveEffectSafe",
  "removeAllStatusEffectsCompletely",
  "createStatusActiveEffectSafe",
];

console.log("📋 Vérification des fonctions:");
functionsToCheck.forEach((funcName) => {
  if (typeof window[funcName] === "function") {
    console.log(`✅ ${funcName} : disponible`);
  } else {
    console.error(`❌ ${funcName} : MANQUANTE!`);
  }
});

// Test rapide avec le premier acteur disponible
if (game.actors.size > 0) {
  const testActor = game.actors.contents[0];
  console.log(`🎭 Acteur de test: ${testActor.name}`);

  // Compter les effets de statut actuels
  const currentEffects = testActor.effects.filter((effect) => {
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

  console.log(`📊 Effets de statut actuels: ${currentEffects.length}`);

  if (currentEffects.length > 1) {
    console.warn("🚨 DOUBLONS DÉTECTÉS! Nettoyage recommandé");

    // Fonction de nettoyage manuel
    window.cleanupNow = async function () {
      console.log("🧹 Nettoyage manuel en cours...");
      try {
        // Utiliser notre nouvelle fonction de suppression
        await removeAllStatusEffectsCompletely(testActor);
        console.log("✅ Nettoyage terminé");

        // Vérifier le résultat
        setTimeout(() => {
          const remainingEffects = testActor.effects.filter((effect) => {
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
          console.log(
            `📊 Effets restants après nettoyage: ${remainingEffects.length}`
          );
        }, 500);
      } catch (error) {
        console.error("❌ Erreur de nettoyage:", error);
      }
    };

    console.log("💡 Utilisez window.cleanupNow() pour nettoyer manuellement");
  }

  // Test de changement simple
  window.testSimpleChange = async function () {
    console.log("🧪 Test de changement simple...");

    const originalStatus = testActor.system.status;
    const testStatus =
      originalStatus === "defensive" ? "aggressive" : "defensive";

    console.log(`Changement: ${originalStatus} -> ${testStatus}`);

    try {
      await testActor.update({ "system.status": testStatus });

      // Vérifier après 2 secondes
      setTimeout(() => {
        const effectsAfter = testActor.effects.filter((effect) => {
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

        console.log(`📊 Effets après changement: ${effectsAfter.length}`);
        console.log(`📊 Statut final: ${testActor.system.status}`);

        if (
          effectsAfter.length === 1 &&
          testActor.system.status === testStatus
        ) {
          console.log("✅ Test simple RÉUSSI");
        } else if (effectsAfter.length === 0 && testStatus === "none") {
          console.log("✅ Test simple RÉUSSI (statut none)");
        } else {
          console.error(
            `❌ Test simple ÉCHOUÉ - ${effectsAfter.length} effets pour statut '${testActor.system.status}'`
          );
        }
      }, 2000);
    } catch (error) {
      console.error("❌ Erreur lors du test:", error);
    }
  };

  console.log(
    "💡 Utilisez window.testSimpleChange() pour tester un changement"
  );
} else {
  console.warn("⚠️ Aucun acteur disponible pour les tests");
}

// Vérification de la queue
if (typeof statusUpdateQueue !== "undefined") {
  console.log(`📦 Taille actuelle de la queue: ${statusUpdateQueue.size}`);
} else {
  console.warn("⚠️ Variable statusUpdateQueue non accessible");
}

console.log("=== TEST IMMÉDIAT TERMINÉ ===");
console.log("🎯 Actions disponibles:");
console.log("- window.testSimpleChange() : test de changement basique");
console.log("- window.cleanupNow() : nettoyage manuel des doublons");
console.log("- Ouvrez la console pour voir les logs détaillés");
