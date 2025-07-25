# Système d'effets de statuts natifs - 25 juillet 2025

## Nouvelle fonctionnalité implémentée

✅ **Icônes de statuts sur les tokens** : Les statuts s'affichent maintenant comme les vrais effets temporaires de FoundryVTT !

## Modifications apportées

### 1. Remplacement du système de tokens personnalisé

**Avant** : Icônes CSS ajoutées manuellement sur les tokens  
**Maintenant** : Effets natifs FoundryVTT avec icônes intégrées

### 2. Nouvelles fonctions principales

**Fichier** : `module/jay-spik.mjs`

```javascript
// Gestion automatique des effets de statut
async function updateStatusEffects(actor, newStatus)
async function removeExistingStatusEffect(actor)
async function createStatusEffect(actor, statusKey)
function convertFontAwesomeToPath(fontAwesomeClass)
```

### 3. Stats supplémentaires ajoutées

**Fichier** : `module/config/stats-config.mjs`

Nouvelles stats pour supporter tous les effets de statuts :

- **Agilité** : Rapidité, dextérité, réflexes, esquive
- **Attaque** : Capacité offensive, précision au combat
- **Défense** : Capacité défensive, résistance aux dégâts

### 4. Mapping des icônes FontAwesome vers FoundryVTT

```javascript
const iconMapping = {
  "fas fa-shield-alt": "icons/svg/shield.svg", // Défensif
  "fas fa-sword": "icons/svg/sword.svg", // Agressif
  "fas fa-brain": "icons/svg/eye.svg", // Concentré
  "fas fa-user-ninja": "icons/svg/mystery-man.svg", // Furtif
  "fas fa-fire": "icons/svg/fire.svg", // Berserk
};
```

### 5. Gestion automatique

- **Changement de statut** → Effet automatiquement créé/supprimé
- **Démarrage du système** → Effets recréés pour les acteurs existants
- **Suppression propre** → Ancien effet supprimé avant création du nouveau

## Comment ça fonctionne

### 📝 **Sélection du statut**

1. Ouvrir la fiche d'un personnage/PNJ
2. Sélectionner un statut dans la liste déroulante
3. L'effet apparaît automatiquement dans l'onglet "Effets"

### 🎯 **Affichage sur le token**

1. L'icône du statut s'affiche sur le token (comme les effets temporaires)
2. Survol = tooltip avec nom et description
3. Clic droit sur l'effet = options standard FoundryVTT

### 📊 **Application des bonus**

1. Les modifications de stats sont appliquées automatiquement
2. Visible dans l'onglet "Effets" avec détails des changements
3. Les bonus/malus s'additionnent avec les équipements

## Statuts disponibles

| Statut        | Icône | Effets                                             | Description            |
| ------------- | ----- | -------------------------------------------------- | ---------------------- |
| **Défensif**  | 🛡️    | +10 Défense, -5 Attaque                            | Posture défensive      |
| **Agressif**  | ⚔️    | +10 Attaque, -5 Défense                            | Attaque sans retenue   |
| **Concentré** | 🧠    | +15 Mental, -10 Physique                           | Concentration profonde |
| **Furtif**    | 🥷    | +10 Agilité, +5 Social, -5 Physique                | Déplacement furtif     |
| **Berserk**   | 🔥    | +20 Physique, +15 Attaque, -15 Défense, -10 Mental | Rage incontrôlable     |

## Avantages du nouveau système

✅ **Intégration native** : Utilise le système d'effets de FoundryVTT  
✅ **Affichage standard** : Icônes sur tokens comme tous les autres effets  
✅ **Gestion automatique** : Pas besoin d'intervention manuelle  
✅ **Compatibilité** : Fonctionne avec les modules d'effets existants  
✅ **Persistence** : Les effets sont sauvegardés avec le personnage  
✅ **Synchronisation** : Visible par tous les joueurs en temps réel

## Test recommandé

1. **Créer/ouvrir** un personnage ou PNJ
2. **Sélectionner** un statut dans la fiche
3. **Vérifier** que l'effet apparaît dans l'onglet "Effets"
4. **Observer** l'icône sur le token de l'acteur
5. **Tester** le changement/suppression de statut

Le système d'icônes de statuts est maintenant entièrement intégré à FoundryVTT ! 🎉
