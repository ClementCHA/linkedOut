---
description: Créer une Pull Request avec description structurée
allowed-tools: Bash, Read, Grep
---

# Create Pull Request

## Étape 1 : Analyser la branche

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main..HEAD --stat
```

## Étape 2 : Vérifier les prérequis

- [ ] Tous les tests passent : `pnpm test`
- [ ] Lint OK : `pnpm lint`
- [ ] Build OK : `pnpm build`
- [ ] Branche à jour avec main

Si non à jour :
```bash
git fetch origin main
git rebase origin/main
```

## Étape 3 : Push la branche

```bash
git push -u origin $(git branch --show-current)
```

## Étape 4 : Analyser les changements

Pour chaque commit, identifier :
- Type de changement (feat, fix, refactor...)
- Fichiers impactés
- Tests ajoutés/modifiés

## Étape 5 : Créer la PR

```bash
gh pr create \
  --title "<type>(<scope>): <description>" \
  --body "## Summary

<Description concise des changements>

## Changes

- <Changement 1>
- <Changement 2>

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (no functional changes)

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing done

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Screenshots (if applicable)

N/A
"
```

## Étape 6 : Afficher le résultat

```bash
gh pr view --web
```

Afficher :
```
✅ PR créée : #<number>

Title: <title>
URL: <url>
Branch: <branch> → main

Reviewers à ajouter (optionnel) :
gh pr edit <number> --add-reviewer <username>
```
