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
    // Use deep clone to avoid reference issues
    context.system = foundry.utils.deepClone(actorData.system);
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

    // S'assurer que le champ skills existe pour les personnages existants
    if (!context.system.skills) {
      context.system.skills = [];
    }

    // Préparer les données du jet personnalisé (depuis les flags)
    context.customRoll = {
      stat: this.actor.getFlag("jay-spik", "customRoll.stat") || "physique",
      bonus: this.actor.getFlag("jay-spik", "customRoll.bonus") || 0,
    };
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

    // Item damage rolls
    html.on("click", ".item-roll-damage", this._onItemDamageRoll.bind(this));

    // Skills management
    html.on("click", ".add-skill", this._onAddSkill.bind(this));
    html.on("click", ".skill-delete", this._onDeleteSkill.bind(this));
    html.on("click", ".skill-roll", this._onSkillRoll.bind(this));

    // Custom roll
    html.on("click", ".custom-roll", this._onCustomRoll.bind(this));

    // Custom roll value persistence
    html.on(
      "change",
      "#custom-roll-stat",
      this._onCustomRollStatChange.bind(this)
    );
    html.on(
      "change",
      "#custom-roll-bonus",
      this._onCustomRollBonusChange.bind(this)
    );

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
    let name = `New ${type.capitalize()}`;

    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };

    // Special handling for equipment types
    if (type === "equipment") {
      const equipmentType = header.dataset.equipmentType || "weapon";
      itemData.system.equipmentType = equipmentType;

      // Set default names based on equipment type
      switch (equipmentType) {
        case "weapon":
          name = "Nouvelle Arme";
          itemData.system.damageFormula = "1d4+2";
          break;
        case "armor":
          name = "Nouvelle Armure";
          itemData.system.effects = { armor: 1 };
          break;
        case "accessory":
          name = "Nouvel Accessoire";
          break;
      }
      itemData.name = name;
    }

    // Remove the type and equipmentType from the dataset since they're set separately
    delete itemData.system["type"];
    delete itemData.system["equipmentType"];

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

  /**
   * Handle rolling damage for an item (weapon or spell)
   * @param {Event} event
   * @private
   */
  async _onItemDamageRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (!item || !item.system.damageFormula) {
      ui.notifications.warn("Aucune formule de dégâts définie pour cet objet.");
      return;
    }

    // Préparer la formule avec les données de l'acteur
    let formula = item.system.damageFormula;
    const rollData = this.actor.getRollData();

    // Remplacer les références aux stats (@statname) par les valeurs modifiées
    for (const [key, ability] of Object.entries(this.actor.system.abilities)) {
      const modifiedValue = this.actor.system.getStatBonus(
        key,
        ability.value || 0
      );
      formula = formula.replace(new RegExp(`@${key}`, "g"), modifiedValue);
    }

    // Créer et exécuter le roll
    const roll = new Roll(formula, rollData);
    await roll.evaluate();

    // Obtenir les cibles actuelles
    const targets = Array.from(game.user.targets);

    if (targets.length === 0) {
      // Pas de cibles : affichage simple dans le chat
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `<strong>${item.name}</strong> - Dégâts`,
        rollMode: game.settings.get("core", "rollMode"),
      });
      ui.notifications.info(
        "Aucune cible sélectionnée. Sélectionnez une cible pour appliquer automatiquement les dégâts."
      );
      return;
    }

    // Appliquer les dégâts aux cibles
    await this._applyDamageToTargets(roll, item, targets);
  }

  /**
   * Apply damage to targeted actors, accounting for armor
   * @param {Roll} roll - The damage roll
   * @param {Item} item - The weapon/spell used
   * @param {Array} targets - Array of targeted tokens
   * @private
   */
  async _applyDamageToTargets(roll, item, targets) {
    const totalDamage = roll.total;
    const armorPiercing = item.system.armorPiercing || false;

    console.log("_applyDamageToTargets appelé:", {
      totalDamage,
      armorPiercing,
      targets: targets.length,
    });

    try {
      // Si on est GM, on applique directement
      if (game.user.isGM) {
        console.log("GM applique directement les dégâts");
        return await this._applyDamageDirectly(roll, item, targets);
      }

      // Pour les joueurs, créer un message de chat avec boutons d'application
      console.log("Joueur crée un message de chat avec boutons de dégâts");
      await this._createDamageMessageWithButtons(roll, item, targets);
    } catch (error) {
      console.error("Erreur lors de l'application des dégâts:", error);
      ui.notifications.error(
        `Erreur lors de l'application des dégâts: ${error.message}`
      );

      // Afficher quand même le roll sans appliquer les dégâts
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `<strong>${item.name}</strong> - Dégâts (Non appliqués: ${error.message})`,
        rollMode: game.settings.get("core", "rollMode"),
      });
    }
  }

  /**
   * Apply damage directly (for GM) - version simplifiée sans socket
   * @param {Roll} roll - The damage roll
   * @param {Item} item - The weapon/spell used
   * @param {Array} targets - Array of targeted tokens
   * @private
   */
  async _applyDamageDirectly(roll, item, targets) {
    const totalDamage = roll.total;
    const armorPiercing = item.system.armorPiercing || false;
    const results = [];

    console.log("Application directe des dégâts par le GM");

    for (const target of targets) {
      try {
        if (!target.actor) {
          console.warn("Token sans acteur:", target.name);
          continue;
        }

        // Utiliser la méthode applyDamage de l'acteur si elle existe
        if (
          target.actor.system &&
          typeof target.actor.system.applyDamage === "function"
        ) {
          console.log(
            `Application des dégâts via applyDamage pour ${target.actor.name}`
          );
          const result = await target.actor.system.applyDamage(
            totalDamage,
            armorPiercing
          );
          result.target = target.actor.name;
          results.push(result);
        } else {
          console.log(
            `Application manuelle des dégâts pour ${target.actor.name}`
          );
          // Méthode manuelle si applyDamage n'existe pas
          const armor = armorPiercing
            ? 0
            : target.actor.system.getTotalArmor
            ? target.actor.system.getTotalArmor()
            : 0;
          const finalDamage = Math.max(0, totalDamage - armor);

          if (finalDamage > 0) {
            const currentHealth = target.actor.system.health.value;
            const newHealth = Math.max(0, currentHealth - finalDamage);

            await target.actor.update({
              "system.health.value": newHealth,
            });

            console.log(
              `Dégâts appliqués à ${target.actor.name}: ${currentHealth} -> ${newHealth}`
            );
          }

          results.push({
            target: target.actor.name,
            damageRolled: totalDamage,
            armor: armor,
            finalDamage: finalDamage,
            blocked: totalDamage - finalDamage,
            armorPiercing: armorPiercing,
          });
        }
      } catch (error) {
        console.error(
          `Erreur lors de l'application des dégâts à ${target.actor?.name}:`,
          error
        );
        results.push({
          target: target.actor?.name || target.name,
          error: error.message,
          damageRolled: totalDamage,
          finalDamage: 0,
          armor: 0,
          blocked: 0,
        });
      }
    }

    // Créer le message de chat avec les résultats
    await this._createDamageMessage(roll, item, results);

    return results;
  }

  /**
   * Create a chat message showing damage results
   * @param {Roll} roll - The damage roll
   * @param {Item} item - The weapon/spell used
   * @param {Array} results - Array of damage results per target
   * @private
   */
  async _createDamageMessage(roll, item, results) {
    let messageContent = `<div class="damage-results">
      <h3><strong>${item.name}</strong> - Dégâts${
      item.system.armorPiercing
        ? ' <span class="armor-piercing-indicator">🗲 Perce-Armure</span>'
        : ""
    }</h3>
      <div class="damage-roll">Dégâts lancés: <strong>${
        roll.total
      }</strong></div>
    `;

    for (const result of results) {
      messageContent += `
        <div class="target-result" style="margin: 5px 0; padding: 5px; border: 1px solid #ccc; border-radius: 3px;">
          <strong>${result.target}</strong><br/>
          ${
            result.armorPiercing
              ? '<span style="color: #ff5722; font-weight: bold;">Armure ignorée (Perce-Armure)</span><br/>'
              : `<span style="color: #666;">Armure: ${result.armor}</span><br/>`
          }
          <span style="color: ${
            result.finalDamage > 0 ? "#d32f2f" : "#4caf50"
          };">
            ${
              result.finalDamage > 0
                ? `${result.finalDamage} dégâts infligés`
                : result.armorPiercing
                ? "Aucun dégât"
                : "Aucun dégât (bloqué par l'armure)"
            }
          </span>
          ${
            result.blocked > 0 && !result.armorPiercing
              ? `<br/><span style="color: #ff9800; font-size: 0.9em;">(${result.blocked} bloqués par l'armure)</span>`
              : ""
          }
        </div>
      `;
    }

    messageContent += "</div>";

    // Afficher le roll et les résultats
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: messageContent,
      rollMode: game.settings.get("core", "rollMode"),
    });
  }

  /**
   * Create a damage message with apply buttons for GM (player version)
   * @param {Roll} roll - The damage roll
   * @param {Item} item - The weapon/spell used
   * @param {Array} targets - Array of targeted tokens
   * @private
   */
  async _createDamageMessageWithButtons(roll, item, targets) {
    const totalDamage = roll.total;
    const armorPiercing = item.system.armorPiercing || false;

    console.log("=== _createDamageMessageWithButtons DEBUG ===");
    console.log("Targets reçus:", targets);
    console.log("Nombre de targets:", targets.length);

    // Préparer les données des cibles avec plus de debugging
    const targetData = targets
      .map((target, index) => {
        console.log(`Target ${index}:`, target);
        console.log(`  target.id: ${target.id}`);
        console.log(`  target.name: ${target.name}`);
        console.log(`  target.actor: ${target.actor}`);
        console.log(`  target.actor?.id: ${target.actor?.id}`);
        console.log(`  target.actor?.name: ${target.actor?.name}`);

        const data = {
          id: target.id,
          name: target.actor?.name || target.name,
          actorId: target.actor?.id,
          armor: target.actor?.system?.getTotalArmor
            ? target.actor.system.getTotalArmor()
            : 0,
        };

        console.log(`  Données préparées:`, data);
        return data;
      })
      .filter((t) => {
        const hasActorId = !!t.actorId;
        console.log(`Target ${t.name} - a un actorId: ${hasActorId}`);
        return hasActorId;
      });

    console.log("Données finales des cibles:", targetData);

    if (targetData.length === 0) {
      ui.notifications.warn("Aucune cible valide trouvée.");
      return;
    }

    // Calculer les dégâts prévisionnels pour chaque cible
    const damagePreview = targetData.map((target) => {
      const armor = armorPiercing ? 0 : target.armor;
      const finalDamage = Math.max(0, totalDamage - armor);
      return {
        ...target,
        armor: armor,
        finalDamage: finalDamage,
        blocked: totalDamage - finalDamage,
      };
    });

    // Créer le contenu HTML avec boutons
    const armorPiercingIcon = armorPiercing ? "🗲" : "";
    let content = `
      <div class="damage-application">
        <h3><strong>${item.name}</strong> ${armorPiercingIcon}</h3>
        <p><strong>Dégâts:</strong> ${totalDamage}</p>
        ${armorPiercing ? "<p><em>Perce-Armure activé</em></p>" : ""}
        
        <div class="targets-preview">
          <h4>Cibles touchées:</h4>
    `;

    damagePreview.forEach((target) => {
      content += `
        <div class="target-damage" style="margin-bottom: 8px; padding: 4px; border: 1px solid #ccc;">
          <strong>${target.name}</strong><br>
          Armure: ${target.armor} | Dégâts finaux: <strong>${
        target.finalDamage
      }</strong>
          ${target.blocked > 0 ? `| Bloqués: ${target.blocked}` : ""}
        </div>
      `;
    });

    content += `
        </div>
        
        <div class="damage-buttons" style="margin-top: 10px;">
          <button type="button" class="apply-damage" data-targets='${JSON.stringify(
            targetData
          )}' data-damage="${totalDamage}" data-armor-piercing="${armorPiercing}" data-item-name="${
      item.name
    }">
            <i class="fas fa-sword"></i> Appliquer les dégâts
          </button>
        </div>
      </div>
    `;

    // Envoyer le message au chat
    const messageData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: content,
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      flags: {
        "jay-spik": {
          type: "damage-application",
          roll: roll.toJSON(),
          targets: targetData,
          damage: totalDamage,
          armorPiercing: armorPiercing,
          itemName: item.name,
        },
      },
    };

    // Afficher aussi le jet de dés
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<strong>${item.name}</strong> - Jet de dégâts ${armorPiercingIcon}`,
      rollMode: game.settings.get("core", "rollMode"),
    });

    // Créer le message avec les boutons
    await ChatMessage.create(messageData);
  }

  /* -------------------------------------------- */
  /*  Skills Management                           */
  /* -------------------------------------------- */

  /**
   * Handle adding a new skill
   * @param {Event} event   The originating click event
   * @private
   */
  async _onAddSkill(event) {
    event.preventDefault();

    const skillData = {
      name: "Nouvelle Compétence",
      baseStat: "physique",
      bonus: 0,
      description: "",
    };

    await this.actor.system.addSkill(skillData);
  }

  /**
   * Handle deleting a skill
   * @param {Event} event   The originating click event
   * @private
   */
  async _onDeleteSkill(event) {
    event.preventDefault();

    const skillId = event.currentTarget.dataset.skillId;
    const skill = this.actor.system.skills.find((s) => s.id === skillId);

    if (!skill) {
      ui.notifications.error("Compétence non trouvée");
      return;
    }

    // Demander confirmation
    const confirmed = await Dialog.confirm({
      title: "Supprimer la compétence",
      content: `<p>Êtes-vous sûr de vouloir supprimer la compétence <strong>${skill.name}</strong> ?</p>`,
      yes: () => true,
      no: () => false,
      defaultYes: false,
    });

    if (confirmed) {
      await this.actor.system.removeSkill(skillId);
    }
  }

  /**
   * Handle rolling a skill
   * @param {Event} event   The originating click event
   * @private
   */
  async _onSkillRoll(event) {
    event.preventDefault();

    const skillId = event.currentTarget.dataset.skillId;
    const skill = this.actor.system.skills.find((s) => s.id === skillId);

    if (!skill) {
      ui.notifications.error("Compétence non trouvée");
      return;
    }

    // Effectuer le jet de compétence
    await this.actor.system.rollSkill(skillId);
  }

  /**
   * Handle custom roll
   * @param {Event} event   The originating click event
   * @private
   */
  async _onCustomRoll(event) {
    event.preventDefault();

    // Récupérer les valeurs du formulaire
    const form = event.currentTarget.closest(".custom-roll-section");
    const statSelect = form.querySelector("#custom-roll-stat");
    const bonusInput = form.querySelector("#custom-roll-bonus");

    const selectedStat = statSelect.value;
    const bonus = parseInt(bonusInput.value) || 0;

    // Vérifier que la stat existe
    if (!selectedStat || !this.actor.system.abilities[selectedStat]) {
      ui.notifications.error("Caractéristique non valide");
      return;
    }

    // Récupérer la valeur de base de la stat (avec bonus d'équipement si applicable)
    const baseValue = this.actor.system.abilities[selectedStat].value || 0;
    const modifiedValue = this.actor.system.getStatBonus
      ? this.actor.system.getStatBonus(selectedStat, baseValue)
      : baseValue;

    // Calculer le seuil de réussite
    const threshold = modifiedValue + bonus;

    // Effectuer le jet de dé
    const roll = new Roll("1d100");
    await roll.evaluate();

    // Déterminer le résultat
    const isSuccess = roll.total <= threshold;
    const margin = threshold - roll.total;

    // Récupérer le nom de la stat depuis la config
    const statLabel = CONFIG.JAY_SPIK.abilities[selectedStat] || selectedStat;

    // Préparer le message de chat
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Jet personnalisé`,
      content: `
        <div class="custom-roll-result">
          <h3>Jet personnalisé</h3>
          <div class="roll-details">
            <p><strong>Caractéristique:</strong> ${statLabel} (${baseValue}${
        modifiedValue !== baseValue ? ` → ${modifiedValue}` : ""
      })</p>
            ${
              bonus !== 0
                ? `<p><strong>Modification:</strong> ${
                    bonus >= 0 ? "+" : ""
                  }${bonus}</p>`
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
          </div>
        </div>
      `,
      rolls: [roll],
    };

    // Envoyer le message
    await ChatMessage.create(messageData);

    // Log pour debug
    console.log(
      `Jet personnalisé - ${statLabel}: ${roll.total} vs ${threshold} = ${
        isSuccess ? "Réussite" : "Échec"
      }`
    );
  }

  /**
   * Handle custom roll stat selection change
   * @param {Event} event   The originating change event
   * @private
   */
  async _onCustomRollStatChange(event) {
    event.preventDefault();
    const selectedStat = event.currentTarget.value;

    // Sauvegarder la valeur dans les flags de l'acteur
    await this.actor.setFlag("jay-spik", "customRoll.stat", selectedStat);
  }

  /**
   * Handle custom roll bonus change
   * @param {Event} event   The originating change event
   * @private
   */
  async _onCustomRollBonusChange(event) {
    event.preventDefault();
    const bonus = parseInt(event.currentTarget.value) || 0;

    // Sauvegarder la valeur dans les flags de l'acteur
    await this.actor.setFlag("jay-spik", "customRoll.bonus", bonus);
  }

  /**
   * Handle custom roll
   * @param {Event} event   The originating click event
   * @private
   */
  async _onCustomRoll(event) {
    event.preventDefault();

    // Récupérer les valeurs du formulaire
    const form = event.currentTarget.closest(".custom-roll-section");
    const statSelect = form.querySelector("#custom-roll-stat");
    const bonusInput = form.querySelector("#custom-roll-bonus");

    const selectedStat = statSelect.value;
    const bonus = parseInt(bonusInput.value) || 0;

    // Vérifier que la stat existe
    if (!selectedStat || !this.actor.system.abilities[selectedStat]) {
      ui.notifications.error("Caractéristique non valide");
      return;
    }

    // Récupérer la valeur de base de la stat (avec bonus d'équipement si applicable)
    const baseValue = this.actor.system.abilities[selectedStat].value || 0;
    const modifiedValue = this.actor.system.getStatBonus
      ? this.actor.system.getStatBonus(selectedStat, baseValue)
      : baseValue;

    // Calculer le seuil de réussite
    const threshold = modifiedValue + bonus;

    // Effectuer le jet de dé
    const roll = new Roll("1d100");
    await roll.evaluate();

    // Déterminer le résultat
    const isSuccess = roll.total <= threshold;
    const margin = threshold - roll.total;

    // Récupérer le nom de la stat depuis la config
    const statLabel = CONFIG.JAY_SPIK.abilities[selectedStat] || selectedStat;

    // Préparer le message de chat
    const messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `Jet personnalisé`,
      content: `
        <div class="custom-roll-result">
          <h3>Jet personnalisé</h3>
          <div class="roll-details">
            <p><strong>Caractéristique:</strong> ${statLabel} (${baseValue}${
        modifiedValue !== baseValue ? ` → ${modifiedValue}` : ""
      })</p>
            ${
              bonus !== 0
                ? `<p><strong>Modification:</strong> ${
                    bonus >= 0 ? "+" : ""
                  }${bonus}</p>`
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
          </div>
        </div>
      `,
      rolls: [roll],
    };

    // Envoyer le message
    await ChatMessage.create(messageData);

    // Log pour debug
    console.log(
      `Jet personnalisé - ${statLabel}: ${roll.total} vs ${threshold} = ${
        isSuccess ? "Réussite" : "Échec"
      }`
    );
  }
}
