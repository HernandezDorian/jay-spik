# Test Temporary Effects - JaySpik

## ✅ Correction : Vrai Temporary Effect

### Problème identifié

- **AVANT** : Active Effect passif (ne s'affiche pas sur token)
- **MAINTENANT** : Temporary Effect avec les bonnes propriétés

### Propriétés d'un Temporary Effect

- ✅ `statuses: ["jayspik-{statusKey}"]` → Identifiant status
- ✅ `origin: actor.uuid` → Origine de l'effet
- ✅ `duration` définie (même vide) → Marque comme temporaire
- ✅ `transfer: true` → Transféré aux tokens

## 🧪 Test du Temporary Effect

### 1. Redémarrer le monde

**OBLIGATOIRE** après la modification du code

### 2. Test principal

1. **Ouvrir une fiche de personnage**
2. **Sélectionner un statut** (ex: "Défensif")
3. **Vérifier dans la fiche** :
   - Onglet "Effets" → Effet "Défensif" visible
   - L'effet doit avoir une icône
4. **Vérifier sur le token** :
   - **Icône doit maintenant apparaître** en bas du token

### 3. Comparaison directe

Pour être sûr que ça marche :

1. **Ajouter un Temporary Effect standard** :

   - Clic droit sur token → "Configurer" → Onglet "Effets"
   - Ajouter un effet temporaire standard
   - Observer l'icône sur le token

2. **Tester notre système** :
   - Sélectionner un statut JaySpik
   - L'icône doit apparaître de la même façon

### 4. Debug console

Console F12 pour vérifier les propriétés :

```javascript
let actor = game.actors.getName("Nom du personnage");

// Vérifier les effets
actor.effects.forEach((e) => {
  console.log("Effet:", e.name);
  console.log("- transfer:", e.transfer);
  console.log("- statuses:", e.statuses);
  console.log("- origin:", e.origin);
  console.log("- duration:", e.duration);
});

// Test manuel
await createStatusActiveEffect(actor, "defensive");
```

### 5. Test complet des statuts

- **"Défensif"** → Icône bouclier
- **"Agressif"** → Icône épée
- **"Concentré"** → Icône œil
- **"Furtif"** → Icône ninja
- **"Berserk"** → Icône flamme
- **"Aucun"** → Toutes icônes disparaissent

## ✅ Résultat attendu

Maintenant que c'est un vrai Temporary Effect :

- ✅ **Icône visible sur token** (comme tout Temporary Effect)
- ✅ **Effet dans la fiche** avec icône et nom
- ✅ **Changement automatique** lors de sélection
- ✅ **Pas d'effet sur les stats** (changes = [])

## 🚨 Si ça ne marche ENCORE pas

### Debug avancé

Console F12 :

```javascript
// Créer un effet de test et vérifier ses propriétés
let actor = game.actors.getName("Nom du personnage");
await createStatusActiveEffect(actor, "defensive");

// Comparer avec un Temporary Effect standard
let effect = actor.effects.find((e) => e.name === "Défensif");
console.log("Notre effet:", {
  name: effect.name,
  transfer: effect.transfer,
  statuses: effect.statuses,
  origin: effect.origin,
  duration: effect.duration,
  flags: effect.flags,
});
```

### Vérifications système

1. **Version FoundryVTT** v11+ recommandé
2. **Temporary Effects activés** dans les paramètres
3. **Aucun module conflictuel** désactivé temporairement
4. **Cache du navigateur vidé** (Ctrl+Shift+R)

Le système devrait maintenant créer de vrais Temporary Effects qui s'affichent sur les tokens !
