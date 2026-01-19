---
description: Audit SOLID complet d'un fichier ou module
allowed-tools: Read, Grep, Glob
argument-hint: <chemin du fichier ou dossier>
---

# SOLID Audit

## Cible de l'audit
$ARGUMENTS

## Grille d'Évaluation

### S - Single Responsibility Principle
**Question**: Cette classe a-t-elle une seule raison de changer?

| Score | Critère |
|-------|---------|
| 5 | Une responsabilité unique et claire |
| 4 | Responsabilité principale claire, quelques méthodes utilitaires |
| 3 | 2-3 responsabilités identifiables |
| 2 | Responsabilités multiples mélangées |
| 1 | God class, fait tout |

### O - Open/Closed Principle
**Question**: Peut-on étendre le comportement sans modifier le code existant?

| Score | Critère |
|-------|---------|
| 5 | Extension via interfaces/abstractions |
| 4 | Extensible avec modifications mineures |
| 3 | Nécessite modifications pour extension |
| 2 | Fortement couplé, difficile à étendre |
| 1 | Monolithique, impossible à étendre |

### L - Liskov Substitution Principle
**Question**: Les sous-types peuvent-ils remplacer leur type parent?

| Score | Critère |
|-------|---------|
| 5 | Substitution parfaite |
| 4 | Substitution avec précautions mineures |
| 3 | Quelques comportements divergents |
| 2 | Substitution dangereuse |
| 1 | Héritage cassé |

### I - Interface Segregation Principle
**Question**: Les interfaces sont-elles spécifiques aux clients?

| Score | Critère |
|-------|---------|
| 5 | Interfaces ciblées et minimales |
| 4 | Interfaces cohérentes |
| 3 | Quelques méthodes non utilisées |
| 2 | Interfaces trop larges |
| 1 | Interface "fourre-tout" |

### D - Dependency Inversion Principle
**Question**: Les dépendances sont-elles vers des abstractions?

| Score | Critère |
|-------|---------|
| 5 | Toutes dépendances via interfaces |
| 4 | Majorité via abstractions |
| 3 | Mix abstrait/concret |
| 2 | Majorité de dépendances concrètes |
| 1 | Couplage fort partout |

## Format du Rapport

```
## Score Global: X/25

| Principe | Score | Commentaire |
|----------|-------|-------------|
| S | X/5 | ... |
| O | X/5 | ... |
| L | X/5 | ... |
| I | X/5 | ... |
| D | X/5 | ... |

## Violations Détaillées
[Par ordre de sévérité]

## Recommandations
[Actions concrètes pour améliorer]
```
