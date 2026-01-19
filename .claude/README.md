# Claude Code - Guide d'utilisation

## Commands

Les commands sont des workflows guidés. Syntaxe : `/command <argument>`

### /feature
Développer une feature complète avec le workflow Design → TDD → Review.

```
/feature ajouter la suppression d'un utilisateur
/feature créer un système de commandes avec panier
/feature ajouter l'authentification JWT
```

**Flow :**
1. Design de l'architecture (attend validation)
2. Implémentation TDD (RED → GREEN → REFACTOR)
3. Review SOLID + Clean Architecture

---

### /refactor
Refactoring guidé avec préservation des tests.

```
/refactor apps/api/src/application/use-cases/CreateUserUseCase.ts
/refactor apps/api/src/adapters
/refactor packages/core/src/entities
```

**Flow :**
1. Lance les tests (doivent passer)
2. Identifie les code smells
3. Applique les refactorings un par un
4. Vérifie les tests après chaque étape

---

### /test-first
Implémenter une feature en TDD strict.

```
/test-first ajouter la validation du nom utilisateur
/test-first implémenter GetUserByEmailUseCase
```

**Flow :**
1. RED : Écrit un test qui échoue
2. GREEN : Code minimal pour passer
3. REFACTOR : Améliore sans casser

---

### /review-solid
Audit SOLID complet d'un fichier ou module.

```
/review-solid apps/api/src/application/use-cases/CreateUserUseCase.ts
/review-solid apps/api/src/adapters
/review-solid packages/core
```

**Output :**
- Score par principe (S/O/L/I/D)
- Violations détectées
- Recommandations

---

## Skills

Les skills sont des patterns réutilisables. Syntaxe : `Utilise la skill X pour...`

### clean-architecture
Patterns pour l'architecture hexagonale.

```
Utilise la skill clean-architecture pour créer un OrderEntity
Utilise la skill clean-architecture pour créer un use case de paiement
```

**Contenu :**
- Structure Entity (factory, reconstitute, immutabilité)
- Structure Value Object (validation, equals)
- Structure Use Case (command/query, interface)
- Structure Repository (mapping domain ↔ persistence)
- Erreurs métier

---

### react-best-practices
45 règles de performance React/Next.js (Vercel Engineering).

```
Utilise la skill react-best-practices pour optimiser ce composant
Utilise la skill react-best-practices pour review cette page
```

**Contenu :**
- Eliminating waterfalls (Promise.all, Suspense)
- Bundle size (dynamic imports, tree-shaking)
- Server Components (cache, déduplication)
- Re-render optimization (useCallback, useMemo)
- Rendering performance (virtualisation, content-visibility)

---

## Agents

Les agents sont des personas spécialisés. Syntaxe : `@agent instruction`

### @architect
Expert en design et architecture. Ne code pas, réfléchit.

```
@architect design un système de notifications
@architect comment structurer un module de paiement ?
@architect review l'architecture actuelle
```

---

### @tdd-coach
Coach TDD strict. Guide le développement RED → GREEN → REFACTOR.

```
@tdd-coach implémente DeleteUserUseCase
@tdd-coach ajoute la validation email unique
```

---

### @code-reviewer
Auditeur code quality. Review SOLID, Clean Code, Clean Architecture.

```
@code-reviewer review apps/api/src/application
@code-reviewer vérifie ce composant React
```

---

## Exemples de prompts

### Nouvelle feature complète
```
/feature ajouter un système de favoris utilisateur
```

### Juste le design
```
@architect design un système de favoris utilisateur
```

### Juste l'implémentation TDD
```
@tdd-coach implémente AddToFavoritesUseCase
```

### Juste la review
```
@code-reviewer review apps/api/src/application/use-cases
```

### Refactoring
```
/refactor apps/api/src/adapters/in/http/UserController.ts
```

### Audit SOLID
```
/review-solid packages/core/src/entities
```

### Optimisation React
```
Utilise la skill react-best-practices pour optimiser apps/web/src/app/users/page.tsx
```

### Créer une entity
```
Utilise la skill clean-architecture pour créer une entity Product
```

---

## Raccourcis utiles

| Action | Commande |
|--------|----------|
| Nouvelle feature | `/feature <description>` |
| Refactoring | `/refactor <path>` |
| TDD | `/test-first <description>` |
| Audit SOLID | `/review-solid <path>` |
| Design only | `@architect <question>` |
| Review only | `@code-reviewer <path>` |
