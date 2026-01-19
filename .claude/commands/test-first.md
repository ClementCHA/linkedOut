---
description: Implémenter une feature en TDD strict
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: <description de la feature à implémenter>
---

# TDD Implementation

## Feature à implémenter
$ARGUMENTS

## Process Strict

Je vais implémenter cette feature en suivant le cycle TDD:

### Pour chaque comportement:

#### 1. 🔴 RED - Test qui échoue
```typescript
it('should [comportement attendu]', () => {
  // Arrange - préparer le contexte
  // Act - exécuter l'action
  // Assert - vérifier le résultat
});
```
Exécuter: `pnpm test` → DOIT échouer

#### 2. 🟢 GREEN - Code minimal
Écrire le MINIMUM de code pour faire passer le test.
Exécuter: `pnpm test` → DOIT passer

#### 3. 🔵 REFACTOR - Améliorer
- Éliminer la duplication
- Améliorer les noms
- Extraire si nécessaire
Exécuter: `pnpm test` → DOIT toujours passer

### Répéter pour le prochain comportement

## Principes à Respecter

- **Baby steps**: Un seul comportement à la fois
- **YAGNI**: Pas de code "au cas où"
- **Le test guide le design**: Ne pas pré-concevoir
- **Triangulation**: Ajouter des tests pour forcer la généralisation
