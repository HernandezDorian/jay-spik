// Test Anti-Doublons - Validation Système de Statuts
// À exécuter dans la console F12 de FoundryVTT

console.log("🔥 TEST ANTI-DOUBLONS - SYSTÈME DE STATUTS");
console.log("==========================================");

// Fonction pour compter les effets de statut par acteur
function countStatusEffects() {
  const results = [];

  game.actors.forEach((actor) => {
    if (actor.type === "character" || actor.type === "npc") {
      const statusEffects = actor.effects.filter(
        (effect) =>
          effect.flags?.jaySpik?.isStatusEffect ||
          effect.statuses?.some((s) => s.startsWith("jayspik-")) ||
          (effect.name &&
            (effect.name.includes("Défensive") ||
              effect.name.includes("Offensive") ||
              effect.name.includes("Concentré") ||
              effect.name.includes("Furtif") ||
              effect.name.includes("Berserk")))
      );

      if (statusEffects.length > 0) {
        results.push({
          actor: actor.name,
          count: statusEffects.length,
          effects: statusEffects.map((e) => ({
            name: e.name,
            id: e.id,
            statusKey: e.flags?.jaySpik?.statusKey,
            createdTime: e.createdTime,
          })),
        });
      }
    }
  });

  return results;
}

// Test de détection des doublons
function detectDuplicates() {
  console.log("\n🔍 DÉTECTION DES DOUBLONS");
  console.log("=========================");

  const results = countStatusEffects();
  let totalDuplicates = 0;
  let actorsWithDuplicates = 0;

  results.forEach((result) => {
    if (result.count > 1) {
      actorsWithDuplicates++;
      totalDuplicates += result.count - 1;

      console.log(`⚠️ ${result.actor}: ${result.count} effets de statut`);
      result.effects.forEach((effect) => {
        console.log(`  - ${effect.name} (${effect.id}) [${effect.statusKey}]`);
      });
    } else if (result.count === 1) {
      console.log(
        `✅ ${result.actor}: 1 effet de statut (${result.effects[0].name})`
      );
    }
  });

  if (totalDuplicates === 0) {
    console.log("🎉 Aucun doublon détecté !");
  } else {
    console.log(
      `❌ ${totalDuplicates} doublon(s) détecté(s) sur ${actorsWithDuplicates} acteur(s)`
    );
  }

  return { totalDuplicates, actorsWithDuplicates };
}

// Test de création forcée de doublons
async function createTestDuplicates() {
  console.log("\n🧪 TEST CRÉATION DOUBLONS FORCÉS");
  console.log("=================================");

  const testActor = game.actors.find((a) => a.type === "character");
  if (!testActor) {
    console.error("❌ Aucun personnage trouvé pour le test");
    return;
  }

  console.log(`Test sur ${testActor.name}`);

  // Essayer de créer plusieurs fois le même statut très rapidement
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(testActor.update({ "system.status": "focused" }));
  }

  try {
    await Promise.all(promises);
    console.log("✅ Tentatives de création simultanées terminées");
  } catch (error) {
    console.log("⚠️ Erreurs attendues lors des créations simultanées");
  }

  // Attendre un peu puis vérifier
  setTimeout(() => {
    const statusEffects = testActor.effects.filter(
      (effect) =>
        effect.flags?.jaySpik?.isStatusEffect ||
        effect.statuses?.some((s) => s.startsWith("jayspik-"))
    );

    console.log(
      `📊 Résultat: ${statusEffects.length} effet(s) de statut sur ${testActor.name}`
    );
    if (statusEffects.length === 1) {
      console.log(
        "✅ Test réussi - Un seul effet créé malgré les tentatives multiples"
      );
    } else {
      console.log(`❌ Test échoué - ${statusEffects.length} effets créés`);
    }
  }, 1000);
}

