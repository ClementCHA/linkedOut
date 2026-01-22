---
description: Analyser les changements et créer un commit conventionnel
allowed-tools: Bash, Read, Grep
---

# Smart Commit

## Étape 1 : Analyser les changements

Exécuter en parallèle :
```bash
git status
git diff --cached --stat
git diff --cached
git log --oneline -5
```

## Étape 2 : Classifier le changement

Déterminer le type selon Conventional Commits :

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring sans changement de comportement |
| `test` | Ajout/modification de tests |
| `docs` | Documentation |
| `style` | Formatage, pas de changement de code |
| `chore` | Maintenance, dépendances |
| `perf` | Amélioration de performance |

## Étape 3 : Générer le message

Format :
```
<type>(<scope>): <description>

[body optionnel]

[footer optionnel]
```

Règles :
- Description en minuscules, pas de point final
- Impératif présent ("add" pas "added")
- Max 72 caractères pour la première ligne
- Scope = module concerné (api, web, core, extension)

Exemples :
```
feat(api): add vote submission endpoint
fix(extension): handle missing post URN gracefully
refactor(core): extract VoteType validation to value object
test(api): add CreateUserUseCase unit tests
chore: update dependencies
```

## Étape 4 : Créer le commit

```bash
git add <fichiers pertinents>
git commit -m "<message>"
```

⚠️ Ne PAS utiliser `git add .` sauf si tous les fichiers sont pertinents.
⚠️ Vérifier qu'aucun fichier sensible n'est inclus (.env, secrets, etc.)

## Étape 5 : Confirmer

```bash
git log -1 --stat
```

Afficher le résultat au format :
```
✅ Commit créé : <hash court>

<type>(<scope>): <description>

Fichiers modifiés :
- file1.ts
- file2.ts
```
