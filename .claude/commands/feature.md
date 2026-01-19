---
description: Développer une feature complète (Design → TDD → Review)
argument-hint: <description de la feature à implémenter>
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Feature Development Workflow

Workflow complet pour développer une feature de A à Z.

## Phase 1 : Architecture (PAS de code)

**Objectif:** Comprendre et designer avant de coder.

1. Analyser la demande
2. Identifier les fichiers impactés
3. Proposer un design :
   - Quelles entities/value objects ?
   - Quel(s) use case(s) ?
   - Quel(s) port(s)/adapter(s) ?
   - Quelles routes HTTP ?
4. **ATTENDRE validation utilisateur** avant de continuer

Format du design :
```
## Design proposé

### Domain (@linkedout/core)
- [ ] Entity: ...
- [ ] Value Object: ...
- [ ] Port: ...
- [ ] Error: ...

### Application (@linkedout/api)
- [ ] Use Case: ...
- [ ] DTO: ...

### Adapters
- [ ] HTTP: ...
- [ ] Repository: ...

### Frontend (@linkedout/web)
- [ ] Page: ...
- [ ] Component: ...
```

⏸️ **STOP - Attendre "OK" ou feedback de l'utilisateur**

---

## Phase 2 : TDD (RED → GREEN → REFACTOR)

**Objectif:** Implémenter en suivant TDD strict.

Pour chaque élément du design validé :

### Étape RED
1. Écrire UN test qui échoue
2. Lancer le test, confirmer qu'il échoue
3. Montrer le test à l'utilisateur

### Étape GREEN
1. Écrire le code MINIMAL pour faire passer le test
2. Lancer le test, confirmer qu'il passe
3. Pas d'optimisation, pas de refacto

### Étape REFACTOR
1. Améliorer le code (lisibilité, nommage, structure)
2. Relancer les tests, confirmer qu'ils passent toujours

Répéter RED → GREEN → REFACTOR pour chaque comportement.

Ordre d'implémentation recommandé :
1. Domain (entities, value objects, errors)
2. Ports (interfaces)
3. Use Cases
4. Adapters (repository, HTTP controller)
5. Frontend (si applicable)

---

## Phase 3 : Review

**Objectif:** Vérifier la qualité du code produit.

Checklist SOLID :
- [ ] **S** - Chaque classe a une seule responsabilité ?
- [ ] **O** - Code extensible sans modification ?
- [ ] **L** - Sous-types substituables ?
- [ ] **I** - Interfaces spécifiques (pas de méthodes inutilisées) ?
- [ ] **D** - Dépendances vers abstractions (ports) ?

Checklist Clean Architecture :
- [ ] Domain sans dépendance framework ?
- [ ] Use cases sans logique métier (juste orchestration) ?
- [ ] Adapters implémentent les ports ?
- [ ] Erreurs métier spécifiques (pas de `throw new Error()`) ?

Checklist Tests :
- [ ] Tests unitaires pour use cases ?
- [ ] Tests pour le repository ?
- [ ] Couverture des cas d'erreur ?

Si problèmes détectés → Proposer des corrections.

---

## Résumé final

À la fin, afficher :

```
## ✅ Feature terminée

### Fichiers créés/modifiés
- ...

### Tests ajoutés
- ...

### Pour tester
\`\`\`bash
pnpm test
pnpm dev
# Puis tester : POST/GET/DELETE http://localhost:3001/api/...
\`\`\`
```
