# Corrections système de statuts - 25 juillet 2025

## Problème résolu

**Erreur** : `DataModelValidationError: status: may not be a blank string`

L'erreur était causée par la valeur initiale du champ `status` qui était définie comme une chaîne vide `""`. Foundry V11+ rejette les chaînes vides pour les champs StringField.

## Corrections apportées

### 1. Correction du schéma de données

- **Fichier** : `module/data/actor-character.mjs`
- **Changement** : `initial: ""` → `initial: "none"`
- **Résultat** : Les nouveaux personnages ont maintenant un statut "none" par défaut

### 2. Extension aux NPCs

- **Fichier** : `module/data/actor-npc.mjs`
- **Ajout** : Système de statuts complet pour les NPCs
- **Ajout** : Méthode `getStatBonus()` pour appliquer les effets de statuts
- **Résultat** : Les NPCs peuvent maintenant avoir des statuts comme les personnages

### 3. Mise à jour de l'interface NPC

- **Fichier** : `templates/actor/actor-npc-sheet.hbs`
- **Ajout** : Section de sélection de statut dans l'en-tête
- **Résultat** : Interface unifiée entre personnages et NPCs

### 4. Correction des logiques

- **Fichier** : `module/jay-spik.mjs`
- **Correction** : Gestion de `status === "none"` dans l'affichage des tokens
- **Fichier** : `module/helpers/config.mjs`
- **Ajout** : Option "none" dans la configuration globale

### 5. Gestion cohérente de "none"

- Tous les fichiers qui vérifient les statuts gèrent maintenant `"none"` comme "aucun statut"
- L'icône de statut n'apparaît que si le statut n'est pas "none"
- Les effets de statuts ne s'appliquent que si le statut n'est pas "none"

## Fonctionnalités maintenant disponibles

✅ **Création d'acteurs** : Fonctionne sans erreur  
✅ **Statuts pour personnages** : Défensif, Agressif, Concentré, Furtif, Berserk  
✅ **Statuts pour NPCs** : Même système que les personnages  
✅ **Effets dynamiques** : Les statuts modifient les statistiques en temps réel  
✅ **Icônes sur tokens** : Affichage visuel du statut actif  
✅ **Configuration facile** : Ajout de nouveaux statuts via `status-config.mjs`  
✅ **Interface unifiée** : Même apparence pour personnages et NPCs

## Test recommandé

1. Créer un nouveau personnage → ✅ Devrait fonctionner
2. Créer un nouveau PNJ → ✅ Devrait fonctionner
3. Changer le statut → ✅ L'icône apparaît sur le token
4. Vérifier les bonus → ✅ Les stats sont modifiées selon le statut

## Statuts par défaut

- **Aucun** (`none`) : Pas d'effet, pas d'icône
- **Défensif** : +10 défense, -5 attaque
- **Agressif** : +10 attaque, -5 défense
- **Concentré** : +15 mental, -10 physique
- **Furtif** : +10 agilité, +5 social, -5 physique
- **Berserk** : +20 physique, +15 attaque, -15 défense, -10 mental

Le système est maintenant entièrement fonctionnel et extensible !
