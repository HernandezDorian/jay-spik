import JaySpikActorBase from "./base-actor.mjs";

export default class JaySpikNPC extends JaySpikActorBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.cr = new fields.NumberField({
      ...requiredInteger,
      initial: 1,
      min: 0,
    });
    schema.xp = new fields.NumberField({
      ...requiredInteger,
      initial: 0,
      min: 0,
    });

    // Système de statuts (même que pour les personnages)
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
    this.xp = this.cr * this.cr * 100;
  }

  /**
   * Calcule la valeur modifiée d'une statistique en prenant en compte
   * les bonus d'équipement et les effets de statut
   * @param {string} stat - Le nom de la statistique
   * @param {number} baseValue - La valeur de base de la statistique
   * @returns {number} La valeur modifiée
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
}
