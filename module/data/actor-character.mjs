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
}
