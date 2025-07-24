import JaySpikItemBase from "./base-item.mjs";

/**
 * Modèle de données pour les équipements
 * Un équipement peut affecter l'armure, la vie, le mana et les dégâts
 */
export default class JaySpikEquipment extends JaySpikItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    // Type d'équipement (arme, armure, accessoire, etc.)
    schema.equipmentType = new fields.StringField({
      initial: "weapon",
      choices: {
        weapon: "Arme",
        armor: "Armure",
        shield: "Bouclier",
        accessory: "Accessoire",
        consumable: "Consommable",
      },
    });

    // État équipé/déséquipé
    schema.equipped = new fields.BooleanField({ initial: false });

    // Effets sur les attributs du personnage
    schema.effects = new fields.SchemaField({
      // Bonus/malus sur l'armure
      armor: new fields.NumberField({ initial: 0 }),

      // Bonus/malus sur la vie (max)
      healthMax: new fields.NumberField({ initial: 0 }),

      // Bonus/malus sur le mana (max)
      powerMax: new fields.NumberField({ initial: 0 }),

      // Bonus/malus sur les dégâts
      damage: new fields.NumberField({ initial: 0 }),
    });

    // Dégâts spécifiques de l'arme (pour les armes uniquement)
    schema.weapon = new fields.SchemaField({
      // Dégâts de base de l'arme
      baseDamage: new fields.NumberField({ initial: 0, min: 0 }),

      // Type de dégâts (physique, magique, etc.)
      damageType: new fields.StringField({
        initial: "physical",
        choices: {
          physical: "Physique",
          magical: "Magique",
          fire: "Feu",
          ice: "Glace",
          lightning: "Foudre",
          poison: "Poison",
        },
      }),

      // Statistique utilisée pour les jets d'attaque
      attackStat: new fields.StringField({ initial: "physique" }),
    });

    // Formule de dégâts personnalisée (ex: "1d4+2", "2d6+@degats")
    schema.damageFormula = new fields.StringField({
      initial: "",
      blank: true,
    });

    // Liste des bonus/malus aux statistiques primaires (hérité du système existant)
    schema.bonusList = new fields.ArrayField(new fields.ObjectField());

    // Durabilité de l'équipement
    schema.durability = new fields.SchemaField({
      current: new fields.NumberField({ initial: 100, min: 0 }),
      max: new fields.NumberField({ initial: 100, min: 1 }),
    });

    // Valeur et poids
    schema.value = new fields.NumberField({ initial: 0, min: 0 });
    schema.weight = new fields.NumberField({
      required: true,
      nullable: false,
      initial: 0,
      min: 0,
    });

    return schema;
  }

  prepareDerivedData() {
    // Calcul des dégâts totaux (dégâts de base + bonus)
    this.totalDamage =
      (this.weapon.baseDamage || 0) + (this.effects.damage || 0);

    // Déterminer si cet équipement peut être équipé
    this.canEquip = ["weapon", "armor", "shield", "accessory"].includes(
      this.equipmentType
    );
  }
}
