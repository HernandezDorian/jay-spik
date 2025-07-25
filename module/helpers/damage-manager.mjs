/**
 * Gestionnaire de dégâts avec support pour les permissions
 * Utilise le système de socket de FoundryVTT pour permettre aux joueurs d'appliquer des dégâts
 */
export class DamageManager {
  static SOCKET_NAME = "system.jay-spik";

  /**
   * Initialise le gestionnaire de dégâts
   */
  static initialize() {
    game.socket.on(this.SOCKET_NAME, this._onSocketReceived.bind(this));
  }

  /**
   * Applique des dégâts à une liste de cibles
   * @param {Array} targetData - Données des cibles
   * @param {number} damage - Dégâts à appliquer
   * @param {boolean} armorPiercing - Si les dégâts ignorent l'armure
   * @param {Object} itemData - Données de l'item utilisé
   * @param {Object} rollData - Données du jet de dés
   * @returns {Promise<Array>} Résultats des dégâts appliqués
   */
  static async applyDamageToTargets(
    targetData,
    damage,
    armorPiercing,
    itemData,
    rollData
  ) {
    if (game.user.isGM) {
      // Si on est GM, on applique directement
      return await this._executeDamageApplication(
        targetData,
        damage,
        armorPiercing,
        itemData,
        rollData
      );
    } else {
      // Si on est joueur, on demande au GM via socket
      return await this._requestDamageApplication(
        targetData,
        damage,
        armorPiercing,
        itemData,
        rollData
      );
    }
  }

