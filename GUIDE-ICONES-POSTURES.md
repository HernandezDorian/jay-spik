# Guide : Utiliser vos icônes locales pour les postures

## 🎨 Méthodes pour changer les icônes

### Option 1: Icônes dans le dossier assets (Recommandé)

1. **Placez vos icônes** dans `assets/postures/` :

   ```
   assets/postures/
   ├── offensive.webp (ou .png)
   ├── defensive.webp (ou .png)
   ├── concentration.webp (ou .png)
   └── none.webp (ou .png)
   ```

2. **Le système utilisera automatiquement vos icônes** grâce à la configuration :
   ```javascript
   localIcon: "systems/jay-spik/assets/postures/offensive.webp";
   ```

### Option 2: Modifier directement la configuration

Dans `module/config/postures-config.mjs`, changez les chemins `localIcon` :

```javascript
offensive: {
  label: "Offensif",
  localIcon: "systems/jay-spik/assets/mon-icone-offensive.png", // Votre chemin
  // ...
}
```

### Option 3: Utiliser des icônes dans d'autres dossiers

Vous pouvez créer d'autres sous-dossiers dans assets :

```
assets/
├── icons/
│   ├── combat/
│   │   ├── offensive.webp
│   │   └── defensive.webp
│   └── magic/
│       └── concentration.webp
└── postures/ (dossier par défaut)
```

Puis modifier la config :

```javascript
localIcon: "systems/jay-spik/assets/icons/combat/offensive.webp";
```

## 🔧 Formats d'icônes supportés

- **WebP** (recommandé) - Meilleure compression
- **PNG** - Bonne qualité avec transparence
- **SVG** - Vectoriel, redimensionnable
- **JPG** - Pour les photos (pas recommandé pour les icônes)

## 📏 Tailles recommandées

- **Minimum** : 64x64 pixels
- **Optimal** : 128x128 pixels
- **Maximum** : 256x256 pixels

## 🎯 Exemple concret

1. **Créez vos icônes** (offensive.webp, defensive.webp, etc.)

2. **Placez-les** dans `assets/postures/`

3. **Supprimez les fichiers .placeholder** :

   ```
   rm assets/postures/*.placeholder
   ```

4. **Vos icônes apparaîtront automatiquement** dans les effets temporaires !

## 🛠️ Fallback automatique

Si votre icône locale n'est pas trouvée, le système utilisera automatiquement une icône Foundry par défaut. Cela évite les erreurs.

## 🔄 Rechargement

Après avoir ajouté de nouvelles icônes :

1. Rechargez Foundry (F5)
2. Ou redémarrez le serveur Foundry

## 💡 Astuce pro

Pour tester rapidement, vous pouvez aussi utiliser des URLs complètes :

```javascript
localIcon: "https://mon-site.com/mon-icone.png";
```

Mais les icônes locales sont plus fiables !
