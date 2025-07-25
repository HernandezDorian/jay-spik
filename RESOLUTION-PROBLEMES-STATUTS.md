# Résolution des Problèmes - Système de Statuts JaySpik

## Problème : L'icône de statut n'apparaît pas sur le token

### Vérifications à effectuer

1. **Vérifier la sélection du statut**

   - Ouvrir la fiche du personnage/PNJ
   - Section "Statut" en haut à droite
   - S'assurer qu'un statut autre que "Aucun" est sélectionné

2. **Vérifier la création de l'effet**

   - Dans la fiche, aller dans l'onglet "Effets"
   - Il doit y avoir un effet nommé "Statut: [Nom du statut]"
   - L'effet doit avoir une icône (ex: shield.svg, sword.svg, etc.)

3. **Actualiser le token**

   - Clic droit sur le token > "Actualiser"
   - Ou supprimer et replacer le token sur la scène

4. **Vérifier la console**
   - Appuyer sur F12 pour ouvrir les outils développeur
   - Onglet "Console"
   - Rechercher des erreurs contenant "jaySpik", "status" ou "effect"

## Problème : L'ancienne icône reste affichée

### Solutions

1. **Suppression manuelle de l'effet**

   - Ouvrir la fiche > onglet "Effets"
   - Supprimer tous les effets avec "Statut:" dans le nom
   - Sélectionner un nouveau statut

2. **Réinitialisation complète**
   - Sélectionner "Aucun" dans les statuts
   - Sauvegarder la fiche
   - Sélectionner le nouveau statut souhaité

## Problème : Erreurs dans la console

### Erreurs communes et solutions

**"CONFIG.JAY_SPIK.statuses is undefined"**

- Le fichier de configuration n'est pas chargé
- Vérifier que `status-config.mjs` existe
- Redémarrer FoundryVTT

**"convertFontAwesomeToPath is not defined"**

- Problème de chargement du module principal
- Vérifier `jay-spik.mjs` dans les outils développeur > Sources
- Redémarrer le monde

**"Cannot read property 'icon' of undefined"**

- Un statut sélectionné n'existe pas dans la configuration
- Vérifier la configuration des statuts
- Sélectionner un statut valide

## Problème : Les statuts modifient les statistiques

### Vérification importante

Les statuts ne doivent PAS modifier les stats. Si c'est le cas :

1. **Vérifier l'effet dans la fiche**

   - Onglet "Effets"
   - Cliquer sur l'effet de statut
   - La section "Changements" doit être VIDE

2. **Si des changements sont présents**
   - Supprimer l'effet manuellement
   - Le bug sera corrigé au prochain changement de statut

## Problème : Interface de sélection non visible

### Solutions

1. **Vérifier le template**

   - La section statut doit être visible en haut à droite de la fiche
   - Si elle n'apparaît pas, vérifier `actor-character-sheet.hbs`

2. **Problème de CSS**
   - Vérifier que `jay-spik.css` est chargé
   - La section `.status-section` doit être définie

## Débogage avancé

### Commandes console utiles

```javascript
// Vérifier la configuration des statuts
console.log(CONFIG.JAY_SPIK.statuses);

// Vérifier les effets d'un acteur
let actor = game.actors.getName("Nom du personnage");
console.log(
  actor.effects.map((e) => ({ name: e.name, icon: e.icon, changes: e.changes }))
);

// Forcer la mise à jour du statut
let actor = game.actors.getName("Nom du personnage");
actor.system.status = "defensive"; // ou autre statut
actor.update({ "system.status": "defensive" });
```

### Fichiers à vérifier en cas de problème persistant

1. `module/jay-spik.mjs` - Ligne ~507 : fonction `updateStatusEffects`
2. `module/config/status-config.mjs` - Configuration des statuts
3. `templates/actor/actor-character-sheet.hbs` - Interface de sélection
4. `css/jay-spik.css` - Styles pour les statuts

## Contact et Support

Si le problème persiste :

1. Vérifier la version de FoundryVTT (testé sur v11+)
2. Désactiver temporairement les autres modules
3. Consulter les logs de FoundryVTT dans les données utilisateur