  /**
   * Demande au GM d'appliquer les dégâts via socket
   * @private
   */
  static async _requestDamageApplication(
    targetData,
    damage,
    armorPiercing,
    itemData,
    rollData
  ) {
    const requestId = foundry.utils.randomID();

    console.log("Joueur demande l'application de dégâts via GM:", {
      targetData,
      damage,
      armorPiercing,
    });
    ui.notifications.info("Demande d'application de dégâts envoyée au GM...");

    const socketData = {
      type: "applyDamage",
      requestId: requestId,
      targetData: targetData,
      damage: damage,
      armorPiercing: armorPiercing,
      itemData: itemData,
      rollData: rollData,
      userId: game.user.id,
    };

    // Envoyer la demande au GM
    game.socket.emit(this.SOCKET_NAME, socketData);

    // Attendre la réponse du GM (avec timeout)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        ui.notifications.error(
          "Timeout: Aucun GM disponible pour appliquer les dégâts"
        );
        reject(
          new Error("Timeout: Aucun GM disponible pour appliquer les dégâts")
        );
      }, 10000); // 10 secondes de timeout

      const handler = (data) => {
        if (data.type === "damageResult" && data.requestId === requestId) {
          clearTimeout(timeout);
          game.socket.off(this.SOCKET_NAME, handler);

          if (data.error) {
            ui.notifications.error(
              `Erreur lors de l'application des dégâts: ${data.error}`
            );
            reject(new Error(data.error));
          } else {
            ui.notifications.success("Dégâts appliqués avec succès par le GM");
            resolve(data.results);
          }
        }
      };

      game.socket.on(this.SOCKET_NAME, handler);
    });
  }

  /**
   * Gère les messages socket reçus
   * @private
   */
  static async _onSocketReceived(data) {
    if (!game.user.isGM) return;

    switch (data.type) {
      case "applyDamage":
        console.log("GM reçoit une demande d'application de dégâts:", data);
        try {
          const results = await this._executeDamageApplication(
            data.targetData,
            data.damage,
            data.armorPiercing,
            data.itemData,
            data.rollData
          );

          console.log("Résultats de l'application des dégâts:", results);

          // Renvoyer les résultats au joueur
          game.socket.emit(this.SOCKET_NAME, {
            type: "damageResult",
            requestId: data.requestId,
            results: results,
          });

          // Notification au GM
          ui.notifications.info(
            `Dégâts appliqués par le GM pour ${
              game.users.get(data.userId)?.name || "un joueur"
            }`
          );
        } catch (error) {
          console.error("Erreur lors de l'application des dégâts:", error);
          game.socket.emit(this.SOCKET_NAME, {
            type: "damageResult",
            requestId: data.requestId,
            error: error.message,
          });
        }
        break;
    }
  }

  /**
   * Exécute l'application des dégâts (côté GM)
   * @private
   */
  static async _executeDamageApplication(
    targetData,
    damage,
    armorPiercing,
    itemData,
    rollData
  ) {
    const results = [];

    for (const target of targetData) {
      try {
        // Récupérer l'acteur par son ID
        let actor = game.actors.get(target.actorId);

        // Si pas trouvé directement, essayer de récupérer via le token si on a le tokenId
        if (!actor && target.tokenId) {
          const token = canvas.tokens.get(target.tokenId);
          if (token && token.actor) {
            actor = token.actor; // Peut être un ActorDelta
            console.log(
              `Acteur récupéré via token: ${actor?.name} (Type: ${actor?.constructor.name})`
            );
          }
        }

        // Dernier recours : chercher dans tous les tokens de la scène
        if (!actor && target.tokenId) {
          const tokenDoc = game.scenes.current.tokens.get(target.tokenId);
          if (tokenDoc && tokenDoc.actor) {
            actor = tokenDoc.actor;
            console.log(
              `Acteur récupéré via token document: ${actor?.name} (Type: ${actor?.constructor.name})`
            );
          }
        }

        if (!actor) {
          console.warn(
            `Acteur non trouvé: ${target.actorId} (Token: ${target.tokenId})`
          );
          results.push({
            target: target.name,
            error: "Acteur non trouvé",
            damageRolled: damage,
            finalDamage: 0,
            armor: 0,
            blocked: 0,
          });
          continue;
        }

        // Calculer l'armure et les dégâts finaux
        let armor = 0;
        try {
          if (armorPiercing) {
            armor = 0;
            console.log("Perce-armure activé, armure ignorée");
          } else if (
            actor.system &&
            typeof actor.system.getTotalArmor === "function"
          ) {
            armor = actor.system.getTotalArmor();
            console.log(`Armure récupérée via getTotalArmor(): ${armor}`);
          } else if (
            actor.system &&
            actor.system.armor &&
            typeof actor.system.armor.value === "number"
          ) {
            armor = actor.system.armor.value;
            console.log(`Armure récupérée via armor.value: ${armor}`);
          } else {
            console.warn(`Impossible de récupérer l'armure pour ${actor.name}`);
            armor = 0;
          }
        } catch (armorError) {
          console.error(
            `Erreur lors du calcul de l'armure pour ${actor.name}:`,
            armorError
          );
          armor = 0;
        }

        const finalDamage = Math.max(0, damage - armor);
        const blocked = damage - finalDamage;

        console.log(
          `Calcul des dégâts pour ${actor.name}: ${damage} dégâts - ${armor} armure = ${finalDamage} dégâts finaux`
        );

        // Appliquer les dégâts directement via l'Actor (avec permissions GM)
        if (finalDamage > 0) {
          const currentHealth = actor.system.health.value;
          const newHealth = Math.max(0, currentHealth - finalDamage);

          // Appliquer les dégâts (le GM a toujours les permissions)
          await actor.update({
            "system.health.value": newHealth,
          });

          console.log(
            `Dégâts appliqués à ${actor.name}: ${currentHealth} -> ${newHealth} (${finalDamage} dégâts)`
          );
        } else {
          console.log(
            `Aucun dégât à appliquer à ${actor.name} (${finalDamage} dégâts finaux)`
          );
        }

        const result = {
          target: actor.name,
          damageRolled: damage,
          armor: armor,
          finalDamage: finalDamage,
          blocked: blocked,
          armorPiercing: armorPiercing,
        };

        results.push(result);
      } catch (error) {
        console.error(
          `Erreur lors de l'application des dégâts à ${target.name}:`,
          error
        );
        results.push({
          target: target.name,
          error: error.message,
          damageRolled: damage,
          finalDamage: 0,
          armor: 0,
          blocked: 0,
        });
      }
    }

    return results;
  }

  /**
   * Prépare les données des cibles pour l'envoi via socket
   * @param {Array} targets - Tokens ciblés
   * @returns {Array} Données simplifiées des cibles
   */
  static prepareTargetData(targets) {
    const targetData = targets
      .map((target) => {
        console.log("Préparation des données pour la cible:", target);

        // Vérifier si c'est un token avec un acteur
        let actorId = null;
        let name = target.name || "Cible inconnue";
        let tokenId = target.id;

        if (target.actor) {
          // Token avec acteur
          actorId = target.actor.id;
          name = target.actor.name;

          // Si c'est un ActorDelta (token lié), on utilise l'ID du token plutôt que de l'acteur
          if (target.actor.isToken) {
            console.log("Token avec ActorDelta détecté");
            // Pour les ActorDelta, on va récupérer l'acteur via le token
            actorId = target.actor.id; // L'ID de l'ActorDelta
          }
        } else if (target.document?.actor) {
          // Token document avec acteur
          actorId = target.document.actor.id;
          name = target.document.actor.name;

          if (target.document.actor.isToken) {
            console.log("Token document avec ActorDelta détecté");
            actorId = target.document.actor.id;
          }
        } else if (target.id && game.actors.get(target.id)) {
          // C'est peut-être directement un acteur
          actorId = target.id;
          name = game.actors.get(target.id).name;
        }

        console.log(
          `Cible préparée: ${name} (Actor ID: ${actorId}, Token ID: ${tokenId})`
        );

        return {
          name: name,
          actorId: actorId,
          tokenId: tokenId,
        };
      })
      .filter((target) => {
        if (!target.actorId) {
          console.warn(`Cible ${target.name} ignorée car aucun acteur trouvé`);
          return false;
        }
        return true;
      });

    console.log("Données des cibles préparées:", targetData);
    return targetData;
  }
}