// Test de nettoyage manuel
async function manualCleanup() {
  console.log("\n🧹 NETTOYAGE MANUEL");
  console.log("===================");

  let totalCleaned = 0;

  for (const actor of game.actors) {
    if (actor.type === "character" || actor.type === "npc") {
      const statusEffects = actor.effects.filter(
        (effect) =>
          effect.flags?.jaySpik?.isStatusEffect ||
          effect.statuses?.some((s) => s.startsWith("jayspik-")) ||
          (effect.name &&
            (effect.name.includes("Défensive") ||
              effect.name.includes("Offensive") ||
              effect.name.includes("Concentré") ||
              effect.name.includes("Furtif") ||
              effect.name.includes("Berserk")))
      );

      if (statusEffects.length > 1) {
        console.log(
          `🧹 Nettoyage de ${actor.name}: ${statusEffects.length} effets`
        );

        // Garder le plus récent
        statusEffects.sort(
          (a, b) => (a.createdTime || 0) - (b.createdTime || 0)
        );
        const toDelete = statusEffects.slice(0, -1);

        for (const effect of toDelete) {
          try {
            if (actor.effects.get(effect.id)) {
              await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
              totalCleaned++;
              console.log(`  ✅ Supprimé: ${effect.name} (${effect.id})`);
            }
          } catch (error) {
            console.log(`  ⚠️ Erreur suppression: ${effect.id}`);
          }
        }
      }
    }
  }

  console.log(`🧹 Nettoyage terminé: ${totalCleaned} effet(s) supprimé(s)`);
  return totalCleaned;
}

// Test complet
async function runAntiDuplicateTests() {
  console.log("🚀 DÉMARRAGE DES TESTS ANTI-DOUBLONS...");

  // 1. État initial
  console.log("\n📊 ÉTAT INITIAL:");
  detectDuplicates();

  // 2. Test de création de doublons
  await createTestDuplicates();

  // 3. Attendre et vérifier
  setTimeout(async () => {
    console.log("\n📊 ÉTAT APRÈS TEST:");
    const duplicatesAfter = detectDuplicates();

    // 4. Nettoyage si nécessaire
    if (duplicatesAfter.totalDuplicates > 0) {
      console.log("\n🧹 NETTOYAGE NÉCESSAIRE:");
      await manualCleanup();

      // 5. Vérification finale
      setTimeout(() => {
        console.log("\n📊 ÉTAT FINAL:");
        const finalCheck = detectDuplicates();

        if (finalCheck.totalDuplicates === 0) {
          console.log("\n🎉 SUCCÈS TOTAL - Aucun doublon restant !");
        } else {
          console.log("\n⚠️ ATTENTION - Doublons persistants détectés");
        }
      }, 1000);
    }
  }, 2000);
}

// Fonction pour surveiller en temps réel
function startDuplicateMonitoring() {
  console.log("\n👁️ SURVEILLANCE EN TEMPS RÉEL ACTIVÉE");
  console.log("=====================================");

  const monitoringInterval = setInterval(() => {
    const results = countStatusEffects();
    const duplicates = results.filter((r) => r.count > 1);

    if (duplicates.length > 0) {
      console.log(
        `⚠️ [${new Date().toLocaleTimeString()}] ${
          duplicates.length
        } acteur(s) avec doublons détectés`
      );
      duplicates.forEach((d) => {
        console.log(`  - ${d.actor}: ${d.count} effets`);
      });
    }
  }, 5000); // Vérifier toutes les 5 secondes

  // Arrêter après 2 minutes
  setTimeout(() => {
    clearInterval(monitoringInterval);
    console.log("👁️ Surveillance terminée");
  }, 120000);

  return monitoringInterval;
}

// Exporter les fonctions
window.antiDuplicateTest = {
  runAntiDuplicateTests,
  detectDuplicates,
  createTestDuplicates,
  manualCleanup,
  countStatusEffects,
  startDuplicateMonitoring,
};

console.log("\n📋 FONCTIONS DISPONIBLES:");
console.log("- antiDuplicateTest.runAntiDuplicateTests() → Test complet");
console.log("- antiDuplicateTest.detectDuplicates() → Détecter les doublons");
console.log("- antiDuplicateTest.manualCleanup() → Nettoyage manuel");
console.log(
  "- antiDuplicateTest.startDuplicateMonitoring() → Surveillance temps réel"
);
console.log(
  "\n💡 Lancez antiDuplicateTest.runAntiDuplicateTests() pour commencer"
);

// Auto-lancement de la détection
detectDuplicates();
