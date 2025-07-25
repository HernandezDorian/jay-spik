# GUIDE DE RÉSOLUTION - PROBLÈMES JOUEURS/GM STATUTS

## Problème identifié

Les doublons de statuts apparaissent plus fréquemment quand un **joueur** fait des changements rapides comparé au **GM**.

### Causes probables

1. **Permissions différentes**

   - Les joueurs n'ont pas toujours les permissions pour modifier les ActiveEffect
   - FoundryVTT peut créer des conditions de course lors des vérifications de permissions

2. **Latence réseau**

   - Les changements des joueurs transitent par le serveur
   - Délais de synchronisation plus longs entre client/serveur

3. **Hooks multiples**

   - FoundryVTT peut déclencher des hooks supplémentaires pour les actions de joueurs
   - Validation/autorisation supplémentaire côté serveur

4. **Ordre de traitement**
   - Le GM traite localement, les joueurs via réseau
   - Possibilité de traitement dans un ordre différent

## Solutions testées

### 1. Délais adaptés selon utilisateur

```javascript
// Plus de délai pour les joueurs
const isPlayerChange = userId !== game.user.id && !game.users.get(userId)?.isGM;
const delay = isPlayerChange ? 150 : 50; // Plus de temps pour les joueurs
```

### 2. Vérification de permissions

```javascript
// Seuls GM et propriétaire peuvent modifier les effets
if (!game.user.isGM && !actor.testUserPermission(game.user, "OWNER")) {
  // Déléguer au GM via socket
}
```

### 3. Système de socket GM/Joueur

- Les joueurs envoient une demande au GM
- Le GM traite la demande avec ses permissions complètes
- Évite les problèmes de permissions côté joueur

## Correctif temporaire

### Fichier: `CORRECTIF-JOUEURS-GM.js`

**Mode Joueur:**

- Vérifie les permissions avant toute action
- Délègue au GM si pas propriétaire
- Utilise des délais plus longs (200ms au lieu de 50ms)

**Mode GM:**

- Écoute les demandes des joueurs via socket
- Traite avec permissions complètes
- Logs détaillés pour monitoring

### Utilisation

1. **Charger le correctif:**

   ```javascript
   // Dans la console FoundryVTT
   // Copier-coller le contenu de CORRECTIF-JOUEURS-GM.js
   ```

2. **Surveillance:**

   - Le script monitore automatiquement les changements
   - Logs détaillés dans la console : `[MONITOR]`
   - Alertes en cas de doublons détectés

3. **Nettoyage d'urgence:**
   ```javascript
   window.emergencyCleanup("NomActeur");
   ```

## Tests recommandés

### Test 1: Comparaison GM vs Joueur

1. **GM fait 5 changements rapides** → noter les doublons
2. **Joueur fait 5 changements rapides** → noter les doublons
3. **Comparer les résultats**

### Test 2: Propriétaire vs Non-propriétaire

1. **Joueur propriétaire** change son propre statut
2. **Joueur non-propriétaire** essaie de changer un PNJ
3. **Observer la délégation au GM**

### Test 3: Latence réseau

1. **Actions locales** (GM ou joueur local)
2. **Actions via réseau** (joueur distant)
3. **Mesurer les différences de timing**

## Résultats attendus

### Avec le correctif

- **Zéro doublon** même pour les actions de joueurs
- **Délégation automatique** au GM quand nécessaire
- **Logs clairs** pour identifier les problèmes restants

### Monitoring

- Console affiche `[MONITOR]` pour chaque changement
- Type d'utilisateur (GM/JOUEUR) et permissions
- Alertes automatiques si doublons détectés

## Actions futures

1. **Intégrer dans le code principal** si le correctif fonctionne
2. **Optimiser les délais** selon les tests de latence
3. **Améliorer le système de socket** pour plus de robustesse
4. **Ajouter une UI** pour les notifications joueurs

## Logs à surveiller

```
JaySpik: [MONITOR] JOUEUR xyz change ActorName -> defensive
JaySpik: [MONITOR] Propriétaire: false
JaySpik: [JOUEUR] Pas propriétaire - demande au GM
JaySpik: [GM] Demande de PlayerName - actorId -> defensive
✅ [MONITOR] OK après changement GM - 1 effet(s)
```

Si vous voyez:

```
🚨 [MONITOR] DOUBLON DÉTECTÉ après changement JOUEUR! 2 effets
```

C'est qu'il faut ajuster les délais ou la logique de permissions.
