# Test des Status Effects - Système JaySpik

## Fonctionnement

Le système utilise maintenant les **status effects natifs** de FoundryVTT - les petites icônes qui s'affichent directement sur les tokens.

## Comment tester

### 1. Configuration par défaut

- Par défaut, tous les personnages ont le statut "Aucun"
- Aucune icône n'apparaît sur le token

### 2. Sélectionner un statut

1. Ouvrir la fiche du personnage/PNJ
2. Dans la section "Statut" (en haut à droite), sélectionner un statut :

   - **Défensif** → Bouclier bleu
   - **Agressif** → Épée rouge
   - **Concentré** → Œil violet
   - **Furtif** → Silhouette ninja
   - **Berserk** → Flamme orange

3. **L'icône apparaît immédiatement sur le token !**

### 3. Changer de statut

- Sélectionner un autre statut → L'icône change
- Sélectionner "Aucun" → L'icône disparaît

### 4. Vérifications importantes

- ✅ **Aucun effet sur les statistiques**
- ✅ **Icône visible sur le token**
- ✅ **Status effect natif de FoundryVTT**
- ✅ **Fonctionne pour personnages ET PNJs**

## Statuts disponibles

| Statut    | Icône    | Couleur   | Description                     |
| --------- | -------- | --------- | ------------------------------- |
| Aucun     | -        | -         | Statut par défaut, aucune icône |
| Défensif  | Bouclier | Bleu      | Posture défensive               |
| Agressif  | Épée     | Rouge     | Attaque sans retenue            |
| Concentré | Œil      | Violet    | Concentration profonde          |
| Furtif    | Ninja    | Gris-bleu | Déplacement furtif              |
| Berserk   | Flamme   | Orange    | Rage incontrôlable              |

## En cas de problème

### L'icône n'apparaît pas

1. Vérifier que le statut est bien sélectionné (pas "Aucun")
2. Actualiser le token (F5 ou clic droit > Actualiser)
3. Vérifier dans les paramètres de FoundryVTT que les status effects sont activés

### Plusieurs icônes apparaissent

- Clic droit sur le token → "Supprimer les conditions" → Supprimer les anciens status effects

### Déboguer

Console F12 :

```javascript
// Vérifier les statuts configurés
console.log(CONFIG.statusEffects.filter((s) => s.id.startsWith("jayspik-")));

// Vérifier le statut d'un acteur
let actor = game.actors.getName("Nom du personnage");
console.log(actor.system.status);
```

## Notes techniques

- Les status effects sont enregistrés dans `CONFIG.statusEffects`
- Les icônes utilisent les SVG natifs de FoundryVTT (`icons/svg/`)
- Le système met à jour automatiquement tous les tokens de l'acteur
- Compatible avec les autres modules FoundryVTT
