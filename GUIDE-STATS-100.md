# Système de Caractéristiques basé sur 100

## Comment ça fonctionne

Votre système JaySpik utilise maintenant un système de caractéristiques basé sur 100, avec trois stats principales :

### Les 4 Caractéristiques

1. **Mental** - Représente l'intelligence, la volonté, la magie, etc.
2. **Physique** - Représente la force, l'endurance, l'agilité, etc.
3. **Social** - Représente le charisme, la persuasion, l'empathie, etc.
4. **Dégâts** - Représente la puissance d'attaque, force destructrice, etc.

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

### Bonus et Malus des Objets

Votre système permet maintenant aux objets d'appliquer des bonus et malus dynamiques sur vos caractéristiques :

1. **Configuration des bonus** : Dans la fiche d'un objet, onglet "Attributes", vous pouvez ajouter des bonus aux statistiques
2. **Sélection de la stat** : Menu déroulant pour choisir quelle caractéristique modifier (Mental, Physique, Social)
3. **Opérateurs disponibles** :
   - **+** : Ajoute une valeur (ex: +5 augmente la stat de 5)
   - **-** : Soustrait une valeur (ex: -3 diminue la stat de 3)
   - **\*** : Multiplie la valeur (ex: \*2 double la stat)
   - **/** : Divise la valeur (ex: /2 divise la stat par 2)
4. **Valeur** : Le nombre à appliquer selon l'opérateur
5. **Affichage** : Les stats modifiées apparaissent en bleu sur la fiche de personnage
6. **Jets automatiques** : Les jets utilisent automatiquement les valeurs modifiées

**Exemples de bonus** :

- Épée magique : +10 en Physique
- Amulette de charme : +15 en Social
- Malédiction : /2 en Mental
- Armure lourde : -5 en Physique

## Système d'Équipement

Votre système dispose maintenant d'un onglet **Équipement** dédié dans les fiches de personnage :

### Types d'équipement disponibles

1. **Armes** : Définissent des dégâts de base et peuvent être équipées
2. **Armures & Boucliers** : Fournissent des bonus d'armure
3. **Accessoires** : Peuvent donner des bonus variés (vie, mana, dégâts, armure)
4. **Consommables** : Objets à usage unique

### Configuration d'un équipement

Dans la fiche d'un équipement, vous pouvez configurer :

#### Onglet "Effets"

- **Bonus Armure** : Augmente l'armure totale du personnage
- **Bonus Dégâts** : Augmente les dégâts totaux du personnage
- **Bonus Vie Max** : Augmente la vie maximale
- **Bonus Mana Max** : Augmente le mana maximum
- **Durabilité** : État de l'équipement

#### Onglet "Arme" (pour les armes uniquement)

- **Dégâts de Base** : Dégâts propres à l'arme
- **Type de Dégâts** : Physique, Magique, Feu, Glace, Foudre, Poison
- **Statistique d'Attaque** : Quelle caractéristique utiliser pour les jets d'attaque
- **Dégâts Totaux** : Calcul automatique (Base + Bonus)

#### Onglet "Bonus Stats"

- Même système que les objets normaux pour modifier les caractéristiques primaires

### Équiper/Déséquiper

- Cochez la case "Équipé" pour activer les effets d'un équipement
- Les bonus ne s'appliquent que sur les équipements équipés
- L'onglet Équipement affiche les totaux calculés automatiquement

### Exemples d'équipements

- **Épée de Feu** : 15 dégâts de base + Type Feu + Stat Physique
- **Armure de Plates** : +8 Armure, -2 Physique
- **Amulette de Vie** : +20 Vie Max, +5 Mental
- **Bouclier du Gardien** : +5 Armure, +10 Vie Max

### Personnalisation

Vous pouvez facilement modifier les noms des caractéristiques en éditant le fichier :

- `module/config/stats-config.mjs` : **Fichier centralisé pour toutes les statistiques**

Pour ajouter une nouvelle statistique :

1. Ouvrez `module/config/stats-config.mjs`
2. Ajoutez une nouvelle entrée dans `STATS_CONFIG`
3. Le système se mettra automatiquement à jour

Exemple pour ajouter une stat "Magie" :

```javascript
magie: {
  label: "Magie",
  description: "Pouvoir magique, mana, sorts",
  defaultValue: 30,
  minValue: 0,
  maxValue: 100,
  color: "#9c27b0",
  icon: "fas fa-magic"
}
```

Les valeurs par défaut et limites peuvent aussi être ajustées dans ce même fichier.

## Système de Combat et Dégâts

### Application automatique des dégâts

Le système inclut maintenant un système de combat automatisé qui utilise le système de ciblage de FoundryVTT :

#### Comment ça fonctionne :

1. **Sélectionnez une cible** en cliquant sur un token avec la touche `T` (ou clic droit → "Cibler")
2. **Lancez les dégâts** avec le bouton de dégâts sur une arme ou un sort
3. **Les dégâts sont appliqués automatiquement** en tenant compte de l'armure de la cible

#### Calcul des dégâts :

```
Dégâts finaux = max(0, Dégâts lancés - Armure totale de la cible)
```

#### Armure totale :

L'armure totale d'un personnage = **Armure de base** + **Bonus d'armure des équipements**

#### Exemples :

- **Attaque à 8 dégâts** contre une cible avec **3 d'armure** → **5 dégâts** infligés
- **Attaque à 4 dégâts** contre une cible avec **6 d'armure** → **0 dégât** (bloqué)
- **Sort à 12 dégâts** contre une cible **sans armure** → **12 dégâts** infligés

#### Messages de chat :

Le système affiche dans le chat :

- Les dégâts lancés
- L'armure de chaque cible
- Les dégâts finaux infligés
- Les dégâts bloqués par l'armure (le cas échéant)

#### Sans cible :

Si aucune cible n'est sélectionnée, les dégâts sont simplement affichés dans le chat sans être appliqués.
