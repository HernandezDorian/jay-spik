# Système de Caractéristiques basé sur 100

## Comment ça fonctionne

Votre système JaySpik utilise maintenant un système de caractéristiques basé sur 100, avec trois stats principales :

### Les 3 Caractéristiques

1. **Mental** - Représente l'intelligence, la volonté, la magie, etc.
2. **Physique** - Représente la force, l'endurance, l'agilité, etc.
3. **Social** - Représente le charisme, la persuasion, l'empathie, etc.

### Valeurs recommandées

- **0-39** : Faible (couleur rouge)
- **40-79** : Moyen (couleur orange)
- **80-100** : Excellent (couleur verte)

### Comment faire des jets

1. Cliquez sur le nom de la caractéristique (Mental, Physique, Social) ou sur sa valeur
2. Le système lance automatiquement 1d100
3. **Succès** : Si le résultat est ≤ à la valeur de votre caractéristique
4. **Échec** : Si le résultat est > à la valeur de votre caractéristique

### Exemples

- Personnage avec **70 en Mental** → Lance 1d100

  - Résultat **31** = **ÉCHEC** (31 > 30 ? Non, mais 31 ≤ 70 ? Oui = SUCCÈS)
  - Résultat **71** = **ÉCHEC** (71 > 70)
  - Résultat **29** = **SUCCÈS** (29 ≤ 70)

- Personnage avec **30 en Social** → Lance 1d100
  - Résultat **31** = **ÉCHEC** (31 > 30)
  - Résultat **29** = **SUCCÈS** (29 ≤ 30)

### Configuration d'un personnage

1. Ouvrez la fiche de personnage
2. Dans l'onglet "Features", vous verrez les trois caractéristiques
3. Ajustez les valeurs entre 0 et 100 selon votre concept de personnage
4. Cliquez sur les noms ou valeurs pour faire des jets

### Conseils de création

- **Personnage équilibré** : 50/50/50 (150 points au total)
- **Spécialiste Mental** : 80/40/30 (exemple : mage, érudit)
- **Spécialiste Physique** : 30/80/40 (exemple : guerrier, athlète)
- **Spécialiste Social** : 40/30/80 (exemple : diplomate, barde)

### Personnalisation

Vous pouvez modifier les noms des caractéristiques en éditant les fichiers :

- `lang/fr.json` pour le français
- `lang/en.json` pour l'anglais

Les valeurs par défaut et limites peuvent être ajustées dans :

- `module/data/actor-character.mjs`
