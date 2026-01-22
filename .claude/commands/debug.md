---
description: Analyser une erreur et proposer des solutions
argument-hint: <message d'erreur ou description du problème>
allowed-tools: Read, Grep, Glob, Bash
---

# Debug Session

## Problème à investiguer
$ARGUMENTS

## Étape 1 : Collecter les informations

### Si c'est une erreur avec stack trace
1. Identifier le fichier et la ligne d'origine
2. Lire le fichier concerné
3. Comprendre le contexte (fonction appelante, paramètres)

### Si c'est un comportement inattendu
1. Identifier où le comportement se produit
2. Tracer le flux de données
3. Vérifier les inputs/outputs

## Étape 2 : Analyser la cause

### Catégories d'erreurs courantes

| Erreur | Causes possibles |
|--------|------------------|
| `TypeError: Cannot read property 'x' of undefined` | Variable null/undefined, async non attendu |
| `ReferenceError` | Variable non déclarée, import manquant |
| `SyntaxError` | JSON invalide, typo dans le code |
| `ECONNREFUSED` | Service non démarré, mauvais port |
| `404 Not Found` | Route inexistante, mauvaise URL |
| `401/403` | Auth manquante/invalide |
| `CORS error` | Headers manquants côté API |

### Questions à se poser
- Qu'est-ce qui a changé récemment ?
- Le problème est-il reproductible ?
- Fonctionne-t-il dans un autre environnement ?

## Étape 3 : Hypothèses et vérifications

Pour chaque hypothèse :
1. Formuler l'hypothèse clairement
2. Définir comment la vérifier
3. Exécuter la vérification
4. Confirmer ou invalider

Format :
```
### Hypothèse 1 : [description]
**Vérification** : [commande ou action]
**Résultat** : ✅ Confirmé / ❌ Invalidé
```

## Étape 4 : Solution

### Format de réponse

```markdown
## Diagnostic

**Cause identifiée** : [description claire]

**Fichier concerné** : `path/to/file.ts:42`

**Code problématique** :
\`\`\`typescript
// Le code qui pose problème
\`\`\`

## Solution

**Correction** :
\`\`\`typescript
// Le code corrigé
\`\`\`

**Explication** : [pourquoi ça corrige le problème]

## Prévention

Pour éviter ce problème à l'avenir :
- [Suggestion 1]
- [Suggestion 2]
```

## Commandes utiles

```bash
# Logs récents
tail -f logs/app.log

# Vérifier un port
lsof -i :3001

# Tester une API
curl -v http://localhost:3001/api/health

# Vérifier les variables d'environnement
env | grep -i database

# Node debug
node --inspect src/index.ts
```

## Si le problème persiste

1. Reproduire dans un environnement minimal
2. Isoler la partie défaillante
3. Créer un test qui reproduit le bug
4. Corriger en TDD
