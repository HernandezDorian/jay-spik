// ===============================================
// DIAGNOSTIC AVANCÉ DES DOUBLONS DE STATUTS
// ===============================================

console.log("=== DIAGNOSTIC AVANCÉ DES DOUBLONS ===");

// Fonction pour analyser en détail les effets de statut
function analyzeStatusEffects(actor) {
  console.group(`📊 Analyse détaillée - ${actor.name} (${actor.id})`);

  // Obtenir tous les effets
  const allEffects = Array.from(actor.effects.values());
  console.log(`Total d'effets: ${allEffects.length}`);

  // Filtrer les effets de statut JaySpik
  const statusEffects = allEffects.filter((effect) => {
    try {
      return (
        effect.flags?.jaySpik?.isStatusEffect ||
        (Array.isArray(effect.statuses) &&
          effect.statuses.some((s) => s.startsWith("jayspik-"))) ||
        (effect.name &&
          (effect.name.includes("Défensive") ||
            effect.name.includes("Offensive") ||
            effect.name.includes("Concentré") ||
            effect.name.includes("Furtif") ||
            effect.name.includes("Berserk")))
      );
    } catch (e) {
      return false;
    }
  });

  console.log(`Effets de statut JaySpik: ${statusEffects.length}`);

  if (statusEffects.length > 0) {
    console.table(
      statusEffects.map((effect) => ({
        id: effect.id,
        name: effect.name,
        statusKey: effect.flags?.jaySpik?.statusKey,
        statuses: effect.statuses,
        createdTime: effect.createdTime || "N/A",
        origin: effect.origin,
        transfer: effect.transfer,
        disabled: effect.disabled,
      }))
    );

    // Analyser les doublons
    const duplicates = {};
    statusEffects.forEach((effect) => {
      const key = effect.flags?.jaySpik?.statusKey || effect.name;
      if (!duplicates[key]) duplicates[key] = [];
      duplicates[key].push(effect);
    });

    const hasDuplicates = Object.values(duplicates).some(
      (arr) => arr.length > 1
    );
    if (hasDuplicates) {
      console.warn("🚨 DOUBLONS DÉTECTÉS:");
      Object.entries(duplicates).forEach(([key, effects]) => {
        if (effects.length > 1) {
          console.warn(`  - ${key}: ${effects.length} instances`);
          effects.forEach((effect, i) => {
            console.warn(
              `    [${i}] ID: ${effect.id}, Créé: ${
                effect.createdTime || "N/A"
              }`
            );
          });
        }
      });
    } else {
      console.log("✅ Aucun doublon détecté");
    }
  }

  console.groupEnd();
}

// Fonction pour surveiller les hooks en temps réel
function setupHookMonitoring() {
  console.log("🔍 Mise en place de la surveillance des hooks...");

  // Surveiller updateActor
  const originalUpdateActorHook = Hooks._call;
  let updateActorCalls = 0;

  Hooks.on("updateActor", (actor, changes, options, userId) => {
    updateActorCalls++;
    if (changes.system?.status !== undefined) {
      console.warn(`🔄 updateActor Hook #${updateActorCalls} - ${actor.name}:`);
      console.warn(`  Ancien statut: ${actor.system.status}`);
      console.warn(`  Nouveau statut: ${changes.system.status}`);
      console.warn(`  User ID: ${userId}`);
      console.warn(`  Options:`, options);

      // Compter les effets AVANT
      const beforeCount = actor.effects.filter((effect) => {
        try {
          return (
            effect.flags?.jaySpik?.isStatusEffect ||
            (Array.isArray(effect.statuses) &&
              effect.statuses.some((s) => s.startsWith("jayspik-")))
          );
        } catch (e) {
          return false;
        }
      }).length;

      console.warn(`  Effets de statut AVANT: ${beforeCount}`);

      // Vérifier APRÈS un délai
      setTimeout(() => {
        const afterCount = actor.effects.filter((effect) => {
          try {
            return (
              effect.flags?.jaySpik?.isStatusEffect ||
              (Array.isArray(effect.statuses) &&
                effect.statuses.some((s) => s.startsWith("jayspik-")))
            );
          } catch (e) {
            return false;
          }
        }).length;

        console.warn(`  Effets de statut APRÈS: ${afterCount}`);

        if (afterCount > 1) {
          console.error(
            `🚨 DOUBLON CRÉÉ! ${afterCount} effets après updateActor`
          );
          analyzeStatusEffects(actor);
        }
      }, 500);
    }
  });

  // Surveiller la création/suppression d'ActiveEffect
  Hooks.on("createActiveEffect", (effect, options, userId) => {
    if (effect.flags?.jaySpik?.isStatusEffect) {
      console.log(
        `➕ ActiveEffect créé: ${effect.name} (${effect.id}) pour ${effect.parent?.name}`
      );
    }
  });

  Hooks.on("deleteActiveEffect", (effect, options, userId) => {
    if (effect.flags?.jaySpik?.isStatusEffect) {
      console.log(
        `➖ ActiveEffect supprimé: ${effect.name} (${effect.id}) de ${effect.parent?.name}`
      );
    }
  });
}

