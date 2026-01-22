# Node.js Advanced Patterns

## REST API avec Express/Hono

```typescript
import express from 'express';
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = await db.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (err) {
    res.status(400).json({ error: { message: err.message } });
  }
});

// Error handling middleware (doit être dernier)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: { message: 'Internal server error' } });
});

app.listen(process.env.PORT || 3000);
```

## Database Integration

### PostgreSQL avec pg

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Query simple
async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
}

// Query paramétrée (anti-injection)
async function getUserById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
}

// Transaction
async function transferCredits(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [amount, fromId]);
    await client.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, toId]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

### MongoDB avec Mongoose

```typescript
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URL);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// CRUD
const user = await User.create({ name: 'John', email: 'john@example.com' });
const users = await User.find();
const userById = await User.findById(id);
await User.findByIdAndUpdate(id, { name: 'Jane' });
await User.findByIdAndDelete(id);
```

## Authentication

### JWT + bcrypt

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Hash password
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Verify password
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: { message: 'No token' } });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: { message: 'Invalid token' } });
  }
  req.user = decoded;
  next();
}

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }

  const token = generateToken(user);
  res.json({ data: { token, user: { id: user.id, email: user.email } } });
});
```

## Error Handling

```typescript
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

// Async handler wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await db.getUserById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.json({ data: user });
}));

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  console.error(err);
  res.status(statusCode).json({ error: { message } });
});

// Process-level error handling
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});
```

## Security

```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { body, validationResult } from 'express-validator';

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
}));

// Input validation
app.post('/api/users',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').trim().notEmpty().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { details: errors.array() } });
    }
    next();
  }
);

// Validate required env vars
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
}
```

## Performance

```typescript
import compression from 'compression';
import NodeCache from 'node-cache';

// Compression
app.use(compression());

// Caching
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

app.get('/api/data', async (req, res) => {
  const cached = cache.get('data');
  if (cached) return res.json({ data: cached });

  const data = await fetchExpensiveData();
  cache.set('data', data);
  res.json({ data });
});

// Pagination
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.getUsers({ limit, offset }),
    db.countUsers()
  ]);

  res.json({
    data: users,
    meta: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

// Stream large responses
app.get('/api/export', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.write('[');

  let first = true;
  const cursor = User.find().cursor();

  cursor.on('data', (user) => {
    if (!first) res.write(',');
    res.write(JSON.stringify(user));
    first = false;
  });

  cursor.on('end', () => {
    res.write(']');
    res.end();
  });
});

// Éviter N+1 queries
// ❌ Mauvais
const users = await User.find();
for (const user of users) {
  user.posts = await Post.find({ userId: user.id }); // N queries!
}

// ✅ Bon
const users = await User.find().populate('posts'); // 1-2 queries
```

## Testing

```typescript
import request from 'supertest';
import app from './app.js';

describe('GET /api/users', () => {
  it('should return all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const userData = { name: 'John', email: 'john@example.com' };

    const res = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);

    expect(res.body.data.name).toBe(userData.name);
  });

  it('should return 400 for invalid data', async () => {
    await request(app)
      .post('/api/users')
      .send({})
      .expect(400);
  });
});

// Mocking
jest.mock('./database');
import db from './database.js';

test('getUser returns user', async () => {
  db.getUserById.mockResolvedValue({ id: 1, name: 'John' });

  const user = await getUser(1);
  expect(user.name).toBe('John');
});
```

## Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Request logging
import morgan from 'morgan';
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));

// Usage
logger.info('Server started', { port: 3000 });
logger.error('Database error', { error: err.message });
```

## Graceful Shutdown

```typescript
const server = app.listen(PORT);

async function shutdown(signal) {
  console.log(`${signal} received, shutting down gracefully`);

  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');

    // Close database connections
    await pool.end();
    console.log('Database pool closed');

    process.exit(0);
  });

  // Force shutdown after 30s
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Metrics
import v8 from 'v8';
app.get('/metrics', (req, res) => {
  res.json({
    memory: process.memoryUsage(),
    heap: v8.getHeapStatistics(),
    cpu: process.cpuUsage(),
    uptime: process.uptime()
  });
});
```

## Worker Threads

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  // Main thread
  function runWorker(data) {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, { workerData: data });
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
      });
    });
  }

  // Usage
  const result = await runWorker({ task: 'heavy-computation', data: [...] });
} else {
  // Worker thread
  const { task, data } = workerData;

  // Do CPU-intensive work
  const result = heavyComputation(data);

  parentPort.postMessage(result);
}
```

## Cluster Mode

```typescript
import cluster from 'cluster';
import os from 'os';
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`);
    cluster.fork();
  });
} else {
  // Workers share the TCP connection
  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started`);
  });
}
```
