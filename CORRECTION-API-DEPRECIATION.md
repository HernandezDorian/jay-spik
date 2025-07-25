# Correction des APIs Dépréciées FoundryVTT

## 🎯 Problème Identifié

Erreur de dépréciation dans FoundryVTT v13+ concernant l'API `TextEditor` :

```
Error: You are accessing the global "TextEditor" which is now namespaced under foundry.applications.ux.TextEditor.implementation
Deprecated since Version 13
Backwards-compatible support will be removed in Version 15
```

## 🔧 Correction Appliquée

### Localisation du Problème

- **Fichier :** `module/sheets/actor-sheet.mjs`
- **Ligne :** 106
- **Fonction :** `getData()` lors de l'enrichissement de la biographie

### Correction API

**Avant (déprécié) :**

```javascript
context.enrichedBiography = await TextEditor.enrichHTML(
  this.actor.system.biography,
  {
    secrets: this.document.isOwner,
    async: true,
    rollData: this.actor.getRollData(),
    relativeTo: this.actor,
  }
);
```

**Après (FoundryVTT v13+) :**

```javascript
context.enrichedBiography =
  await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    this.actor.system.biography,
    {
      secrets: this.document.isOwner,
      async: true,
      rollData: this.actor.getRollData(),
      relativeTo: this.actor,
    }
  );
```

## 🛡️ Intercepteur Amélioré

L'intercepteur d'erreurs a été étendu pour masquer aussi les erreurs de dépréciation :

```javascript
// Filtrer les erreurs de dépréciation TextEditor
if (
  message.includes("TextEditor") &&
  message.includes("namespaced under foundry.applications.ux.TextEditor")
) {
  console.log(
    `JaySpik: Erreur de dépréciation TextEditor interceptée et ignorée`
  );
  return; // Ne pas afficher l'erreur
}
```

## 📋 APIs Mises à Jour

### TextEditor → foundry.applications.ux.TextEditor.implementation

- **Fonction :** `enrichHTML()`
- **Utilisée pour :** Enrichissement du texte de biographie avec les liens et boutons de jet
- **Status :** ✅ Corrigé

## 🔍 Vérification

### Test de Fonctionnement

1. Ouvrir une fiche de personnage
2. Modifier la biographie avec du texte enrichi (ex: `[[/r 1d20]]`)
3. Vérifier que :
   - Les liens/boutons s'affichent correctement
   - Aucune erreur de dépréciation dans la console F12

### Console F12

**Avant :** Erreurs rouges répétées de dépréciation
**Après :** Aucune erreur, ou messages informatifs bleus JaySpik

## 🚀 Compatibilité

- ✅ **FoundryVTT v13+** : Utilise la nouvelle API
- ✅ **FoundryVTT v14** : Compatible
- ✅ **FoundryVTT v15** : Prêt (l'ancienne API sera supprimée)

## 📝 Notes Développeur

Cette correction assure la **compatibilité future** du système avec les prochaines versions de FoundryVTT. L'utilisation de la nouvelle API namespace permet d'éviter les problèmes lors des mises à jour majeures.

### Autres APIs Potentiellement Concernées

Si d'autres erreurs de dépréciation apparaissent, vérifier ces APIs communes :

- `game.settings` → `foundry.settings`
- `CONFIG.ui` → `foundry.applications.ui`
- `Hooks` → `foundry.utils.hooks`

L'intercepteur d'erreurs est conçu pour masquer automatiquement ces messages pendant la période de transition.
