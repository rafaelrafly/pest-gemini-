const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./config/db');
const { generateServiceReportPDF } = require('./utils/pdfGenerator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_pest_jwt_key_2026';

// Initialize DB on startup
initDB();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date(), version: '1.0.0' });
});

// Auth Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, username: user.username, nama: user.nama, jabatan: user.jabatan, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// Seed Initial Admin User if not exists
app.post('/api/auth/seed', async (req, res) => {
  try {
    const adminCheck = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (adminCheck.rows.length > 0) {
      return res.json({ message: 'Admin already seeded' });
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userId = uuidv4();
    await pool.query(
      'INSERT INTO users (id, username, email, password_hash, nama, jabatan) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'admin', 'admin@proteksipest.com', hashedPassword, 'Wawan Gunawan', 'Senior Technical Lead']
    );
    res.json({ message: 'Admin user seeded successfully (username: admin, password: admin123)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Seed error' });
  }
});

// Get Customers
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create Customer
app.post('/api/customers', async (req, res) => {
  try {
    const { nama, company_name, contact_person, phone, email, alamat, category } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO customers (id, nama, company_name, contact_person, phone, email, alamat, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, nama, company_name, contact_person, phone, email, alamat, category]
    );
    res.status(201).json({ message: 'Customer created successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, c.company_name, c.nama as customer_name, c.alamat as customer_address 
      FROM tasks t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      ORDER BY t.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create Task
app.post('/api/tasks', async (req, res) => {
  try {
    const { customer_id, date, time, sasaran_pekerjaan, deskripsi, deadline } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tasks (id, customer_id, date, time, sasaran_pekerjaan, deskripsi, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, customer_id, date, time, sasaran_pekerjaan, deskripsi, deadline]
    );
    res.status(201).json({ message: 'Task created successfully', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Generate Service Report PDF
app.post('/api/service-reports/pdf', async (req, res) => {
  try {
    const reportData = req.body;
    generateServiceReportPDF(reportData, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

app.listen(PORT, () => {
  console.log(`Pest Control Operations Server running on port ${PORT}`);
});