// Analyser tous les acteurs actuellement
console.log("📋 Analyse de tous les acteurs...");
game.actors.forEach((actor) => {
  const statusEffectCount = actor.effects.filter((effect) => {
    try {
      return (
        effect.flags?.jaySpik?.isStatusEffect ||
        (Array.isArray(effect.statuses) &&
          effect.statuses.some((s) => s.startsWith("jayspik-")))
      );
    } catch (e) {
      return false;
    }
  }).length;

  if (statusEffectCount > 1) {
    console.error(`🚨 ${actor.name}: ${statusEffectCount} effets de statut`);
    analyzeStatusEffects(actor);
  } else if (statusEffectCount === 1) {
    console.log(`✅ ${actor.name}: ${statusEffectCount} effet de statut`);
  } else {
    console.log(`⚪ ${actor.name}: aucun effet de statut`);
  }
});

// Activer la surveillance
setupHookMonitoring();

// Fonction de test pour reproduire le bug
window.testStatusChange = function (actorName, newStatus) {
  console.group(`🧪 TEST - Changement de statut pour ${actorName}`);

  const actor = game.actors.getName(actorName);
  if (!actor) {
    console.error("Acteur non trouvé:", actorName);
    console.groupEnd();
    return;
  }

  console.log(`Statut actuel: ${actor.system.status}`);
  console.log(`Nouveau statut: ${newStatus}`);

  const beforeCount = actor.effects.filter((effect) => {
    try {
      return (
        effect.flags?.jaySpik?.isStatusEffect ||
        (Array.isArray(effect.statuses) &&
          effect.statuses.some((s) => s.startsWith("jayspik-")))
      );
    } catch (e) {
      return false;
    }
  }).length;

  console.log(`Effets AVANT changement: ${beforeCount}`);

  // Effectuer le changement
  actor.update({ "system.status": newStatus }).then(() => {
    setTimeout(() => {
      const afterCount = actor.effects.filter((effect) => {
        try {
          return (
            effect.flags?.jaySpik?.isStatusEffect ||
            (Array.isArray(effect.statuses) &&
              effect.statuses.some((s) => s.startsWith("jayspik-")))
          );
        } catch (e) {
          return false;
        }
      }).length;

      console.log(`Effets APRÈS changement: ${afterCount}`);

      if (afterCount > 1) {
        console.error(`🚨 DOUBLON CRÉÉ! Analyse...`);
        analyzeStatusEffects(actor);
      } else {
        console.log(`✅ Pas de doublon`);
      }

      console.groupEnd();
    }, 1000);
  });
};

console.log("=== DIAGNOSTIC TERMINÉ ===");
console.log("💡 Utilisation:");
console.log("- window.testStatusChange('NomActeur', 'defensive') pour tester");
console.log("- Les hooks sont maintenant surveillés en temps réel");
