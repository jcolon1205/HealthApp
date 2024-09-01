require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET); // Add this line to check if JWT_SECRET is loaded

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Create tables if they don't exist
const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        case_worker_id VARCHAR(50) NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10),
        social_security_number VARCHAR(11),
        address VARCHAR(100),
        city VARCHAR(50),
        state VARCHAR(2),
        zip_code VARCHAR(10),
        phone_number VARCHAR(15),
        email VARCHAR(100),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(15),
        blood_type VARCHAR(3),
        allergies TEXT,
        medical_conditions TEXT,
        medications TEXT,
        insurance_provider VARCHAR(50),
        insurance_policy_number VARCHAR(50),
        primary_care_physician VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);

      CREATE OR REPLACE FUNCTION update_modified_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patient_modtime') THEN
          CREATE TRIGGER update_patient_modtime
          BEFORE UPDATE ON patients
          FOR EACH ROW
          EXECUTE FUNCTION update_modified_column();
        END IF;
      END $$;
    `);
    console.log('Database initialized with patients table');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
};

initDb();

app.get('/api/clients', async (req, res) => {
  try {
    // In a real app, you'd get the caseWorkerId from the authenticated user
    const caseWorkerId = req.query.caseWorkerId;
    const result = await pool.query(
      'SELECT * FROM clients WHERE case_worker_id = $1',
      [caseWorkerId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Error fetching clients' });
  }
});

app.post('/api/members', async (req, res) => {
  try {
    const { 
      first_name, last_name, date_of_birth, gender, social_security_number,
      address, city, state, zip_code, phone_number, email,
      emergency_contact_name, emergency_contact_phone, blood_type,
      allergies, medical_conditions, medications,
      insurance_provider, insurance_policy_number, primary_care_physician
    } = req.body;

    const result = await pool.query(
      `INSERT INTO members (
        first_name, last_name, date_of_birth, gender, social_security_number,
        address, city, state, zip_code, phone_number, email,
        emergency_contact_name, emergency_contact_phone, blood_type,
        allergies, medical_conditions, medications,
        insurance_provider, insurance_policy_number, primary_care_physician
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING id`,
      [first_name, last_name, date_of_birth, gender, social_security_number,
       address, city, state, zip_code, phone_number, email,
       emergency_contact_name, emergency_contact_phone, blood_type,
       allergies, medical_conditions, medications,
       insurance_provider, insurance_policy_number, primary_care_physician]
    );

    res.status(201).json({ id: result.rows[0].id, message: 'Member added successfully' });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Error adding member' });
  }
});

app.post('/api/members/check-duplicate', async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth } = req.body;
    console.log('Checking for duplicate:', { first_name, last_name, date_of_birth }); // Debug log

    const result = await pool.query(
      `SELECT * FROM members 
       WHERE first_name = $1 AND last_name = $2 AND date_of_birth = $3`,
      [first_name, last_name, date_of_birth]
    );

    const isDuplicate = result.rows.length > 0;
    console.log('Duplicate check result:', isDuplicate); // Debug log

    res.json({ isDuplicate });
  } catch (error) {
    console.error('Error checking for duplicate member:', error);
    res.status(500).json({ message: 'Error checking for duplicate member' });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  console.log('Received registration request:', req.body);
  const { username, password, firstName, lastName, email, isSuperUser } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, password, first_name, last_name, email, is_superuser, created_on, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)
      RETURNING id, username, first_name, last_name, email, is_superuser
    `;
    const values = [username, hashedPassword, firstName, lastName, email, isSuperUser, username];
    
    console.log('Executing query with values:', values);
    const result = await pool.query(query, values);
    console.log('Query result:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }

    const token = jwt.sign(
      { userId: user.id, isSuperUser: user.is_super_user },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, isSuperUser: user.is_super_user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during login', error: error.message });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        first_name, 
        last_name, 
        date_of_birth, 
        ssn, 
        address, 
        city, 
        zip_code, 
        phone_number, 
        email, 
        membership_status, 
        emergency_contact, 
        primary_care_physician
      FROM members 
      ORDER BY last_name, first_name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
});

app.get('/api/members/search', authenticateToken, async (req, res) => {
  console.log('Received authenticated request for member search');
  try {
    const { name, dob, memberId, phoneNumber } = req.query;
    let query = 'SELECT * FROM members WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (name) {
      query += ` AND (LOWER(first_name) LIKE $${paramCount} OR LOWER(last_name) LIKE $${paramCount})`;
      values.push(`%${name.toLowerCase()}%`);
      paramCount++;
    }
    if (dob) {
      query += ` AND date_of_birth = $${paramCount}`;
      values.push(dob);
      paramCount++;
    }
    if (memberId) {
      query += ` AND id = $${paramCount}`;
      values.push(memberId);
      paramCount++;
    }
    if (phoneNumber) {
      query += ` AND phone_number = $${paramCount}`;
      values.push(phoneNumber);
      paramCount++;
    }

    query += ' ORDER BY last_name, first_name';

    console.log('Executing query:', query);
    console.log('With values:', values);

    const result = await pool.query(query, values);
    console.log('Query result:', result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users', error: error.toString() });
  }
});

app.get('/api/members/:id', authenticateToken, async (req, res) => {
  const memberId = req.params.id;
  try {
    const query = 'SELECT * FROM members WHERE id = $1';
    const values = [memberId];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member details:', error);
    res.status(500).json({ message: 'Error fetching member details' });
  }
});

// Add this error handling middleware at the end of your server.js file
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'An unexpected error occurred', error: err.toString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const path = require('path');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
