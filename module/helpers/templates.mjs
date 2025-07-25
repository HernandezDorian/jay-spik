/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    "systems/jay-spik/templates/actor/parts/actor-features.hbs",
    "systems/jay-spik/templates/actor/parts/actor-skills.hbs",
    "systems/jay-spik/templates/actor/parts/actor-items.hbs",
    "systems/jay-spik/templates/actor/parts/actor-spells.hbs",
    "systems/jay-spik/templates/actor/parts/actor-effects.hbs",
    "systems/jay-spik/templates/actor/parts/actor-equipment.hbs",
    // Item partials
    "systems/jay-spik/templates/item/parts/item-effects.hbs",
  ]);
};
