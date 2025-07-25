# Correction des Erreurs de Concurrence - Effets de Statut

## Problème Identifié

L'erreur "ActiveEffect 'RADiCme0CVRZbqoL' does not exist!" se produisait à cause de conditions de concurrence (race conditions) lors de la gestion des effets de statut. Plusieurs appels simultanés à `updateStatusActiveEffect` pouvaient essayer de supprimer le même effet, causant des erreurs.

## Solutions Implémentées

### 1. Système de Verrous (Mutex)

```javascript
// Map pour éviter les appels concurrents de mise à jour des statuts
const statusUpdateLocks = new Map();
```

- Empêche les appels multiples simultanés à `updateStatusActiveEffect` pour le même acteur
- Évite les conflits lors des suppressions d'effets
- Libération automatique du verrou après 100ms

### 2. Suppression Individuelle des Effets

**Avant :**

```javascript
// Suppression en lot (pouvait causer des erreurs)
await actor.deleteEmbeddedDocuments("ActiveEffect", validEffectIds);
```

**Après :**

```javascript
// Suppression individuelle avec gestion d'erreurs
for (const effect of existingEffects) {
  try {
    const currentEffect = actor.effects.get(effect.id);
    if (currentEffect) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", [effect.id]);
      deletedCount++;
    }
  } catch (deleteError) {
    // Gestion spécifique des erreurs "does not exist"
    if (deleteError.message.includes("does not exist")) {
      console.log(`JaySpik: Effet ${effect.id} déjà supprimé, ignoré`);
    }
  }
}
```

### 3. Amélioration du Nettoyage Global

- Suppression individuelle des effets en double lors du nettoyage global
- Gestion d'erreurs par acteur pour éviter qu'une erreur arrête tout le processus
- Vérification d'existence avant chaque suppression

## Tests de Validation

Pour tester que les corrections fonctionnent :

### Test 1 : Changements Rapides de Statut

```javascript
// Dans la console F12 du navigateur
const actor = game.actors.getName("Nom du Personnage");
actor.update({ "system.status": "defensive" });
actor.update({ "system.status": "offensive" });
actor.update({ "system.status": "focused" });
actor.update({ "system.status": "none" });
```

### Test 2 : Simulation de F5 Répétés

1. Changer le statut d'un personnage
2. Faire F5 plusieurs fois rapidement
3. Vérifier qu'aucune erreur n'apparaît dans la console

### Test 3 : Plusieurs Acteurs Simultanés

```javascript
// Changer les statuts de plusieurs acteurs en même temps
game.actors.contents.forEach((actor, index) => {
  if (actor.type === "character") {
    setTimeout(() => {
      actor.update({
        "system.status": ["defensive", "offensive", "focused"][index % 3],
      });
    }, index * 50);
  }
});
```

## Logs de Diagnostic

Le système affiche maintenant des logs détaillés pour le diagnostic :

- `JaySpik: Mise à jour de statut déjà en cours pour [Nom], ignorée`
- `JaySpik: Effet [ID] déjà supprimé, ignoré`
- `JaySpik: [X] effet(s) supprimé(s) avec succès`
- `JaySpik: Nettoyage de secours effectué`

## Points Clés de la Correction

1. **Prévention** : Système de verrous pour éviter les appels concurrents
2. **Résilience** : Gestion d'erreurs robuste avec fallbacks
3. **Diagnostic** : Logs détaillés pour identifier les problèmes
4. **Performance** : Suppression individuelle plus sûre mais légèrement plus lente
5. **Stabilité** : Vérifications d'existence avant toute opération

## Résultat Attendu

- ✅ Aucune erreur "does not exist" dans la console
- ✅ Un seul effet de statut par acteur en permanence
- ✅ Changements de statut instantanés et fiables
- ✅ Robustesse après F5 ou rechargements
- ✅ Nettoyage automatique des effets orphelins

Cette correction assure la stabilité du système de statuts même en cas d'utilisation intensive ou de conditions de réseau difficiles.
