# Système de Status Effects - Résumé Final

## ✅ Ce qui a été fait

### 1. Remplacement du système d'Active Effects

- **AVANT** : Utilisait les Active Effects de FoundryVTT (complexe, peut affecter les stats)
- **MAINTENANT** : Utilise les Status Effects natifs (simple, purement visuel)

### 2. Configuration simplifiée

- Suppression de tous les "effects" qui modifiaient les statistiques
- Ajout de l'option "Aucun" par défaut
- Conservation uniquement : label, description, icon, color

### 3. Fonctions mises à jour

- `updateTokenStatusEffects()` : Met à jour les status effects sur les tokens
- `removeTokenStatusEffect()` : Supprime l'ancien status effect
- `addTokenStatusEffect()` : Ajoute le nouveau status effect

### 4. Enregistrement automatique

- Les status effects sont automatiquement enregistrés dans `CONFIG.statusEffects`
- Exclu l'option "none" pour éviter une icône vide

## 🎯 Fonctionnement final

1. **Par défaut** : Statut = "Aucun", aucune icône sur le token
2. **Sélection d'un statut** : L'icône apparaît instantanément sur le token
3. **Changement de statut** : L'ancienne icône disparaît, la nouvelle apparaît
4. **Retour à "Aucun"** : L'icône disparaît

## 📋 Statuts disponibles

| Statut    | Icône FoundryVTT            | Couleur   |
| --------- | --------------------------- | --------- |
| Aucun     | (aucune)                    | -         |
| Défensif  | `icons/svg/shield.svg`      | Bleu      |
| Agressif  | `icons/svg/sword.svg`       | Rouge     |
| Concentré | `icons/svg/eye.svg`         | Violet    |
| Furtif    | `icons/svg/mystery-man.svg` | Gris-bleu |
| Berserk   | `icons/svg/fire.svg`        | Orange    |

## 🔧 Fichiers modifiés

1. **`module/jay-spik.mjs`**

   - Ajout des hooks pour gérer les status effects
   - Nouvelles fonctions de gestion des tokens
   - Enregistrement automatique dans CONFIG

2. **`module/config/status-config.mjs`**
   - Simplification : suppression des "effects"
   - Ajout de l'option "none"
   - Nettoyage des fonctions inutiles

## 🚀 Comment tester

1. Lancer FoundryVTT avec le système JaySpik
2. Créer/ouvrir un personnage
3. Placer le token sur une scène
4. Ouvrir la fiche → Section "Statut" → Sélectionner un statut
5. **L'icône apparaît sur le token !**

## ⚠️ Points importants

- **Aucun effet sur les statistiques** - C'est purement visuel
- **Utilise les status effects natifs** de FoundryVTT
- **Compatible avec tous les modules** FoundryVTT
- **Icônes SVG** fournies avec FoundryVTT
- **Fonctionne pour personnages ET PNJs**

## 🎉 Résultat

Vous avez maintenant exactement ce que vous vouliez :

- ✅ Status effects visuels sur les tokens
- ✅ Aucun effet sur les stats
- ✅ Simple à utiliser
- ✅ Par défaut "Aucun" = pas d'icône
- ✅ Système natif FoundryVTT
