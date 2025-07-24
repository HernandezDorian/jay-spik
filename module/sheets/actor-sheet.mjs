import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class JaySpikActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["jay-spik", "sheet", "actor"],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "features",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/jay-spik/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    let context;
    try {
      context = super.getData();
      if (!context || typeof context !== "object") {
        console.warn(
          "JaySpik: super.getData() returned invalid context, creating new one"
        );
        context = {
          actor: this.actor,
          data: this.actor.system,
          items: this.actor.items,
          effects: this.actor.effects,
          editable: this.isEditable,
        };
      }
    } catch (error) {
      console.error("JaySpik: Error in super.getData():", error);
      context = {
        actor: this.actor,
        data: this.actor.system,
        items: this.actor.items,
        effects: this.actor.effects,
        editable: this.isEditable,
      };
    }

    // Use a safe clone of the actor data for further operations.
    const actorData = this.document.toPlainObject();

    // Safety check: ensure actorData.system exists
    if (!actorData.system) {
      console.warn("JaySpik: actorData.system is missing, using empty object");
      actorData.system = {};
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Adding a pointer to CONFIG.JAY_SPIK
    context.config = CONFIG.JAY_SPIK;

    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await TextEditor.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type

    // Enrichir les données des statistiques avec les valeurs modifiées par les bonus des items
    if (context.system?.abilities) {
      for (const [key, ability] of Object.entries(context.system.abilities)) {
        if (
          ability &&
          typeof ability === "object" &&
          ability.value !== undefined
        ) {
          const baseValue = ability.value || 0;
          const modifiedValue = this.actor.system.getStatBonus(key, baseValue);

          // Créer une copie sécurisée de l'objet ability
          const abilityClone = foundry.utils.deepClone(ability);
          abilityClone.modifiedValue = modifiedValue;
          abilityClone.hasBonus = modifiedValue !== baseValue;

          context.system.abilities[key] = abilityClone;
        }
      }
    }

    // Préparer les données d'équipement
    this._prepareEquipmentData(context);
  }

  /**
   * Prépare les données spécifiques à l'équipement
   * @param {Object} context Le contexte de données de la fiche
   * @private
   */
  _prepareEquipmentData(context) {
    // Filtrer les équipements
    const equipment = (context.items || []).filter(
      (item) => item.type === "equipment"
    );
    context.equipment = equipment;

    // Calculer les totaux d'équipement
    const totals = {
      armor: 0,
      health: 0,
      mana: 0,
      damage: 0,
    };

    for (const item of equipment) {
      if (item.system?.equipped && item.system?.effects) {
        totals.armor += item.system.effects.armor || 0;
        totals.health += item.system.effects.health || 0;
        totals.mana += item.system.effects.mana || 0;
        totals.damage += item.system.effects.damage || 0;
      }
    }

    context.equipmentTotals = totals;
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const features = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
    };

    // Containers for equipment
    const weapons = [];
    const armors = [];
    const accessories = [];

    // Safety check: ensure context.items exists and is an array
    if (!context.items || !Array.isArray(context.items)) {
      console.warn(
        "_prepareItems: context.items is not an array",
        context.items
      );
      context.items = [];
    }

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === "item") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "feature") {
        features.push(i);
      }
      // Append to spells.
      else if (i.type === "spell") {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
      // Append to equipment categories
      else if (i.type === "equipment") {
        if (i.system.equipmentType === "weapon") {
          weapons.push(i);
        } else if (["armor", "shield"].includes(i.system.equipmentType)) {
          armors.push(i);
        } else if (i.system.equipmentType === "accessory") {
          accessories.push(i);
        }
      }
    }

    // Calculate equipment bonuses
    context.equipmentBonuses = this._calculateEquipmentBonuses(context.items);

    // Assign and return
    context.gear = gear;
    context.features = features;
    context.spells = spells;
    context.weapons = weapons;
    context.armors = armors;
    context.accessories = accessories;
  }

  /**
   * Calculate total bonuses from equipped items
   * @param {Array} items - All items of the actor
   * @returns {Object} Object containing total bonuses
   * @private
   */
  _calculateEquipmentBonuses(items) {
    const bonuses = {
      armor: 0,
      healthMax: 0,
      powerMax: 0,
      damage: 0,
    };

    // Safety check: ensure items is an array
    if (!Array.isArray(items)) {
      console.warn("_calculateEquipmentBonuses: items is not an array", items);
      return bonuses;
    }

    // Sum bonuses from all equipped equipment
    for (const item of items) {
      if (item?.type === "equipment" && item?.system?.equipped) {
        bonuses.armor += item.system.effects?.armor || 0;
        bonuses.healthMax += item.system.effects?.healthMax || 0;
        bonuses.powerMax += item.system.effects?.powerMax || 0;
        bonuses.damage += item.system.effects?.damage || 0;
      }
    }

    return bonuses;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on("click", ".item-edit", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on("click", ".item-create", this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on("click", ".item-delete", (ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Equipment toggle (équiper/déséquiper)
    html.on("change", ".equipment-toggle", this._onEquipmentToggle.bind(this));

    // Active Effect management
    html.on("click", ".effect-control", (ev) => {
      const row = ev.currentTarget.closest("li");
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on("click", ".rollable", this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      console.log("Roll dataset:", dataset);
      let label = dataset.label ? `${dataset.label}` : "";

      // Créer le jet avec les données de l'acteur
      const rollData = this.actor.getRollData();
      console.log("Roll data:", rollData);

      let roll = new Roll(dataset.roll, rollData);
      console.log("Roll created:", roll, "Formula:", roll.formula);

      // Pour les jets de caractéristiques (d100), on compare avec la valeur de la stat
      if (dataset.roll === "1d100" && dataset.ability) {
        console.log("D100 roll detected, ability:", dataset.ability);

        // Évaluer le jet de dés d'abord
        await roll.evaluate();
        console.log("Roll evaluated:", roll.total);

        // Utiliser directement la clé d'ability du dataset
        const abilityKey = dataset.ability;
        console.log("Ability key:", abilityKey);
        console.log(
          "Available abilities:",
          Object.keys(this.actor.system.abilities)
        );

        if (abilityKey && this.actor.system.abilities[abilityKey]) {
          const baseAbilityValue =
            this.actor.system.abilities[abilityKey].value;
          const modifiedAbilityValue = this.actor.system.getStatBonus(
            abilityKey,
            baseAbilityValue
          );
          console.log("Base ability value:", baseAbilityValue);
          console.log("Modified ability value:", modifiedAbilityValue);

          const result = roll.total;
          console.log("Roll result:", result);
          const success = result <= modifiedAbilityValue;

          const successText = success
            ? `<span style="color: green; font-weight: bold;">SUCCÈS</span>`
            : `<span style="color: red; font-weight: bold;">ÉCHEC</span>`;

          let flavorText = `
            <div style="text-align: center;">
              <strong>${label}</strong> (Seuil: ${modifiedAbilityValue}`;

          // Afficher les détails du calcul si des bonus/malus sont appliqués
          if (baseAbilityValue !== modifiedAbilityValue) {
            flavorText += ` = ${baseAbilityValue} base + bonus`;
          }

          flavorText += `)<br/>
              Résultat: ${result} ${successText}
            </div>
          `;

          roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: flavorText,
            rollMode: game.settings.get("core", "rollMode"),
          });

          return roll;
        } else {
          console.warn("Ability not found for key:", abilityKey);
        }
      }

      // Jets standards
      if (!roll.total) await roll.evaluate();
      console.log("Standard roll result:", roll.total);

      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode"),
      });
      return roll;
    }
  }

  /**
   * Handle toggling equipment on/off
   * @param {Event} event
   * @private
   */
  async _onEquipmentToggle(event) {
    event.preventDefault();
    const checkbox = event.currentTarget;
    const itemId = checkbox.dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (item) {
      await item.update({ "system.equipped": checkbox.checked });
      this.render(false); // Re-render to update bonuses display
    }
  }
}
