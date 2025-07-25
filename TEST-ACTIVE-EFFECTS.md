# Test Active Effects - Système JaySpik

## 🔄 Nouvelle approche : Active Effects

### Changement d'approche

- **AVANT** : Tentative de manipulation directe des status effects
- **MAINTENANT** : Utilisation des Active Effects comme les "Temporary Effects"

### Pourquoi ça marche maintenant

- ✅ **Active Effects avec `transfer: true`** → S'affichent automatiquement sur les tokens
- ✅ **Flag `core.statusId`** → Identifiant pour FoundryVTT
- ✅ **Même mécanisme que les Temporary Effects** → Compatible natif

## 🧪 Test étape par étape

### 1. Redémarrer le monde FoundryVTT

**IMPORTANT** : Redémarrez complètement le monde après les modifications

### 2. Test basique

1. **Créer/ouvrir un personnage**
2. **Placer le token sur une scène**
3. **Ouvrir la fiche** → Section "Statut"
4. **Sélectionner "Défensif"**
5. **Vérifier** :
   - Onglet "Effets" de la fiche → Un effet "Défensif" doit apparaître
   - **Token** → Une icône bouclier doit s'afficher

### 3. Comparaison avec Temporary Effects

Pour vérifier que ça fonctionne comme attendu :

1. **Test de référence** :

   - Ajouter un "Temporary Effect" standard à votre personnage
   - Observer comment l'icône s'affiche sur le token

2. **Test de notre système** :
   - Sélectionner un statut JaySpik
   - L'icône doit s'afficher de la même manière

### 4. Debug console

Console F12 :

```javascript
// Vérifier qu'un acteur a bien l'effet
let actor = game.actors.getName("Nom du personnage");
console.log(
  "Effets actifs:",
  actor.effects.map((e) => ({
    name: e.name,
    icon: e.icon,
    transfer: e.transfer,
    flags: e.flags,
  }))
);

// Forcer la création d'un effet de test
await createStatusActiveEffect(actor, "defensive");
```

### 5. Vérifications importantes

#### ✅ Dans la fiche personnage

- Onglet "Effets" → Effet visible avec le bon nom et icône

#### ✅ Sur le token

- Icône visible en bas du token (comme les Temporary Effects)

#### ✅ Propriétés de l'effet

- `transfer: true`
- `flags.core.statusId` défini
- `flags.jaySpik.isStatusEffect: true`

## 🎯 Test de changement de statut

1. **Statut "Défensif"** → Icône bouclier
2. **Changer pour "Agressif"** → Icône épée (l'ancienne disparaît)
3. **Changer pour "Aucun"** → Toutes les icônes disparaissent

## 🚨 Si ça ne marche toujours pas

### Vérifications

1. **Version FoundryVTT** : v11+ recommandé
2. **Redémarrage complet** du monde
3. **Active Effects activés** dans les paramètres du système

### Debug avancé

Console F12 :

```javascript
// Vérifier la configuration
console.log("CONFIG.JAY_SPIK:", CONFIG.JAY_SPIK);

// Tester manuellement
let actor = game.actors.getName("Nom du personnage");
await updateStatusActiveEffect(actor, "defensive");

// Vérifier les tokens
let tokens = actor.getActiveTokens();
console.log("Tokens de l'acteur:", tokens);
tokens.forEach((t) => console.log("Token effects:", t.document.effects));
```

## 🎉 Résultat attendu

Exactement comme les "Temporary Effects" de FoundryVTT :

- ✅ **Icône visible sur le token**
- ✅ **Effet visible dans la fiche**
- ✅ **Changement automatique** lors de la sélection
- ✅ **Suppression automatique** quand "Aucun" est sélectionné
- ✅ **Aucun effet sur les statistiques**
