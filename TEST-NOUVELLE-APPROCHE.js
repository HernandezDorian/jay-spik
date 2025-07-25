// ===============================================
// TEST DE LA NOUVELLE APPROCHE ANTI-DOUBLON
// ===============================================

console.log("=== TEST NOUVELLE APPROCHE ANTI-DOUBLON ===");

// Fonction pour tester la résistance aux changements rapides
async function testRapidStatusChanges(actorName) {
  console.group(`🚀 Test de changements rapides pour ${actorName}`);

  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error("Acteur non trouvé:", actorName);
    console.groupEnd();
    return;
  }

  console.log("Statut initial:", actor.system.status);

  // Série de changements rapides (simule des clics rapides ou des bugs de hook)
  const changes = ["defensive", "aggressive", "focused", "none", "defensive"];

  console.log("Exécution de changements rapides:", changes);

  // Lancer tous les changements en même temps (test de stress)
  const promises = changes.map((status, index) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        console.log(`  [${index}] Changement vers: ${status}`);
        await actor.update({ "system.status": status });
        resolve();
      }, index * 10); // 10ms entre chaque changement (très rapide)
    });
  });

  await Promise.all(promises);

  // Attendre que la queue soit traitée
  console.log("Attente du traitement de la queue...");
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Vérifier le résultat final
  const finalStatus = actor.system.status;
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

  console.log(`Statut final: ${finalStatus}`);
  console.log(`Nombre d'effets de statut: ${statusEffects.length}`);

  if (statusEffects.length === 0 && finalStatus === "none") {
    console.log("✅ Résultat correct : aucun effet, statut 'none'");
  } else if (statusEffects.length === 1 && finalStatus !== "none") {
    console.log("✅ Résultat correct : 1 effet, statut non-none");
  } else if (statusEffects.length > 1) {
    console.error("🚨 ÉCHEC : Doublons détectés!");
    statusEffects.forEach((effect, i) => {
      console.error(`  [${i}] ${effect.name} (${effect.id})`);
    });
  } else {
    console.warn("⚠️ Résultat inattendu - vérification manuelle nécessaire");
  }

  console.groupEnd();
}

// Fonction pour simuler des appels concurrents
async function testConcurrentCalls(actorName) {
  console.group(`⚡ Test d'appels concurrents pour ${actorName}`);

  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error("Acteur non trouvé:", actorName);
    console.groupEnd();
    return;
  }

  // Simuler plusieurs processus qui essaient de changer le statut en même temps
  const concurrentPromises = [
    actor.update({ "system.status": "defensive" }),
    actor.update({ "system.status": "aggressive" }),
    actor.update({ "system.status": "focused" }),
    actor.update({ "system.status": "defensive" }),
    actor.update({ "system.status": "none" }),
  ];

  console.log("Lancement de 5 mises à jour concurrentes...");
  await Promise.all(concurrentPromises);

  // Attendre que tout soit traité
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Vérifier le résultat
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

  console.log(
    `Effets de statut après test concurrent: ${statusEffects.length}`
  );

  if (statusEffects.length <= 1) {
    console.log("✅ Test concurrent réussi : aucun doublon");
  } else {
    console.error("🚨 Test concurrent échoué : doublons détectés");
    statusEffects.forEach((effect, i) => {
      console.error(`  [${i}] ${effect.name} (${effect.id})`);
    });
  }

  console.groupEnd();
}

// Fonction pour observer la queue en temps réel
function monitorQueue() {
  console.log("🔍 Surveillance de la queue activée");

  const originalQueueFunction = window.queueStatusUpdate || function () {};
  window.queueStatusUpdate = function (actor, newStatus) {
    console.log(
      `📝 Queue: ${actor.name} -> ${newStatus} (taille: ${
        statusUpdateQueue?.size || "N/A"
      })`
    );
    return originalQueueFunction.apply(this, arguments);
  };

  const originalProcessFunction =
    window.processStatusUpdateQueue || function () {};
  window.processStatusUpdateQueue = function () {
    console.log(
      `⚙️ Traitement queue (taille: ${statusUpdateQueue?.size || "N/A"})`
    );
    return originalProcessFunction.apply(this, arguments);
  };
}

// Fonction de test complet
async function runCompleteTest() {
  console.log("🧪 DÉBUT DES TESTS COMPLETS");

  // Trouver le premier acteur disponible
  const testActor = game.actors.contents[0];
  if (!testActor) {
    console.error("Aucun acteur disponible pour les tests");
    return;
  }

  const actorName = testActor.name;
  console.log(`Acteur de test: ${actorName}`);

  // Test 1: Changements rapides
  await testRapidStatusChanges(actorName);

  // Pause entre les tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test 2: Appels concurrents
  await testConcurrentCalls(actorName);

  console.log("✅ TESTS COMPLETS TERMINÉS");
}

// Fonctions utilitaires disponibles en global
window.testRapidStatusChanges = testRapidStatusChanges;
window.testConcurrentCalls = testConcurrentCalls;
window.runCompleteTest = runCompleteTest;
window.monitorQueue = monitorQueue;

console.log("=== FONCTIONS DE TEST DISPONIBLES ===");
console.log("- window.testRapidStatusChanges('NomActeur')");
console.log("- window.testConcurrentCalls('NomActeur')");
console.log("- window.runCompleteTest()");
console.log("- window.monitorQueue()");

// Démarrer la surveillance automatiquement
monitorQueue();
