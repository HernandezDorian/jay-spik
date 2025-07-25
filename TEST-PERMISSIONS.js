// ===============================================
// TEST PERMISSIONS - JOUEURS/GM
// ===============================================

console.log("🔑 Test des permissions ActiveEffect");

// Informations sur l'utilisateur actuel
console.log(
  `👤 Utilisateur: ${game.user.name} (${game.user.isGM ? "GM" : "Joueur"})`
);

// Fonction pour tester les permissions sur un acteur
function testPermissions(actorName) {
  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error(`❌ Acteur '${actorName}' non trouvé`);
    return;
  }

  console.group(`🎭 Test permissions - ${actor.name}`);

  // Test permission OWNER
  const isOwner = actor.testUserPermission(game.user, "OWNER");
  console.log(`📜 OWNER: ${isOwner ? "✅ OUI" : "❌ NON"}`);

  // Test si on peut modifier les ActiveEffect
  const canModifyEffects = game.user.isGM || isOwner;
  console.log(
    `🎯 Peut modifier ActiveEffect: ${canModifyEffects ? "✅ OUI" : "❌ NON"}`
  );

  // Test pratique : essayer de créer un effet simple
  if (canModifyEffects) {
    console.log("🧪 Test création d'effet...");

    const testEffect = {
      name: "Test Permission",
      icon: "icons/svg/aura.svg",
      changes: [],
      flags: { test: true },
      disabled: false,
      transfer: false,
    };

    actor
      .createEmbeddedDocuments("ActiveEffect", [testEffect])
      .then(() => {
        console.log("✅ Création réussie");

        // Supprimer immédiatement
        const createdEffect = actor.effects.find((e) => e.flags?.test);
        if (createdEffect) {
          return actor.deleteEmbeddedDocuments("ActiveEffect", [
            createdEffect.id,
          ]);
        }
      })
      .then(() => {
        console.log("✅ Suppression réussie");
      })
      .catch((error) => {
        console.error("❌ Erreur lors du test:", error.message);
      });
  } else {
    console.log("⚠️ Pas de permissions - simulation d'envoi au GM");

    if (game.users.some((u) => u.isGM && u.active)) {
      console.log("✅ GM détecté - demande serait envoyée");
    } else {
      console.log("❌ Aucun GM connecté");
    }
  }

  console.groupEnd();
}

// Test automatique sur le premier acteur
if (game.actors.size > 0) {
  const firstActor = game.actors.contents[0];
  testPermissions(firstActor.name);
}

// Fonction pour surveiller les erreurs de permissions
function monitorPermissionErrors() {
  console.log("👁️ Surveillance des erreurs de permissions activée");

  // Intercepter les erreurs de console
  const originalError = console.error;
  console.error = function (...args) {
    const message = args.join(" ");

    if (
      message.includes("lacks permission") &&
      message.includes("ActiveEffect")
    ) {
      console.warn(`🚨 PERMISSION DETECTÉE: ${message}`);
      console.warn("💡 Solution: Utiliser le système de délégation au GM");
    }

    // Laisser passer l'erreur originale
    originalError.apply(console, args);
  };
}

// Fonction pour tester le changement de statut avec gestion des permissions
async function testStatusChangeWithPermissions(actorName, newStatus) {
  console.group(
    `🔄 Test changement avec permissions - ${actorName} -> ${newStatus}`
  );

  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error("Acteur non trouvé");
    console.groupEnd();
    return;
  }

  const canModify =
    game.user.isGM || actor.testUserPermission(game.user, "OWNER");
  console.log(`🔑 Permissions: ${canModify ? "AUTORISÉ" : "NON AUTORISÉ"}`);

  if (!canModify) {
    console.log("📨 Simulation envoi au GM...");

    // Simuler l'envoi socket
    const socketData = {
      action: "updateStatus",
      actorId: actor.id,
      newStatus: newStatus,
      userId: game.user.id,
      userName: game.user.name,
    };

    console.log("📦 Données socket:", socketData);

    if (game.users.some((u) => u.isGM && u.active)) {
      console.log("✅ GM connecté - envoi socket");
      game.socket.emit("system.jay-spik", socketData);
    } else {
      console.log("❌ Aucun GM connecté");
    }
  } else {
    console.log("🔧 Traitement direct...");
    try {
      await actor.update({ "system.status": newStatus });
      console.log("✅ Changement effectué");
    } catch (error) {
      console.error("❌ Erreur:", error.message);
    }
  }

  console.groupEnd();
}

// Activer la surveillance
monitorPermissionErrors();

// Fonctions disponibles globalement
window.testPermissions = testPermissions;
window.testStatusChangeWithPermissions = testStatusChangeWithPermissions;

console.log("=== FONCTIONS DISPONIBLES ===");
console.log("- window.testPermissions('NomActeur')");
console.log(
  "- window.testStatusChangeWithPermissions('NomActeur', 'defensive')"
);

console.log("\n💡 CONSEILS:");
if (game.user.isGM) {
  console.log("👑 Vous êtes GM - vous devriez voir les demandes des joueurs");
} else {
  console.log(
    "👤 Vous êtes joueur - vos demandes seront envoyées au GM automatiquement"
  );
}
