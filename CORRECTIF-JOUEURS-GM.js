// ===============================================
// CORRECTIF TEMPORAIRE - PROBLÈME JOUEURS/GM
// ===============================================

console.log("🔧 Application du correctif temporaire pour joueurs/GM");

// Détecter si on est un joueur (pas GM)
const isPlayer = !game.user.isGM;

if (isPlayer) {
  console.log("👤 Mode joueur détecté - Application protections spéciales");

  // Sauvegarder la fonction originale si elle existe
  if (typeof window.queueStatusUpdate === "function") {
    window.originalQueueStatusUpdate = window.queueStatusUpdate;
  }

  // Version joueur avec délais plus longs
  window.queueStatusUpdate = function (actor, newStatus, delay = 200) {
    console.log(
      `JaySpik: [JOUEUR] Queue statut '${newStatus}' pour ${actor.name} (délai: ${delay}ms)`
    );

    // Vérifier les permissions avant de faire quoi que ce soit
    if (!actor.testUserPermission(game.user, "OWNER")) {
      console.log("JaySpik: [JOUEUR] Pas propriétaire - demande au GM");

      // Envoyer une demande via socket au GM
      game.socket.emit("system.jay-spik", {
        action: "playerStatusRequest",
        actorId: actor.id,
        newStatus: newStatus,
        playerId: game.user.id,
        playerName: game.user.name,
      });
      return;
    }

    // Si on a les permissions, utiliser un délai plus long
    if (window.originalQueueStatusUpdate) {
      window.originalQueueStatusUpdate(actor, newStatus, delay);
    } else {
      // Fallback simple
      setTimeout(() => {
        console.log(`JaySpik: [JOUEUR FALLBACK] Changement vers ${newStatus}`);
        actor.update({ "system.status": newStatus });
      }, delay);
    }
  };
} else {
  console.log("👑 Mode GM détecté - Écoute des demandes joueurs");

  // Le GM écoute les demandes des joueurs
  game.socket.on("system.jay-spik", (data) => {
    if (data.action === "playerStatusRequest") {
      console.log(
        `JaySpik: [GM] Demande de ${data.playerName} - ${data.actorId} -> ${data.newStatus}`
      );

      const actor = game.actors.get(data.actorId);
      if (actor) {
        console.log(`JaySpik: [GM] Traitement pour ${actor.name}`);

        // Le GM fait le changement avec ses permissions complètes
        if (typeof window.queueStatusUpdate === "function") {
          window.queueStatusUpdate(actor, data.newStatus, 50);
        } else {
          // Fallback
          actor.update({ "system.status": data.newStatus });
        }
      }
    }
  });
}

// Hook spécial pour surveiller les problèmes
Hooks.on("updateActor", (actor, changes, options, userId) => {
  if (changes.system?.status !== undefined) {
    const userType = game.users.get(userId)?.isGM ? "GM" : "JOUEUR";
    const isOwner = actor.testUserPermission(game.users.get(userId), "OWNER");

    console.log(
      `JaySpik: [MONITOR] ${userType} ${userId} change ${actor.name} -> ${changes.system.status}`
    );
    console.log(`JaySpik: [MONITOR] Propriétaire: ${isOwner}`);

    // Compter les effets de statut après un délai
    setTimeout(() => {
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

      if (statusEffects.length > 1) {
        console.error(
          `🚨 [MONITOR] DOUBLON DÉTECTÉ après changement ${userType}! ${statusEffects.length} effets`
        );
        statusEffects.forEach((effect, i) => {
          console.error(`  [${i}] ${effect.name} (${effect.id})`);
        });
      } else {
        console.log(
          `✅ [MONITOR] OK après changement ${userType} - ${statusEffects.length} effet(s)`
        );
      }
    }, 1000);
  }
});

// Fonction de nettoyage d'urgence
window.emergencyCleanup = function (actorName) {
  console.log(`🚨 Nettoyage d'urgence pour ${actorName}`);

  const actor = game.actors.getName(actorName) || game.actors.get(actorName);
  if (!actor) {
    console.error("Acteur non trouvé");
    return;
  }

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

  console.log(`Suppression de ${statusEffects.length} effet(s) de statut`);

  statusEffects.forEach(async (effect) => {
    try {
      await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
      console.log(`Supprimé: ${effect.name} (${effect.id})`);
    } catch (error) {
      console.log(`Erreur suppression ${effect.id}:`, error.message);
    }
  });
};

console.log("✅ Correctif temporaire appliqué");
console.log("💡 Fonctions disponibles:");
console.log("- window.emergencyCleanup('NomActeur') : nettoyage forcé");

if (isPlayer) {
  console.log(
    "👤 Mode joueur: les changements passent par le GM automatiquement"
  );
} else {
  console.log("👑 Mode GM: écoute des demandes des joueurs");
}
