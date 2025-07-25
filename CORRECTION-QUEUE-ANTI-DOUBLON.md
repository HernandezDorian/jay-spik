# CORRECTION DÉFINITIVE - SYSTÈME DE QUEUE ANTI-DOUBLON

## Problème identifié

Les doublons de statuts persistaient malgré les systèmes de verrous précédents à cause de :

1. **Conditions de course** entre les hooks `updateActor` multiples
2. **Timing imprévisible** des suppressions/créations d'ActiveEffect
3. **Verrous asynchrones** avec setTimeout qui créaient des gaps temporels
4. **Hooks multiples** déclenchés par FoundryVTT pour le même changement

## Solution implémentée : Système de Queue Séquentielle

### Principe

- **Queue centralisée** : tous les changements de statut passent par une queue unique
- **Traitement séquentiel** : un seul changement traité à la fois, dans l'ordre
- **Regroupement automatique** : les changements rapides pour le même acteur sont fusionnés
- **Protection totale** : vérifications multiples avant et après chaque opération

### Fonctions principales

#### `queueStatusUpdate(actor, newStatus)`

- Ajoute un changement de statut à la queue
- Remplace automatiquement les entrées en attente pour le même acteur
- Traitement différé avec regroupement (50ms)

#### `processStatusUpdateQueue()`

- Traite la queue de manière séquentielle
- Un seul processus à la fois (flag `queueProcessing`)
- Délais entre chaque traitement (100ms)
- Gestion des erreurs sans blocage

#### `updateStatusActiveEffectSafe(actor, newStatus)`

- Version ultra-sécurisée de la mise à jour
- Suppression complète avant création
- Vérifications multiples
- Délais d'attente appropriés

#### `removeAllStatusEffectsCompletely(actor)`

- Suppression garantie de tous les effets de statut
- Traitement individuel de chaque effet
- Ignore toutes les erreurs FoundryVTT

#### `createStatusActiveEffectSafe(actor, statusKey)`

- Création sécurisée avec vérification finale
- Alerte si des effets persistent avant création
- Validation post-création automatique

### Modifications des Hooks

```javascript
// Hook updateActor modifié
Hooks.on("updateActor", (actor, changes, options, userId) => {
  if (changes.system?.status !== undefined) {
    // Éviter les boucles infinies
    if (options?.jaySpikStatusUpdate) return;

    // Utiliser la queue au lieu d'un traitement direct
    queueStatusUpdate(actor, changes.system.status);
  }
});
```

### Avantages

1. **Élimination des conditions de course** : traitement séquentiel strict
2. **Regroupement automatique** : évite les changements redondants
3. **Robustesse** : continue même en cas d'erreurs isolées
4. **Performance** : délais optimisés pour FoundryVTT
5. **Debugging** : logs détaillés et timestamps

### Tests de validation

#### Script de test : `TEST-NOUVELLE-APPROCHE.js`

- Test de changements rapides (5 changements en 50ms)
- Test d'appels concurrents (5 mises à jour simultanées)
- Surveillance en temps réel de la queue
- Validation automatique des résultats

#### Utilisation

```javascript
// Test complet automatique
window.runCompleteTest();

// Tests spécifiques
window.testRapidStatusChanges("NomActeur");
window.testConcurrentCalls("NomActeur");

// Surveillance
window.monitorQueue();
```

### Résultats attendus

- **Zéro doublon** même avec changements très rapides
- **Un seul effet** maximum par acteur à tout moment
- **Logs clairs** pour debugging et surveillance
- **Performance stable** sans impact sur FoundryVTT

## Fichiers modifiés

- `module/jay-spik.mjs` : refactoring complet du système de statuts
- `TEST-NOUVELLE-APPROCHE.js` : script de validation et stress-test
- `DIAGNOSTIC-DOUBLONS-AVANCE.js` : outils de diagnostic

## Migration

Le nouveau système est **rétrocompatible** :

- Même API externe (pas de changement pour les templates)
- Mêmes hooks FoundryVTT utilisés
- Nettoyage automatique des anciens doublons au démarrage

Cette solution devrait **définitivement éliminer** le problème des doublons de statuts.
