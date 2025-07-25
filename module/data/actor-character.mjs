import JaySpikActorBase from "./base-actor.mjs";
import { STATS_CONFIG } from "../config/stats-config.mjs";

export default class JaySpikCharacter extends JaySpikActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
      }),
    });

    // Génération automatique du schéma des statistiques depuis la config centralisée
    const abilitiesSchema = {};
    for (const [key, config] of Object.entries(STATS_CONFIG)) {
      abilitiesSchema[key] = new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: config.defaultValue || 50,
          min: config.minValue || 0,
          max: config.maxValue || 100,
        }),
      });
    }
    schema.abilities = new fields.SchemaField(abilitiesSchema);

    schema.armor = new fields.SchemaField({
      value: new fields.NumberField({
        required: true,
        nullable: false,
        initial: 0,
        min: 0,
      }),
    });

    // Système de compétences
    schema.skills = new fields.ArrayField(
      new fields.SchemaField({
        id: new fields.StringField({
          required: true,
          initial: () => foundry.utils.randomID(),
        }),
        name: new fields.StringField({ required: true, initial: "" }),
        baseStat: new fields.StringField({
          required: true,
          initial: "physique",
        }),
        bonus: new fields.NumberField({
          required: true,
          nullable: false,
          integer: true,
          initial: 0,
        }),
        description: new fields.StringField({ required: false, initial: "" }),
      }),
      { initial: [] }
    );

    // Système de statuts
    schema.status = new fields.StringField({
      required: false,
      initial: "none", // Aucun statut par défaut
      choices: () => {
        // Génération dynamique des choix basée sur la configuration
        const choices = { none: "Aucun" }; // Option pour aucun statut

        // Import dynamique pour éviter les dépendances circulaires
        if (typeof CONFIG !== "undefined" && CONFIG.JAY_SPIK?.statuses) {
          for (const [key, config] of Object.entries(
            CONFIG.JAY_SPIK.statuses
          )) {
            if (key !== "none") {
              // Éviter de dupliquer l'option "none"
              choices[key] = config.label;
            }
          }
        }

        return choices;
      },
    });

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores pour notre système basé sur 100.
    for (const key in this.abilities) {
      // Pas de modificateur dans notre système, la valeur est directement utilisée
      this.abilities[key].mod = this.abilities[key].value;
      // Utilisation du label direct depuis la configuration (plus besoin de localisation)
      this.abilities[key].label = CONFIG.JAY_SPIK.abilities[key] ?? key;
    }
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k, v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data;
  }

  /**
   * Calcule la valeur modifiée d'une statistique en appliquant tous les bonus des items et statuts
   * @param {string} stat - Le nom de la statistique (mental, physique, social, etc.)
   * @param {number} baseValue - La valeur de base de la statistique
   * @returns {number} La valeur modifiée après application des bonus
   */
  getStatBonus(stat, baseValue) {
    let modifiedValue = baseValue || 0;

    // Safety check: ensure parent and items exist
    if (!this.parent?.items) {
      return modifiedValue;
    }

    // Parcourir tous les items de l'acteur
    for (const item of this.parent.items) {
      if (item?.system?.bonusList && Array.isArray(item.system.bonusList)) {
        // Parcourir tous les bonus de cet item
        for (const bonus of item.system.bonusList) {
          if (
            bonus?.stat === stat &&
            bonus?.value != null &&
            bonus.value !== 0
          ) {
            switch (bonus.operator) {
              case "+":
                modifiedValue += Number(bonus.value);
                break;
              case "-":
                modifiedValue -= Number(bonus.value);
                break;
              case "*":
                modifiedValue *= Number(bonus.value);
                break;
              case "/":
                if (Number(bonus.value) !== 0) {
                  modifiedValue /= Number(bonus.value);
                }
                break;
            }
          }
        }
      }
    }

    // Note : Les bonus de statuts ne sont plus appliqués ici
    // Les statuts sont maintenant purement visuels (icônes sur tokens)

    // S'assurer que la valeur reste dans les limites (0-100 pour ce système)
    return Math.max(0, Math.min(100, Math.round(modifiedValue)));
  }

  /**
   * Calcule l'armure totale de l'acteur (base + équipement)
   * @returns {number} La valeur totale d'armure
   */
  getTotalArmor() {
    let totalArmor = this.armor?.value || 0;

    // Safety check: ensure parent and items exist
    if (!this.parent?.items) {
      return totalArmor;
    }

    // Ajouter les bonus d'armure de l'équipement
    for (const item of this.parent.items) {
      if (
        item?.type === "equipment" &&
        item?.system?.equipped &&
        item?.system?.effects?.armor
      ) {
        totalArmor += item.system.effects.armor;
      }
    }

    return Math.max(0, totalArmor);
  }

  /**
   * Applique des dégâts à l'acteur en tenant compte de l'armure
   * @param {number} damage - Les dégâts bruts à appliquer
   * @param {boolean} armorPiercing - Si true, ignore l'armure
   * @returns {Object} Résultat avec les dégâts finaux et l'armure utilisée
   */
  async applyDamage(damage, armorPiercing = false) {
    console.log("=== applyDamage appelé ===");
    console.log("damage:", damage, "armorPiercing:", armorPiercing);
    console.log("this.parent:", this.parent);
    console.log("this.parent.constructor.name:", this.parent.constructor.name);

    const armor = armorPiercing ? 0 : this.getTotalArmor();
    const finalDamage = Math.max(0, damage - armor);
    console.log("armor:", armor, "finalDamage:", finalDamage);

    if (finalDamage > 0) {
      const currentHealth = this.health.value;

      // Si la santé est à 0, la remettre à sa valeur max pour le test
      let testCurrentHealth = currentHealth;
      if (currentHealth === 0) {
        testCurrentHealth = this.health.max || 10; // Utiliser max ou 10 par défaut
        console.log(
          `⚠️ TEST: Personnage à 0 PV, simulation avec ${testCurrentHealth} PV pour le test`
        );

        // Appliquer d'abord la santé de test
        await this.parent.update({
          "system.health.value": testCurrentHealth,
        });
      }

      const newHealth = Math.max(0, testCurrentHealth - finalDamage);
      console.log("currentHealth:", testCurrentHealth, "newHealth:", newHealth);

      console.log("Appel de this.parent.update...");
      try {
        const updateResult = await this.parent.update({
          "system.health.value": newHealth,
        });
        console.log("Update réussi:", updateResult);
        console.log("Santé après update:", this.health.value);
      } catch (updateError) {
        console.error("Erreur lors de l'update:", updateError);
        throw updateError;
      }
    } else {
      console.log("Aucun dégât à appliquer (finalDamage <= 0)");
    }

    const result = {
      damageRolled: damage,
      armor: armor,
      finalDamage: finalDamage,
      blocked: damage - finalDamage,
      armorPiercing: armorPiercing,
    };

    console.log("=== applyDamage terminé ===");
    console.log("Résultat:", result);
    return result;
  }

  /**
   * Version alternative d'applyDamage qui utilise l'actor directement
   */
  async applyDamageDirectly(damage, armorPiercing = false, actor = null) {
    console.log("=== applyDamageDirectly appelé ===");
    const targetActor = actor || this.parent;
    console.log("targetActor:", targetActor);
    console.log("targetActor.constructor.name:", targetActor.constructor.name);

    const armor = armorPiercing ? 0 : this.getTotalArmor();
    const finalDamage = Math.max(0, damage - armor);
    console.log("armor:", armor, "finalDamage:", finalDamage);

    if (finalDamage > 0) {
      const currentHealth = this.health.value;

      // Si la santé est à 0, la remettre à sa valeur max pour le test
      let testCurrentHealth = currentHealth;
      if (currentHealth === 0) {
        testCurrentHealth = this.health.max || 10; // Utiliser max ou 10 par défaut
        console.log(
          `⚠️ TEST: Personnage à 0 PV, simulation avec ${testCurrentHealth} PV pour le test`
        );

        // Appliquer d'abord la santé de test
        await targetActor.update({
          "system.health.value": testCurrentHealth,
        });
      }

      const newHealth = Math.max(0, testCurrentHealth - finalDamage);
      console.log("currentHealth:", testCurrentHealth, "newHealth:", newHealth);

      console.log("Appel de targetActor.update...");
      try {
        const updateResult = await targetActor.update({
          "system.health.value": newHealth,
        });
        console.log("Update réussi:", updateResult);
        console.log("Santé après update:", this.health.value);
      } catch (updateError) {
        console.error("Erreur lors de l'update:", updateError);
        throw updateError;
      }
    }

    return {
      damageRolled: damage,
      armor: armor,
      finalDamage: finalDamage,
      blocked: damage - finalDamage,
      armorPiercing: armorPiercing,
    };
  }

  /**
   * Effectue un jet de compétence
   * @param {string} skillId - ID de la compétence
   * @param {object} options - Options pour le roll
   */
  async rollSkill(skillId, options = {}) {
    const skill = this.skills.find((s) => s.id === skillId);
    if (!skill) {
      ui.notifications.error(`Compétence non trouvée: ${skillId}`);
      return;
    }

    // Récupérer la valeur de la statistique de base
    const baseStat = this.abilities[skill.baseStat];
    if (!baseStat) {
      ui.notifications.error(`Statistique non trouvée: ${skill.baseStat}`);
      return;
    }

    // Calculer la valeur finale avec le bonus de la compétence
    const finalValue = baseStat.value + skill.bonus;

    // Créer la formule de roll (d100 <= valeur finale)
    const rollFormula = "1d100";
    const roll = await new Roll(rollFormula).evaluate();

    const success = roll.total <= finalValue;
    const criticalSuccess = roll.total <= 5;
    const criticalFailure = roll.total >= 96;

    // Déterminer le niveau de succès
    let successLevel = "failure";
    let successText = "Échec";

    if (criticalFailure) {
      successLevel = "critical-failure";
      successText = "Échec Critique";
    } else if (criticalSuccess) {
      successLevel = "critical-success";
      successText = "Succès Critique";
    } else if (success) {
      successLevel = "success";
      successText = "Succès";
    }

    // Créer le message de chat
    const flavor = `
      <div class="skill-roll">
        <h3><strong>${skill.name}</strong></h3>
        <div class="skill-details">
          <p><strong>Statistique:</strong> ${
            STATS_CONFIG[skill.baseStat]?.label || skill.baseStat
          } (${baseStat.value})</p>
          ${
            skill.bonus !== 0
              ? `<p><strong>Bonus:</strong> ${skill.bonus > 0 ? "+" : ""}${
                  skill.bonus
                }</p>`
              : ""
          }
          <p><strong>Seuil de réussite:</strong> ${finalValue}</p>
          ${skill.description ? `<p><em>${skill.description}</em></p>` : ""}
        </div>
        <div class="roll-result ${successLevel}">
          <strong>${successText}</strong> (${roll.total} ≤ ${finalValue})
        </div>
      </div>
    `;

    // Envoyer le message au chat
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.parent }),
      flavor: flavor,
      rollMode: options.rollMode || game.settings.get("core", "rollMode"),
    });

    return {
      roll: roll,
      success: success,
      criticalSuccess: criticalSuccess,
      criticalFailure: criticalFailure,
      finalValue: finalValue,
      skill: skill,
    };
  }

  /**
   * Ajoute une nouvelle compétence
   * @param {object} skillData - Données de la compétence
   */
  async addSkill(skillData) {
    const newSkill = {
      id: foundry.utils.randomID(),
      name: skillData.name || "Nouvelle Compétence",
      baseStat: skillData.baseStat || "physique",
      bonus: skillData.bonus || 0,
      description: skillData.description || "",
    };

    const currentSkills = [...this.skills];
    currentSkills.push(newSkill);

    await this.parent.update({
      "system.skills": currentSkills,
    });

    return newSkill;
  }

  /**
   * Supprime une compétence
   * @param {string} skillId - ID de la compétence à supprimer
   */
  async removeSkill(skillId) {
    const currentSkills = this.skills.filter((s) => s.id !== skillId);

    await this.parent.update({
      "system.skills": currentSkills,
    });
  }

  /**
   * Met à jour une compétence
   * @param {string} skillId - ID de la compétence
   * @param {object} updateData - Données à mettre à jour
   */
  async updateSkill(skillId, updateData) {
    const currentSkills = [...this.skills];
    const skillIndex = currentSkills.findIndex((s) => s.id === skillId);

    if (skillIndex === -1) {
      ui.notifications.error(`Compétence non trouvée: ${skillId}`);
      return;
    }

    currentSkills[skillIndex] = {
      ...currentSkills[skillIndex],
      ...updateData,
    };

    await this.parent.update({
      "system.skills": currentSkills,
    });
  }

  /**
   * Lance un jet de compétence
   * @param {string} skillId - ID de la compétence
   */
  async rollSkill(skillId) {
    const skill = this.skills.find((s) => s.id === skillId);

    if (!skill) {
      ui.notifications.error(`Compétence non trouvée: ${skillId}`);
      return;
    }

    // Récupérer la valeur de la stat de base
    const baseStat = skill.baseStat || "physique";
    const baseValue = this.abilities?.[baseStat]?.value || 50;

    // Calculer le seuil de réussite (stat de base + bonus)
    const threshold = baseValue + (skill.bonus || 0);

    // Effectuer le jet de dé
    const roll = new Roll("1d100");
    await roll.evaluate();

    // Déterminer le résultat
    const isSuccess = roll.total <= threshold;
    const margin = threshold - roll.total;

    // Préparer le message de chat
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.parent }),
      flavor: `Jet de compétence: ${skill.name}`,
      content: `
        <div class="skill-roll">
          <h3>${skill.name}</h3>
          <div class="roll-details">
            <p><strong>Statistique de base:</strong> ${
              CONFIG.JAY_SPIK.abilities[baseStat]
            } (${baseValue})</p>
            ${
              skill.bonus !== 0
                ? `<p><strong>Bonus/Malus:</strong> ${
                    skill.bonus >= 0 ? "+" : ""
                  }${skill.bonus}</p>`
                : ""
            }
            <p><strong>Seuil de réussite:</strong> ${threshold}</p>
            <p><strong>Résultat du dé:</strong> ${roll.total}</p>
            <p class="result ${isSuccess ? "success" : "failure"}">
              <strong>${isSuccess ? "RÉUSSITE" : "ÉCHEC"}</strong>
              ${
                isSuccess
                  ? `(marge: ${margin})`
                  : `(échec de ${Math.abs(margin)})`
              }
            </p>
            ${skill.description ? `<p><em>${skill.description}</em></p>` : ""}
          </div>
        </div>
      `,
      rolls: [roll],
    };

    // Envoyer le message
    await ChatMessage.create(messageData);

    return {
      skill,
      roll,
      threshold,
      isSuccess,
      margin,
    };
  }
}
