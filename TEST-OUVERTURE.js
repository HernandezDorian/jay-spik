// TEST ULTRA-RAPIDE - OUVERTURE FICHES
// Copier dans la console F12

console.log("🧪 TEST RAPIDE - Ouverture des fiches");

function testOuvertureFiche() {
  console.log("=== TEST OUVERTURE FICHE ===");

  // Prendre un acteur
  let actor =
    game.user.character || game.actors.find((a) => a.type === "character");

  if (!actor) {
    console.error("❌ Pas d'acteur trouvé");
    return;
  }

  console.log(`🎭 Test ouverture fiche: ${actor.name}`);

  try {
    // Tenter d'ouvrir la fiche
    actor.sheet.render(true);
    console.log("✅ Fiche ouverte avec succès!");

    // Tester les données système
    if (actor.system) {
      console.log("✅ actor.system existe");

      if (typeof actor.system.getStatBonus === "function") {
        console.log("✅ getStatBonus est disponible");
      } else {
        console.warn("⚠️ getStatBonus non disponible");
      }

      console.log(`📊 Statut actuel: ${actor.system.status || "non défini"}`);
    }
  } catch (error) {
    console.error("❌ Erreur ouverture fiche:", error);
  }
}

function testPostureRapide() {
  console.log("=== TEST POSTURE RAPIDE ===");

  let actor =
    game.user.character || game.actors.find((a) => a.type === "character");
  if (!actor) return;

  console.log(`🎭 Test posture: ${actor.name}`);
  console.log(`📊 Statut: ${actor.system.status}`);

  const effects = actor.effects.filter((e) => e.flags?.jaySpik?.isPosture);
  console.log(`🔮 Effets de posture: ${effects.length}`);

  if (effects.length > 1) {
    console.warn(`⚠️ DOUBLON détecté: ${effects.length} effets`);
  }
}

// Exposer les fonctions
window.testOuvertureFiche = testOuvertureFiche;
window.testPostureRapide = testPostureRapide;

console.log("💡 Commandes:");
console.log("  testOuvertureFiche() - Test ouverture fiche");
console.log("  testPostureRapide() - Test état postures");
console.log("");
console.log("🎯 LANCER: testOuvertureFiche()");
