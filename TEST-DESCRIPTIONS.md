# Test des Descriptions - Temporary Effects JaySpik

## ✅ Ajout des descriptions

### Modification apportée

- **Ajout** : `description: statusConfig.description` dans l'effet
- **Résultat** : Les joueurs peuvent maintenant lire la description du statut

## 🧪 Test des descriptions

### 1. Test principal

1. **Ouvrir une fiche de personnage**
2. **Sélectionner un statut** (ex: "Défensif")
3. **Aller dans l'onglet "Effets"** de la fiche
4. **Cliquer sur l'effet** "Défensif"
5. **Vérifier** : La description doit s'afficher dans la fenêtre de l'effet

### 2. Descriptions configurées

Selon la configuration actuelle :

| Statut    | Description attendue                                                |
| --------- | ------------------------------------------------------------------- |
| Défensif  | "Le personnage adopte une posture défensive"                        |
| Agressif  | "Le personnage attaque sans retenue"                                |
| Concentré | "Le personnage se concentre profondément"                           |
| Furtif    | "Le personnage se déplace dans l'ombre, privilégiant la discrétion" |
| Berserk   | "Le personnage entre dans une rage incontrôlable"                   |

### 3. Test complet

Pour chaque statut :

1. **Sélectionner le statut**
2. **Ouvrir l'effet** dans l'onglet "Effets"
3. **Vérifier** que la description correspond

### 4. Visibilité pour les joueurs

- ✅ **Propriétaires du personnage** : Peuvent voir la description
- ✅ **MJ** : Peut voir toutes les descriptions
- ✅ **Autres joueurs** : Selon les permissions FoundryVTT

## 🔍 Debug si nécessaire

Console F12 pour vérifier :

```javascript
// Créer un effet et vérifier sa description
let actor = game.actors.getName("Nom du personnage");
await createStatusActiveEffect(actor, "defensive");

// Vérifier que la description est bien présente
let effect = actor.effects.find((e) => e.name === "Défensif");
console.log("Effet avec description:", {
  name: effect.name,
  description: effect.description,
  icon: effect.icon,
});
```

## 📝 Personnalisation des descriptions

Pour modifier les descriptions, éditer le fichier :
`module/config/status-config.mjs`

Exemple :

```javascript
defensive: {
  label: "Défensif",
  description: "Votre nouvelle description personnalisée",
  icon: "fas fa-shield-alt",
  color: "#2196f3",
},
```

## 🎯 Résultat attendu

Maintenant quand un joueur :

1. **Sélectionne un statut** → Temporary Effect créé avec description
2. **Clique sur l'effet** → Peut lire la description du statut
3. **Survole l'icône** sur le token → Peut voir le nom de l'effet

Les descriptions aident les joueurs à comprendre ce que représente chaque statut visuel ! 🎉
