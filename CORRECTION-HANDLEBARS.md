# Correction erreur Handlebars - 25 juillet 2025

## Problème résolu

**Erreur** : `c.lookupProperty is not a function`  
**Cause** : Syntaxe incorrecte du helper Handlebars `lookup` dans les templates

L'erreur se produisait lors de l'ouverture des fiches d'acteurs à cause de l'utilisation d'une syntaxe invalide :

```handlebars
{{lookup config.statuses system.status "icon"}}
```

## Corrections apportées

### 1. Templates - Correction syntaxe Handlebars

**Fichiers corrigés** :

- `templates/actor/actor-character-sheet.hbs`
- `templates/actor/actor-npc-sheet.hbs`

**Avant** (syntaxe incorrecte) :

```handlebars
<i
  class="{{lookup config.statuses system.status 'icon'}}"
  style="color: {{lookup config.statuses system.status 'color'}}"
></i>
<span class="status-label">{{lookup
    config.statuses
    system.status
    "label"
  }}</span>
```

**Après** (syntaxe correcte) :

```handlebars
{{#with (lookup config.statuses system.status) as |currentStatus|}}
  <i class="{{currentStatus.icon}}" style="color: {{currentStatus.color}}"></i>
  <span class="status-label">{{currentStatus.label}}</span>
{{/with}}
```

### 2. Logique de données - Unification

**Fichier** : `module/sheets/actor-sheet.mjs`

**Problème** : Les `statusDescriptions` n'étaient disponibles que pour les personnages, pas pour les NPCs.

**Solution** : Déplacé la logique de préparation des descriptions de statuts dans la méthode `getData()` principale pour que tous les types d'acteurs y aient accès.

**Avant** :

```javascript
// Dans _prepareCharacterData() seulement
context.statusDescriptions = { ... };
```

**Après** :

```javascript
// Dans getData() pour tous les acteurs
context.statusDescriptions = {};
if (CONFIG.JAY_SPIK?.statuses) {
  for (const [key, status] of Object.entries(CONFIG.JAY_SPIK.statuses)) {
    if (key !== "none") {
      context.statusDescriptions[key] = status.description || "";
    }
  }
}
```

### 3. Correction des options de statuts

**Problème** : Référence à une option vide `""` au lieu de `"none"`

**Correction** : Suppression de l'option manuelle vide, utilisation de la liste dynamique qui inclut déjà "none"

## Syntaxe Handlebars utilisée

### ✅ Syntaxe correcte avec `lookup` et `with`

```handlebars
{{#with (lookup config.statuses system.status) as |currentStatus|}}
  {{currentStatus.icon}}
  {{currentStatus.label}}
  {{currentStatus.color}}
{{/with}}
```

### ✅ Syntaxe correcte avec `lookup` simple

```handlebars
{{lookup @root.config.abilities key}}
{{lookup @root.statusDescriptions key}}
```

### ❌ Syntaxe incorrecte (cause de l'erreur)

```handlebars
{{lookup config.statuses system.status "icon"}}
```

## Résultat

✅ **Fiches d'acteurs** : S'ouvrent sans erreur  
✅ **Personnages** : Affichage des statuts fonctionnel  
✅ **NPCs** : Affichage des statuts fonctionnel  
✅ **Templates** : Syntaxe Handlebars correcte partout  
✅ **Données** : Context unifié entre tous les types d'acteurs

Le système est maintenant entièrement opérationnel et les fiches s'ouvrent correctement !
