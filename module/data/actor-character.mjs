import JaySpikActorBase from "./base-actor.mjs";

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

    // Iterate over ability names and create a new SchemaField for each.
    schema.abilities = new fields.SchemaField({
      mental: new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: 50,
          min: 0,
          max: 100,
        }),
      }),
      physique: new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: 50,
          min: 0,
          max: 100,
        }),
      }),
      social: new fields.SchemaField({
        value: new fields.NumberField({
          ...requiredInteger,
          initial: 50,
          min: 0,
          max: 100,
        }),
      }),
    });

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores pour notre système basé sur 100.
    for (const key in this.abilities) {
      // Pas de modificateur dans notre système, la valeur est directement utilisée
      this.abilities[key].mod = this.abilities[key].value;
      // Handle ability label localization.
      this.abilities[key].label =
        game.i18n.localize(CONFIG.JAY_SPIK.abilities[key]) ?? key;
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
}
