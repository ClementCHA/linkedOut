---
description: Créer un composant React avec les best practices Next.js/Vercel
argument-hint: <NomDuComposant - description>
allowed-tools: Read, Write, Edit, Grep, Glob
---

# React Component Generator

## Composant demandé
$ARGUMENTS

## Étape 1 : Analyser les besoins

Questions à déterminer :
1. **Server ou Client component ?**
   - Interactivité (onClick, onChange) → Client
   - Data fetching → Server
   - Hooks (useState, useEffect) → Client

2. **Où le placer ?**
   - Réutilisable → `packages/ui/src/components/`
   - Spécifique à l'app → `apps/web/src/components/`

3. **Props nécessaires ?**

## Étape 2 : Design

```markdown
### Composant : <NomDuComposant>

**Type** : Server Component / Client Component
**Location** : packages/ui | apps/web
**Description** : [ce que fait le composant]

**Props** :
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| ... | ... | ... | ... | ... |

**États internes** : (si client)
- [état 1]
- [état 2]

**Événements** :
- onChange
- onClick
```

## Étape 3 : Implémenter

### Template Server Component

```typescript
// components/NomDuComposant.tsx

interface NomDuComposantProps {
  title: string;
  children?: React.ReactNode;
}

export function NomDuComposant({ title, children }: NomDuComposantProps) {
  return (
    <div className="...">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

### Template Client Component

```typescript
// components/NomDuComposant.tsx
'use client';

import { useState, useCallback } from 'react';

interface NomDuComposantProps {
  initialValue?: string;
  onChange?: (value: string) => void;
}

export function NomDuComposant({
  initialValue = '',
  onChange,
}: NomDuComposantProps) {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      className="..."
    />
  );
}
```

### Template avec data fetching (Server)

```typescript
// components/UserList.tsx
import { getUsers } from '@/lib/api';

interface UserListProps {
  limit?: number;
}

export async function UserList({ limit = 10 }: UserListProps) {
  const users = await getUsers({ limit });

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Règles à Respecter

### Performance
- [ ] `'use client'` au plus bas niveau possible
- [ ] Pas d'objets inline dans les props
- [ ] `useCallback` pour les handlers passés en props
- [ ] `useMemo` pour les calculs coûteux
- [ ] Keys stables (pas d'index)

### Accessibilité
- [ ] Labels sur les inputs
- [ ] ARIA attributes si nécessaire
- [ ] Keyboard navigation
- [ ] Contraste suffisant

### Style
- [ ] Tailwind utility classes
- [ ] Responsive (mobile-first)
- [ ] Dark mode si applicable

## Étape 4 : Export

Si dans `packages/ui`, ajouter l'export :

```typescript
// packages/ui/src/index.ts
export { NomDuComposant } from './components/NomDuComposant';
```

## Étape 5 : Résumé

```markdown
## ✅ Composant créé

**Fichier** : `[path]/NomDuComposant.tsx`
**Type** : Server/Client Component

### Usage

\`\`\`tsx
import { NomDuComposant } from '[path]';

<NomDuComposant prop="value" />
\`\`\`

### Tests (si applicable)

\`\`\`bash
pnpm --filter @linkedout/web test
\`\`\`
```
