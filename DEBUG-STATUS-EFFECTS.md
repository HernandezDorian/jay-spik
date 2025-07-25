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

## 🚨 NOUVEAU PROBLÈME IDENTIFIÉ - Joueurs vs GM

### Symptômes observés

- Les doublons apparaissent **plus fréquemment** quand un **joueur** fait des changements rapides
- Le GM semble moins affecté par ce problème
- Les logs montrent une différence de timing entre joueurs et GM

### Causes probables

1. **Permissions différentes**

   - Les joueurs n'ont pas toujours les permissions pour modifier les ActiveEffect
   - FoundryVTT peut créer des conditions de course lors des vérifications

2. **Latence réseau**

   - Les changements des joueurs transitent par le serveur
   - Délais de synchronisation plus longs entre client/serveur

3. **Hooks multiples**
   - FoundryVTT peut déclencher des hooks supplémentaires pour les actions de joueurs
   - Validation/autorisation supplémentaire côté serveur

### Solutions développées

#### 1. Correctif temporaire : `CORRECTIF-JOUEURS-GM.js`

- Détection automatique joueur/GM
- Délais adaptés selon le type d'utilisateur
- Système de délégation au GM pour les joueurs sans permissions
- Monitoring en temps réel des changements

#### 2. Tests spécialisés : `TEST-JOUEURS-GM.js`

- Test des permissions par acteur
- Mesure du timing des changements
- Comparaison joueur vs GM
- Test de changements multiples

#### 3. Guide de résolution : `GUIDE-RESOLUTION-JOUEURS-GM.md`

- Procédures de test détaillées
- Analyse des causes
- Solutions étape par étape

### Actions recommandées

1. **Charger le correctif temporaire** dans la console
2. **Tester avec un compte joueur** vs compte GM
3. **Observer les logs [MONITOR]** pour identifier les patterns
4. **Utiliser `window.emergencyCleanup()`** si doublons détectés

### Logs à surveiller

```
JaySpik: [MONITOR] JOUEUR xyz change ActorName -> defensive
✅ [MONITOR] OK après changement JOUEUR - 1 effet(s)
```

Si vous voyez:

```
🚨 [MONITOR] DOUBLON DÉTECTÉ après changement JOUEUR! 2 effets
```

C'est confirmation du problème joueur/GM.
