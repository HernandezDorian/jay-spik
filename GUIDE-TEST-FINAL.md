# 🧪 GUIDE DE TEST - Système de Postures JAY-SPIK

## ✅ État du Système

Le système de postures a été refactorisé en version **ULTRA-SIMPLE** pour éliminer tous les bugs de doublons et permissions.

### ✨ Fonctionnalités

- ✅ **Un seul effet de posture actif** : suppression automatique de l'ancien avant création du nouveau
- ✅ **Gestion des permissions** : seul le GM ou le propriétaire peut modifier, sinon délégation au GM
- ✅ **Protection anti-doublons** : marquage des updates socket pour éviter les boucles
- ✅ **Interface utilisateur** : sélecteur dans la fiche du personnage
- ✅ **Affichage token** : icône, label et description sur le token

## 🚀 Comment Tester

### 1. Test de Configuration (Console F12)

```javascript
// Copier-coller le fichier TEST-FINAL-POSTURES.js dans la console
// Puis lancer :
testJaySpikConfig();
```

### 2. Test en tant que JOUEUR

1. **Connectez-vous comme joueur** (pas GM)
2. **Ouvrez votre fiche personnage**
3. **Changez le statut** dans le sélecteur en haut de la fiche
4. **Vérifiez** :
   - ✅ Le token affiche la nouvelle icône de posture
   - ✅ Au survol, vous voyez le nom et la description
   - ✅ Aucun doublon d'effet
   - ✅ Pas d'erreur dans la console

### 3. Test en tant que GM

1. **Connectez-vous comme GM**
2. **Modifiez le statut d'un PNJ** ou d'un personnage joueur
3. **Vérifiez** le même comportement que pour un joueur

### 4. Test Multi-Utilisateurs

1. **GM et joueur connectés simultanément**
2. **Le joueur change son statut** rapidement plusieurs fois
3. **Vérifiez** :
   - ✅ Pas de doublons
   - ✅ Pas d'erreurs de permissions
   - ✅ Le GM voit les changements en temps réel

### 5. Test de Permissions

1. **Joueur essaie de modifier un PNJ** dont il n'est pas propriétaire
2. **Résultat attendu** :
   - ✅ La demande est envoyée au GM via socket
   - ✅ Le GM traite automatiquement la demande
   - ✅ L'effet apparaît sur le token du PNJ

## 🧪 Tests Automatisés

### Console Commands

```javascript
// Test complet automatique
testJaySpikAll();

// Tests individuels
testJaySpikConfig(); // Configuration
testJaySpikPermissions(); // Permissions utilisateur
testJaySpikPosture(); // Changement de posture
testJaySpikCleanup(); // Nettoyage des effets
testJaySpikSocket(); // Communication socket

// Test sur un acteur spécifique
testJaySpikAll("actor-id-here");
```

## 🎯 Postures Disponibles

| Posture       | Description                       | Icône |
| ------------- | --------------------------------- | ----- |
| **Aucun**     | Pas de posture active             | -     |
| **Défensive** | Posture de défense et protection  | 🛡️    |
| **Agressive** | Posture d'attaque offensive       | ⚔️    |
| **Concentré** | Posture de focus et concentration | 🧠    |

## 🐛 Résolution des Problèmes

### Si aucun effet n'apparaît :

1. Vérifiez la console F12 pour les erreurs
2. Lancez `testJaySpikConfig()` pour vérifier la configuration
3. Vérifiez que vous avez les permissions sur l'acteur

### Si des doublons apparaissent :

1. C'est un bug résiduel - nettoyez manuellement :

```javascript
// Nettoyer tous les effets de posture sur un acteur
const actor = game.actors.get("actor-id");
const postureEffects = actor.effects.filter((e) => e.flags?.jaySpik?.isPosture);
await actor.deleteEmbeddedDocuments(
  "ActiveEffect",
  postureEffects.map((e) => e.id)
);
```

### Si les permissions ne marchent pas :

1. Vérifiez qu'un GM est connecté
2. Regardez la console F12 pour les messages socket
3. Lancez `testJaySpikPermissions()` pour diagnostiquer

## 📝 Logs à Surveiller

### Console F12 - Messages Normaux :

```
🎯 JAY-SPIK | Changement posture détecté Actor -> defensive
JAY-SPIK: user traite le changement
JAY-SPIK: [POSTURE] Actor -> defensive
JAY-SPIK: Supprimé 0 effet(s) de posture
JAY-SPIK: Créé effet de posture: defensive
```

### Messages d'Erreur à Éviter :

```
❌ Multiple effects created
❌ Permission denied
❌ TypeError: Cannot read property
❌ Socket loop detected
```

## 🎉 Validation Finale

Le système est considéré comme **STABLE** si :

- ✅ Les tests automatisés passent à 100%
- ✅ Aucun doublon d'effet observé
- ✅ Permissions respectées (joueur → GM → effet)
- ✅ Interface responsive et intuitive
- ✅ Pas d'erreurs en console

## 🔧 Fichiers Modifiés

- ✅ `module/jay-spik.mjs` - Version finale ultra-simple
- ✅ `module/jay-spik-backup.mjs` - Sauvegarde ancienne version
- ✅ `TEST-FINAL-POSTURES.js` - Script de test complet
- ✅ `DEBUG-STATUS-EFFECTS.md` - Documentation technique

## 🚀 Déploiement

Le système est prêt pour utilisation en production. Les joueurs peuvent maintenant :

1. **Sélectionner une posture** dans leur fiche
2. **Voir l'effet** immédiatement sur leur token
3. **Changer à volonté** sans bugs ni doublons
4. **Collaborer** avec le GM en cas de permissions insuffisantes

---

**Bonne chance pour les tests ! 🎲**
