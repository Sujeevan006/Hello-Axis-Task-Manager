import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database setup
let db;

const initDB = async () => {
  const dbPath = join(__dirname, 'database.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      role TEXT NOT NULL,
      avatar TEXT,
      needsPasswordChange INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tasks table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignedTo TEXT,
      dueDate TEXT,
      history TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES users(id),
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  console.log('✅ Database initialized successfully');
};

// ==================== USER ROUTES ====================

app.get('/api/users', async (req, res) => {
  try {
    const users = await db.all('SELECT * FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      req.params.id
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === 'admin@gmail.com') {
      let admin = await db.get('SELECT * FROM users WHERE email = ?', email);

      if (!admin) {
        await db.run(
          `
          INSERT INTO users (id, name, email, role, needsPasswordChange)
          VALUES (?, ?, ?, ?, ?)
        `,
          'admin-001',
          'Admin',
          'admin@gmail.com',
          'admin',
          1
        );
        admin = await db.get('SELECT * FROM users WHERE email = ?', email);
        return res.json({ success: true, user: admin });
      }

      if (!admin.password) {
        return res.json({ success: true, user: admin });
      }

      if (!password) {
        return res
          .status(401)
          .json({ success: false, error: 'Password is required' });
      }

      if (admin.password === password) {
        return res.json({ success: true, user: admin });
      }

      return res
        .status(401)
        .json({ success: false, error: 'Incorrect password' });
    }

    const user = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        error: 'Account not fully set up. Please contact admin.',
      });
    }

    if (user.password === password) {
      return res.json({ success: true, user });
    }

    return res
      .status(401)
      .json({ success: false, error: 'Incorrect password' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { id, name, email, role, password, needsPasswordChange } = req.body;

    await db.run(
      `
      INSERT INTO users (id, name, email, role, password, needsPasswordChange)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      id,
      name,
      email,
      role,
      password || null,
      needsPasswordChange ? 1 : 0
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', id);
    res.status(201).json(user);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates).filter((key) => key !== 'id');
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => {
      if (field === 'needsPasswordChange') {
        return updates[field] ? 1 : 0;
      }
      return updates[field];
    });

    await db.run(
      `
      UPDATE users 
      SET ${setClause}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      ...values,
      id
    );

    const user = await db.get('SELECT * FROM users WHERE id = ?', id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM users WHERE id = ?',
      req.params.id
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TASK ROUTES ====================

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await db.all('SELECT * FROM tasks ORDER BY createdAt DESC');
    res.json(
      tasks.map((t) => ({
        ...t,
        history: t.history ? JSON.parse(t.history) : [],
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      status,
      priority,
      assignedTo,
      dueDate,
      createdBy,
    } = req.body;

    await db.run(
      `
      INSERT INTO tasks (id, title, description, status, priority, assignedTo, dueDate, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      id,
      title,
      description || null,
      status,
      priority,
      assignedTo || null,
      dueDate || null,
      createdBy
    );

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    res.status(201).json({ ...task, history: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates).filter((key) => key !== 'id');
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => updates[field]);

    await db.run(
      `
      UPDATE tasks 
      SET ${setClause}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      ...values,
      id
    );

    const task = await db.get('SELECT * FROM tasks WHERE id = ?', id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM tasks WHERE id = ?',
      req.params.id
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SERVER ====================

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
