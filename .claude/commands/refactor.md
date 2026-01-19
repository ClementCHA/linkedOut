---
description: Refactoring guidé avec préservation des tests
allowed-tools: Read, Edit, Bash, Grep, Glob
argument-hint: <fichier ou zone à refactorer>
---

# Refactoring Session

## Cible
$ARGUMENTS

## Étapes Obligatoires

1. **Lancer les tests** pour établir la baseline: `pnpm test`
2. **Identifier** les code smells
3. **Appliquer** les refactorings un par un
4. **Vérifier** les tests après CHAQUE changement

## Catalogue de Refactorings (Martin Fowler)

### Extraction
- Extract Method
- Extract Class
- Extract Interface
- Extract Variable

### Inline
- Inline Method
- Inline Variable
- Inline Class

### Déplacement
- Move Method
- Move Field
- Move Statements

### Organisation des données
- Replace Primitive with Object
- Replace Magic Number with Constant
- Introduce Parameter Object
- Replace Temp with Query

### Simplification conditionnelle
- Decompose Conditional
- Replace Conditional with Polymorphism
- Replace Nested Conditional with Guard Clauses

## Règle d'Or

> "Refactoring: améliorer le design du code sans changer son comportement"

Les tests DOIVENT rester verts à chaque étape. Si un test échoue, annuler immédiatement le dernier changement.
