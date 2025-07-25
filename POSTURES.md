# Système de Postures - JaySpik

## Vue d'ensemble

Le système de postures permet aux personnages d'adopter différentes postures de combat qui modifient leurs capacités via des effets temporaires.

## Fonctionnalités

### Postures disponibles par défaut

1. **Aucun** (défaut) - Aucun effet actif
2. **Offensif** - Augmente les dégâts, réduit la défense
3. **Défensif** - Augmente la défense, réduit les dégâts
4. **Concentration** - Améliore les capacités mentales et magiques

### Comportement

- Un seul effet de posture actif à la fois
- Changement de posture supprime automatiquement l'ancien effet
- La posture "Aucun" peut être sélectionnée pour retirer tous les effets
- Les effets apparaissent dans l'onglet "Effets" de la fiche

## Configuration

### Fichier de configuration

Les postures sont définies dans `module/config/postures-config.mjs` :

```javascript
export const POSTURES_CONFIG = {
  none: {
    label: "Aucun",
    description: "Aucune posture active",
    icon: "fas fa-circle",
    color: "#666666",
    isDefault: true,
  },

  offensive: {
    label: "Offensif",
    description:
      "Posture offensive - Augmente les dégâts mais réduit la défense",
    icon: "fas fa-sword",
    color: "#ff4444",
    effects: {
      damage: 10,
      defense: -5,
    },
  },
  // ... autres postures
};
```

### Ajouter une nouvelle posture

1. Ajouter une entrée dans `POSTURES_CONFIG`
2. Définir le label, description, icône et effets
3. Le système se mettra automatiquement à jour

### Propriétés configurables

- `label` : Nom affiché
- `description` : Description de l'effet
- `icon` : Icône FontAwesome
- `color` : Couleur associée (optionnel)
- `isDefault` : Marque cette posture comme défaut
- `effects` : Objet des modifications apportées

### Types d'effets

Les effets peuvent modifier :

- Les statistiques de base (`mental`, `physique`, `social`)
- Des propriétés spéciales (`damage`, `defense`, `spellPower`)

## Utilisation

### Interface utilisateur

1. Aller sur l'onglet "Fiche" du personnage
2. Utiliser le menu déroulant "Posture actuelle"
3. Sélectionner la posture désirée
4. L'effet apparaît automatiquement dans l'onglet "Effets"

### API

```javascript
// Changer la posture d'un acteur
await actor.system.changePosture("offensive");

// Supprimer la posture actuelle
await actor.system.changePosture("none");

// Récupérer la configuration d'une posture
import { getPostureConfig } from "./module/config/postures-config.mjs";
const config = getPostureConfig("defensive");
```

## Fichiers modifiés

- `module/config/postures-config.mjs` - Configuration des postures
- `module/data/actor-character.mjs` - Logique métier
- `module/sheets/actor-sheet.mjs` - Interface utilisateur
- `templates/actor/actor-character-sheet.hbs` - Template HTML
- `css/jay-spik.css` - Styles
- `lang/fr.json` - Traductions

## Extensibilité

Le système est conçu pour être facilement extensible :

1. **Nouvelles postures** : Ajouter dans `POSTURES_CONFIG`
2. **Nouveaux effets** : Modifier la logique dans `createPostureEffect`
3. **Interface** : Modifier le template Handlebars
4. **Styles** : Ajouter du CSS personnalisé

## Notes techniques

- Les effets de posture utilisent le système d'Active Effects de Foundry
- Flag `jayspik.isPosture = true` pour identifier les effets de posture
- Suppression automatique des anciens effets lors du changement
- Compatible avec le système de bonus d'équipement existant
