const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

// Connect to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ------------------ MIDDLEWARE ------------------

function authenticateUser(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user; // contains { id, role }
    next();
  });
}

function authenticateAdmin(req, res, next) {
  authenticateUser(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  });
}

// ------------------ USER ROUTES ------------------

// Register
app.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, subscribed, balance) VALUES ($1, $2, $3, $4, false, 0) RETURNING *',
      [username, email, hashedPassword, role || 'student']
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(400).json({ message: 'User not found' });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

// Profile (unique per user)
app.get('/profile', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role, subscribed, balance FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching profile');
  }
});

// Subscribe (unique per user)
app.post('/subscribe', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET subscribed = true WHERE id = $1 RETURNING *',
      [req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Subscription successful', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error subscribing user');
  }
});

// Contests
app.get('/contests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contests ORDER BY round_number ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching contests');
  }
});

// Participate (unique per user)
app.post('/participate', authenticateUser, async (req, res) => {
  const { contest_id, answer } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO participations (user_id, contest_id, answer) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, contest_id, answer]
    );
    res.json({ message: 'Participation successful', participation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error participating in contest');
  }
});

// Winners
app.get('/winners', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.contest_id, r.user_id, u.username, u.email, c.round_number, c.reward, r.finish_time
      FROM results r
      JOIN users u ON r.user_id = u.id
      JOIN contests c ON r.contest_id = c.id
      WHERE r.is_winner = true
      ORDER BY r.finish_time ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching winners');
  }
});

// Leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, balance
      FROM users
      ORDER BY balance DESC, username ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching leaderboard');
  }
});

// ------------------ QUESTIONS ROUTES ------------------

app.post('/admin/questions', authenticateAdmin, async (req, res) => {
  const { contest_id, text, correct_answer } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO questions (contest_id, text, correct_answer) VALUES ($1, $2, $3) RETURNING *',
      [contest_id, text, correct_answer]
    );
    res.json({ message: 'Question added successfully', question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding question');
  }
});

app.get('/questions/:contest_id', async (req, res) => {
  const { contest_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM questions WHERE contest_id = $1 ORDER BY id ASC',
      [contest_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching questions for round');
  }
});

// ------------------ ADMIN ROUTES ------------------

app.get('/admin/users', authenticateAdmin, async (req, res) => {
  const result = await pool.query('SELECT id, username, email, subscribed, balance, role FROM users');
  res.json(result.rows);
});

app.post('/admin/contest', authenticateAdmin, async (req, res) => {
  const { round_number, reward, timer_duration } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO contests (round_number, reward, timer_duration) VALUES ($1, $2, $3) RETURNING *',
      [round_number, reward, timer_duration]
    );
    res.json({ message: 'Contest created successfully', contest: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating contest');
  }
});

app.post('/admin/winner', authenticateAdmin, async (req, res) => {
  const { contest_id, user_id, reward } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO winners (contest_id, user_id, reward, finish_time, round_number, username, email) ' +
      'SELECT $1, $2, $3, NOW(), c.round_number, u.username, u.email ' +
      'FROM contests c JOIN users u ON u.id = $2 WHERE c.id = $1 RETURNING *',
      [contest_id, user_id, reward]
    );
    await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [reward, user_id]);
    res.json({ message: 'Winner selected successfully', winner: result.rows[0] });
  } catch (err) {
     console.error(err);
    res.status(500).send('Error selecting winner');
  }
});

// Contest History (unique per user)
app.get('/history', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.contest_id, r.user_id, u.username, c.round_number, c.reward, r.finish_time, r.is_winner
      FROM results r
      JOIN users u ON r.user_id = u.id
      JOIN contests c ON r.contest_id = c.id
      WHERE r.user_id = $1
      ORDER BY r.finish_time DESC
    `, [req.user.id]);

    const history = result.rows.map(row => ({
      contest_id: row.contest_id,
      round_number: row.round_number,
      winner: row.is_winner ? row.username : null, // show winner if this user won
      is_winner: row.is_winner,
      finish_time: row.finish_time,
      reward: row.reward
    }));

    res.json(history);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).send("Error fetching history");
  }
});


// ------------------ SERVER ------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
