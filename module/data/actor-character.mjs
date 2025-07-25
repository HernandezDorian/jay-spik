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
          initial: config.initial || 50,
          min: config.min || 0,
          max: config.max || 100,
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
   * Calcule la valeur modifiée d'une statistique en appliquant tous les bonus des items
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
}
