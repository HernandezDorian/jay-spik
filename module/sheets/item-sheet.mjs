import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class JaySpikItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["jay-spik", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  /** @override */
  get template() {
    const path = "systems/jay-spik/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = this.document.toPlainObject();

    // Enrich description info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedDescription = await TextEditor.enrichHTML(
      this.item.system.description,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.item.getRollData(),
        // Relative UUID resolution
        relativeTo: this.item,
      }
    );

    // Add the item's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    // Adding a pointer to CONFIG.JAY_SPIK
    context.config = CONFIG.JAY_SPIK;

    // Prepare active effects for easier access
    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Gestion des bonus aux statistiques
    html.on("click", ".add-bonus", this._onAddBonus.bind(this));
    html.on("click", ".remove-bonus", this._onRemoveBonus.bind(this));

    // Active Effect management
    html.on("click", ".effect-control", (ev) =>
      onManageActiveEffect(ev, this.item)
    );
  }

  /* -------------------------------------------- */

  /**
   * Ajouter un nouveau bonus à la liste
   * @param {Event} event
   * @private
   */
  async _onAddBonus(event) {
    event.preventDefault();
    const bonusList = this.item.system.bonusList || [];
    const newBonus = {
      stat: "",
      operator: "+",
      value: 0,
    };
    bonusList.push(newBonus);
    await this.item.update({ "system.bonusList": bonusList });
  }

  /**
   * Supprimer un bonus de la liste
   * @param {Event} event
   * @private
   */
  async _onRemoveBonus(event) {
    event.preventDefault();
    const index = parseInt(event.currentTarget.dataset.index);
    const bonusList = this.item.system.bonusList || [];
    bonusList.splice(index, 1);
    await this.item.update({ "system.bonusList": bonusList });
  }
}
