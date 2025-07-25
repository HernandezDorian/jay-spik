# Test Bug Fix - Postures Multiples

## 🐛 **Bug corrigé : Postures en double**

### Problème identifié

- **Symptôme** : Après F5, changement de posture créait parfois 2 effets simultanés
- **Cause** : Anciens effets pas complètement supprimés avant création du nouveau

### Corrections appliquées

1. **Suppression robuste** : `removeExistingStatusEffect()` supprime TOUS les effets de posture
2. **Nettoyage au démarrage** : `cleanupDuplicateStatusEffects()` nettoie les doublons
3. **Logs de debug** : Pour tracer les suppressions

## 🧪 **Test de la correction**

### Test principal

1. **Sélectionner une posture** (ex: "Défensive")
2. **Faire F5** pour recharger la page
3. **Changer pour une autre posture** (ex: "Offensive")
4. **Vérifier** dans l'onglet "Effets" : Il ne doit y avoir qu'UN SEUL effet

### Test de stress

1. **Changer rapidement** entre plusieurs postures
2. **Faire F5** entre les changements
3. **Répéter** plusieurs fois
4. **Vérifier** : Toujours un seul effet maximum

### Test avec plusieurs personnages

1. **Créer 2-3 personnages** avec des postures différentes
2. **Faire F5**
3. **Changer les postures** de chaque personnage
4. **Vérifier** : Chacun n'a qu'une seule posture

## 🔍 **Debug et vérification**

### Console F12 - Vérifier les effets

```javascript
// Vérifier les effets d'un personnage
let actor = game.actors.getName("Nom du personnage");
let statusEffects = actor.effects.filter(
  (e) =>
    e.flags?.jaySpik?.isStatusEffect ||
    e.statuses?.some((s) => s.startsWith("jayspik-"))
);
console.log(
  `${actor.name} a ${statusEffects.length} effet(s) de posture:`,
  statusEffects.map((e) => e.name)
);
```

### Console F12 - Nettoyage manuel

```javascript
// Nettoyer manuellement si nécessaire
cleanupDuplicateStatusEffects();

// Forcer la mise à jour d'une posture
let actor = game.actors.getName("Nom du personnage");
await updateStatusActiveEffect(actor, "defensive");
```

### Logs à surveiller

Dans la console, vous devriez voir :

- `JaySpik: Nettoyage des effets de posture en double...` (au démarrage)
- `JaySpik: Suppression de X effet(s) de posture existant(s)` (lors des changements)

## ✅ **Résultats attendus**

### Fonctionnement normal

- ✅ **Une seule posture** active à la fois
- ✅ **Changement propre** : ancien effet supprimé, nouveau créé
- ✅ **Résistant aux F5** : pas de doublons après rechargement
- ✅ **Nettoyage automatique** au démarrage du monde

### Plus de bugs

- ❌ **Deux postures simultanées**
- ❌ **Effets fantômes** après F5
- ❌ **Accumulation d'effets** lors de changements rapides

## 🚨 **Si le problème persiste**

### Actions de dépannage

1. **Console F12** : Vérifier les logs JaySpik
2. **Redémarrer** complètement le monde FoundryVTT
3. **Nettoyage manuel** : `cleanupDuplicateStatusEffects()`
4. **Vérifier** qu'aucun autre module ne crée des effets similaires

### Debug avancé

```javascript
// Voir tous les effets avec statuses jayspik
game.actors.forEach((actor) => {
  let effects = actor.effects.filter((e) =>
    e.statuses?.some((s) => s.startsWith("jayspik-"))
  );
  if (effects.length > 0) {
    console.log(
      `${actor.name}:`,
      effects.map((e) => ({ name: e.name, statuses: e.statuses }))
    );
  }
});
```

Le système est maintenant plus robuste et ne devrait plus jamais avoir de postures multiples ! 🎉
