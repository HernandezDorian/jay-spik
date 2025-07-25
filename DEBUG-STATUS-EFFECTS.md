# Debug et Test - Status Effects JaySpik

## 🔧 Correction apportée

### Problème identifié

```
TypeError: Cannot read properties of undefined (reading 'find')
```

### Cause

- `token.document.statuses` était undefined
- L'API `token.toggleEffect()` n'était pas correcte

### Solution appliquée

- Vérification de `token.document` avant utilisation
- Gestion correcte des statuses avec Set/Array
- Utilisation de `token.document.update({ statuses: ... })`

## 🧪 Test étape par étape

### 1. Vérifier la configuration

Console F12 :

```javascript
// Vérifier que les status effects sont enregistrés
console.log(
  "Status effects JaySpik:",
  CONFIG.statusEffects.filter((s) => s.id.startsWith("jayspik-"))
);

// Vérifier la configuration des statuts
console.log("Config statuts:", CONFIG.JAY_SPIK.statuses);
```

### 2. Test de base

1. **Créer/ouvrir un personnage**
2. **Placer le token sur une scène**
3. **Ouvrir la fiche** → Section "Statut"
4. **Sélectionner "Défensif"**
5. **Vérifier sur le token** : icône bouclier doit apparaître

### 3. Test de changement

1. **Changer pour "Agressif"** → icône épée
2. **Changer pour "Aucun"** → icône disparaît

### 4. Debug si ça ne marche pas

Console F12 :

```javascript
// Obtenir un acteur de test
let actor = game.actors.getName("Nom du personnage");

// Vérifier son statut actuel
console.log("Statut actuel:", actor.system.status);

// Obtenir ses tokens
let tokens = actor.getActiveTokens(true);
console.log("Tokens:", tokens);

// Vérifier les statuses d'un token
if (tokens.length > 0) {
  console.log("Statuses du token:", tokens[0].document.statuses);
}

// Forcer la mise à jour
updateTokenStatusEffects(actor, "defensive");
```

### 5. Test manuel des fonctions

Console F12 :

```javascript
// Test direct des fonctions
let token = canvas.tokens.controlled[0]; // Sélectionner un token d'abord

// Ajouter un status effect
await addTokenStatusEffect(token, "defensive");

// Vérifier qu'il apparaît
console.log("Statuses après ajout:", token.document.statuses);

// Supprimer les status effects
await removeTokenStatusEffect(token);
console.log("Statuses après suppression:", token.document.statuses);
```

## 🎯 Résultats attendus

### ✅ Fonctionnement correct

- Sélection d'un statut → Icône apparaît sur le token
- Changement de statut → Icône change
- Statut "Aucun" → Icône disparaît
- Aucune erreur dans la console

### ❌ Si ça ne marche toujours pas

1. **Vérifier version FoundryVTT** (v11+ requis)
2. **Redémarrer le monde** après modifications
3. **Vérifier que les status effects sont activés** dans les paramètres
4. **Tester avec un token fraîchement placé**

## 🚨 En cas d'erreur persistante

### Vérifications à faire

1. Les fonctions `updateTokenStatusEffects`, `addTokenStatusEffect`, `removeTokenStatusEffect` existent-elles ?
2. `CONFIG.JAY_SPIK.statuses` est-il défini ?
3. Les status effects sont-ils enregistrés dans `CONFIG.statusEffects` ?

### Solutions de secours

- Désactiver temporairement d'autres modules
- Vérifier les logs de FoundryVTT
- Tester avec un personnage/token nouvellement créé
