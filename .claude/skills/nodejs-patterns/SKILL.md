---
name: nodejs-patterns
description: Patterns Node.js backend. Event loop, async, streams, HTTP, process. Chargé pour développement backend Node.js.
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Node.js Development Skill

Patterns et best practices pour le développement Node.js moderne.

## Quand utiliser ce skill

- APIs RESTful et services backend
- CLI tools et utilitaires
- Microservices et systèmes distribués
- Applications temps réel (WebSockets, SSE)
- Processing de fichiers et transformation de données
- Workers et jobs en background

## Event Loop

Le cœur de Node.js - I/O non-bloquant malgré le single-thread JavaScript.

```typescript
// Ordre d'exécution des phases
// 1. Timers (setTimeout, setInterval)
// 2. Pending callbacks (I/O callbacks)
// 3. Idle, prepare (interne)
// 4. Poll (nouveaux événements I/O)
// 5. Check (setImmediate)
// 6. Close callbacks (socket.on('close'))

console.log('1 - Start');

setTimeout(() => console.log('2 - Timeout'), 0);
setImmediate(() => console.log('3 - Immediate'));
Promise.resolve().then(() => console.log('4 - Promise'));
process.nextTick(() => console.log('5 - Next Tick'));

console.log('6 - End');

// Output: 1, 6, 5, 4, 2, 3
// (nextTick et Promises avant les autres phases)
```

### Ne pas bloquer l'event loop

```typescript
// ❌ Bloquant
const data = fs.readFileSync('large-file.txt');

// ✅ Non-bloquant
const data = await fs.promises.readFile('large-file.txt');

// ❌ CPU-intensive bloque l'event loop
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// ✅ Offload vers Worker Threads
import { Worker } from 'worker_threads';

function computeInWorker(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./fibonacci-worker.js', { workerData: n });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

## Modules (ES Modules)

Le projet utilise ES Modules (`"type": "module"` dans package.json).

```typescript
// math.ts - Export
export function add(a, b) { return a + b; }
export default class Calculator { }

// app.ts - Import
import { add } from './math.js';
import Calculator from './math.js';
```

### Modules built-in

```typescript
import fs from 'fs/promises';        // File system (async)
import path from 'path';             // Path utilities
import http from 'http';             // HTTP server
import crypto from 'crypto';         // Cryptography
import os from 'os';                 // Operating system
import { EventEmitter } from 'events'; // Event emitter
import { Readable, Writable, Transform } from 'stream'; // Streams
import { Worker } from 'worker_threads'; // Workers
```

## Async Programming

### Callbacks (legacy)

```typescript
// Pattern error-first
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log(data);
});
```

### Promises

```typescript
import fs from 'fs/promises';

// Chaînage
fs.readFile('file1.txt', 'utf8')
  .then(data1 => fs.readFile('file2.txt', 'utf8'))
  .then(data2 => console.log(data2))
  .catch(err => console.error(err));

// Parallèle
const [data1, data2, data3] = await Promise.all([
  fs.readFile('file1.txt', 'utf8'),
  fs.readFile('file2.txt', 'utf8'),
  fs.readFile('file3.txt', 'utf8')
]);

// Utilities
Promise.race([fetch(url1), fetch(url2)]); // Premier à finir
Promise.allSettled([p1, p2, p3]); // Attend tous, retourne tous les résultats
Promise.any([p1, p2]); // Premier succès
```

### Async/Await (moderne)

```typescript
// Séquentiel
async function readFilesSequentially() {
  const data1 = await fs.readFile('file1.txt', 'utf8');
  const data2 = await fs.readFile('file2.txt', 'utf8');
  return [data1, data2];
}

// Parallèle
async function readFilesParallel() {
  const [data1, data2] = await Promise.all([
    fs.readFile('file1.txt', 'utf8'),
    fs.readFile('file2.txt', 'utf8')
  ]);
  return [data1, data2];
}

