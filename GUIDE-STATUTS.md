# Guide des Statuts Configurables - JaySpik System

Ce guide explique comment utiliser et étendre le système de statuts configurables du système JaySpik pour FoundryVTT.

## Vue d'ensemble

Le système de statuts permet aux personnages d'adopter différentes postures qui affectent leurs caractéristiques. Chaque statut peut :

- Modifier les bonus/malus des statistiques
- Afficher une icône sur le token du personnage
- Être facilement configuré depuis un fichier central

## Statuts disponibles par défaut

### Défensif

- **Icône** : 🛡️ (fas fa-shield-alt)
- **Effet** : +10 Défense, -5 Attaque
- **Description** : Le personnage adopte une posture défensive, privilégiant la protection.

### Agressif

- **Icône** : ⚔️ (fas fa-sword)
- **Effet** : +10 Attaque, -5 Défense
- **Description** : Le personnage attaque sans retenue, sacrifiant sa défense pour l'offensive.

### Concentré

- **Icône** : 🧠 (fas fa-brain)
- **Effet** : +15 Mental, -10 Physique
- **Description** : Le personnage se concentre profondément, améliorant ses capacités mentales.

### Furtif

- **Icône** : 🥷 (fas fa-user-ninja)
- **Effet** : +10 Agilité, +5 Social, -5 Physique
- **Description** : Le personnage se déplace dans l'ombre, privilégiant la discrétion.

## Comment ajouter un nouveau statut

### 1. Modifier la configuration

Ouvrez le fichier `module/config/status-config.mjs` et ajoutez votre nouveau statut dans `STATUS_CONFIG` :

```javascript
nouveauStatut: {
  label: "Berserk",
  description: "Le personnage entre dans une rage incontrôlable, augmentant sa force au détriment de sa défense et de son contrôle.",
  icon: "fas fa-fire",
  color: "#ff5722", // Orange-rouge pour la rage
  effects: {
    physique: 20,
    attack: 15,
    defense: -15,
    mental: -10
  }
}
```

### 2. Ajouter les styles CSS (optionnel)

Si vous voulez une couleur spécifique pour l'icône sur les tokens, ajoutez dans `css/jay-spik.css` :

```css
.token-status-icon.nouveauStatut {
  background: rgba(255, 87, 34, 0.8);
}
```

### 3. C'est tout !

Le système se met automatiquement à jour :

- Le nouveau statut apparaît dans la liste déroulante
- Les effets sont appliqués aux statistiques
- L'icône s'affiche sur le token
- La description apparaît au survol

## Structure d'un statut

```javascript
cléDuStatut: {
  label: "Nom affiché",           // Texte dans l'interface
  description: "Description...",   // Tooltip au survol
  icon: "fas fa-icon",            // Classe FontAwesome
  color: "#couleur",              // Couleur héxadécimale
  effects: {                      // Bonus/malus appliqués
    nomStatistique: valeur,       // Peut être positif ou négatif
    autreStatistique: valeur
  }
}
```

## Statistiques disponibles

Vous pouvez affecter ces statistiques dans les `effects` :

- `physique` : Force physique du personnage
- `agilite` : Agilité et rapidité
- `mental` : Capacités intellectuelles
- `social` : Charisme et relations
- `attack` : Bonus d'attaque
- `defense` : Bonus de défense

## Icônes FontAwesome recommandées

- **Combat** : `fas fa-sword`, `fas fa-shield-alt`, `fas fa-fist-raised`
- **Mental** : `fas fa-brain`, `fas fa-eye`, `fas fa-book`
- **Social** : `fas fa-heart`, `fas fa-comments`, `fas fa-handshake`
- **Furtivité** : `fas fa-user-ninja`, `fas fa-mask`, `fas fa-eye-slash`
- **Magie** : `fas fa-magic`, `fas fa-star`, `fas fa-burn`

## Conseils de conception

### Balance des statuts

- Évitez de créer des statuts trop puissants
- Chaque bonus important devrait avoir un malus correspondant
- Privilégiez des effets thématiques cohérents

### Nommage

- Utilisez des clés en anglais sans espaces pour les IDs
- Choisissez des labels clairs et courts en français
- Écrivez des descriptions explicites des effets

### Couleurs

- Respectez une cohérence visuelle
- Rouge pour l'agressivité/danger
- Bleu pour la défense/protection
- Violet pour le mental/magie
- Vert pour la nature/guérison

## Fonctionnalités avancées

### Modification dynamique

Les statuts peuvent être modifiés en jeu sans redémarrage de FoundryVTT.

### Synchronisation

Les changements de statut sont automatiquement synchronisés entre tous les joueurs.

### Persistance

Le statut d'un personnage est sauvegardé avec ses données de personnage.

## Dépannage

### Le nouveau statut n'apparaît pas

1. Vérifiez la syntaxe JavaScript dans `status-config.mjs`
2. Rechargez FoundryVTT (F5)
3. Vérifiez la console pour les erreurs

### L'icône ne s'affiche pas sur le token

1. Vérifiez que l'icône FontAwesome existe
2. Assurez-vous que le CSS est bien formaté
3. Videz le cache du navigateur

### Les effets ne s'appliquent pas

1. Vérifiez que les noms de statistiques sont corrects
2. Assurez-vous que les valeurs sont des nombres

## Support

Pour toute question ou problème, consultez la documentation complète du système JaySpik ou contactez le développeur.
