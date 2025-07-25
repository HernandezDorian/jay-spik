// TEST VRAIMENT SIMPLE
// Copier dans la console F12

console.log("🧪 TEST SIMPLE");

async function testBasique() {
  console.log("=== TEST POSTURES ===");

  // Prendre un acteur
  let actor =
    game.user.character || game.actors.find((a) => a.type === "character");

  if (!actor) {
    console.error("❌ Pas d'acteur trouvé");
    return;
  }

  console.log(`🎭 Acteur: ${actor.name}`);
  console.log(`📊 Statut: ${actor.system.status}`);

  // Voir les effets actuels
  const effects = actor.effects.filter((e) => e.flags?.jaySpik?.isPosture);
  console.log(`🔮 Effets: ${effects.length}`);

  if (effects.length > 1) {
    console.error(`❌ DOUBLON DÉTECTÉ! ${effects.length} effets`);

    // Nettoyer
    await actor.deleteEmbeddedDocuments(
      "ActiveEffect",
      effects.map((e) => e.id)
    );
    console.log("🧹 Nettoyé");
  }

  // Test changement
  console.log("🔄 Test changement vers defensive...");
  await actor.update({ "system.status": "defensive" });

  // Attendre
  setTimeout(async () => {
    const newEffects = actor.effects.filter((e) => e.flags?.jaySpik?.isPosture);
    console.log(`✅ Résultat: ${newEffects.length} effet(s)`);

    if (newEffects.length === 1) {
      console.log("✅ SUCCESS!");
    } else {
      console.error(`❌ ÉCHEC! ${newEffects.length} effets`);
    }
  }, 1000);
}

window.testBasique = testBasique;
console.log("💡 Lancer: testBasique()");