// Error handling
async function robustOperation() {
  try {
    return { success: true, data: await riskyOperation() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

### Promisify (legacy callbacks)

```typescript
import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);

// Note: préférer fs/promises directement
import fsPromises from 'fs/promises';
const data = await fsPromises.readFile('file.txt', 'utf8');
```

## Streams

### Types de streams

```typescript
import { Readable, Writable, Transform } from 'stream';
import fs from 'fs';

// 1. Readable
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024 // 64KB chunks
});

readStream.on('data', (chunk) => console.log('Chunk:', chunk.length));
readStream.on('end', () => console.log('Done'));

// 2. Writable
const writeStream = fs.createWriteStream('output.txt');
writeStream.write('Hello ');
writeStream.write('World\n');
writeStream.end();

// 3. Pipe - connecter des streams
fs.createReadStream('input.txt')
  .pipe(fs.createWriteStream('output.txt'));

// 4. Transform
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

fs.createReadStream('input.txt')
  .pipe(new UpperCaseTransform())
  .pipe(fs.createWriteStream('output.txt'));
```

### Pipeline (gestion erreurs automatique)

```typescript
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';
import fs from 'fs';

await pipeline(
  fs.createReadStream('input.txt'),
  createGzip(),
  fs.createWriteStream('input.txt.gz')
);
```

## File System

```typescript
import fs from 'fs/promises';
import path from 'path';

// Lire
const data = await fs.readFile('file.txt', 'utf8');
const json = JSON.parse(await fs.readFile('config.json', 'utf8'));

// Écrire
await fs.writeFile('output.txt', 'Hello World');
await fs.appendFile('log.txt', 'New entry\n');

// Stats
const stats = await fs.stat('file.txt');
console.log({ size: stats.size, isFile: stats.isFile() });

// Vérifier existence
async function fileExists(filename) {
  try {
    await fs.access(filename);
    return true;
  } catch {
    return false;
  }
}

// Opérations
await fs.copyFile('source.txt', 'dest.txt');
await fs.rename('old.txt', 'new.txt');
await fs.unlink('file.txt'); // Delete
await fs.mkdir('dir', { recursive: true });
await fs.rm('dir', { recursive: true, force: true });

// Lire répertoire
const files = await fs.readdir('dir', { withFileTypes: true });
for (const entry of files) {
  if (entry.isFile()) console.log('File:', entry.name);
  if (entry.isDirectory()) console.log('Dir:', entry.name);
}
```

### Path utilities

```typescript
path.join('/users', 'john', 'file.txt');  // /users/john/file.txt
path.resolve('docs', 'file.txt');          // /cwd/docs/file.txt
path.dirname('/users/john/file.txt');      // /users/john
path.basename('/users/john/file.txt');     // file.txt
path.extname('file.txt');                  // .txt
path.parse('/users/john/file.txt');        // { root, dir, base, ext, name }
```

## HTTP Server

```typescript
import http from 'http';

// Serveur basique
const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (url === '/api/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else if (url === '/api/data' && method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: data }));
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3000);
```

### Fetch (Node.js 18+)

```typescript
// GET
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// POST
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});
```

## Process & Environment

```typescript
// Info process
console.log('Node:', process.version);
console.log('Platform:', process.platform);
console.log('PID:', process.pid);
console.log('CWD:', process.cwd());
console.log('Memory:', process.memoryUsage());

// Arguments CLI
// node app.js --port 3000
const args = process.argv.slice(2);

// Variables d'environnement
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';

// Exit
process.exit(0); // Success
process.exit(1); // Error

// Signals
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
```

## Crypto

```typescript
import crypto from 'crypto';

// Random
const randomBytes = crypto.randomBytes(16).toString('hex');

// Hash (one-way)
const hash = crypto.createHash('sha256').update('data').digest('hex');

// HMAC
const hmac = crypto.createHmac('sha256', 'secret').update('message').digest('hex');

// Password hashing
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === hashToVerify;
}
```

## EventEmitter

```typescript
import { EventEmitter } from 'events';

class Logger extends EventEmitter {
  log(message) {
    this.emit('log', { message, timestamp: Date.now() });
  }
}

const logger = new Logger();
logger.on('log', (data) => console.log(`[${data.timestamp}] ${data.message}`));
logger.log('Application started');
```

Voir [patterns.md](patterns.md) pour les patterns avancés (API, DB, Auth, Tests, Déploiement).
