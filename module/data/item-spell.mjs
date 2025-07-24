import JaySpikItemBase from "./base-item.mjs";

export default class JaySpikSpell extends JaySpikItemBase {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();

    schema.spellLevel = new fields.NumberField({
      required: true,
      nullable: false,
      integer: true,
      initial: 1,
      min: 1,
      max: 9,
    });
    schema.stat = new fields.StringField({ initial: "mental" }); // Stat ciblée
    schema.formula = new fields.StringField({ initial: "1d100" }); // Formule de base
    schema.advantage = new fields.StringField({ initial: "" }); // "", "advantage" ou "disadvantage"

    // Formule de dégâts personnalisée (ex: "1d6+2", "2d8+@mental")
    schema.damageFormula = new fields.StringField({
      initial: "",
      blank: true,
    });

    return schema;
  }
}
