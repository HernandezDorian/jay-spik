# Test du Système de Statuts - JaySpik

## Comment tester l'affichage des icônes sur les tokens

### 1. Prérequis

- Avoir un personnage ou PNJ créé dans le système
- Avoir placé le token du personnage sur une scène

### 2. Test de base

1. Ouvrir la fiche du personnage/PNJ
2. Dans la section "Statut", sélectionner un statut autre que "Aucun"
3. Fermer la fiche
4. Vérifier que l'icône apparaît sur le token

### 3. Statuts disponibles pour les tests

- **Défensif** : Bouclier bleu (icons/svg/shield.svg)
- **Agressif** : Épée rouge (icons/svg/sword.svg)
- **Concentré** : Œil violet (icons/svg/eye.svg)
- **Furtif** : Homme mystère (icons/svg/mystery-man.svg)
- **Enflammé** : Feu (icons/svg/fire.svg)

### 4. Test de changement de statut

1. Changer le statut du personnage
2. L'ancienne icône doit disparaître
3. La nouvelle icône doit apparaître
4. Sélectionner "Aucun" doit supprimer l'icône

### 5. Test de nouveau token

1. Supprimer le token de la scène
2. Faire glisser l'acteur depuis la barre latérale vers la scène
3. L'icône de statut doit apparaître automatiquement

### 6. Vérification technique

- Les effets ne modifient AUCUNE statistique
- Les effets sont visibles dans l'onglet "Effets" de la fiche
- L'effet a le nom "Statut: [Nom du statut]"
- L'effet n'a aucune modification dans la section "Changements"

## En cas de problème

### L'icône n'apparaît pas

1. Vérifier que le statut est bien sélectionné dans la fiche
2. Actualiser le token (clic droit > Actualiser)
3. Vérifier dans l'onglet "Effets" de la fiche qu'un effet de statut existe

### L'icône reste après changement

1. Ouvrir la fiche > onglet "Effets"
2. Supprimer manuellement l'ancien effet de statut
3. Sauvegarder et tester à nouveau

### Pour déboguer

- Ouvrir la console F12
- Rechercher les erreurs liées à "jaySpik" ou "status"
- Vérifier que `CONFIG.JAY_SPIK.statuses` existe

## Notes importantes

- Le système utilise les effets natifs de FoundryVTT
- Aucun impact sur les statistiques du personnage
- Les icônes utilisent les SVG fournis avec FoundryVTT
- Le système fonctionne pour les personnages ET les PNJs
