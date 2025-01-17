const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost', // Replace with your MySQL host
  user: 'root',      // Replace with your MySQL username
  password: 'password', // Replace with your MySQL password
  database: 'greenway', // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create users table if it doesn't exist
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullName VARCHAR(255) NOT NULL,
    studentId VARCHAR(255) NOT NULL UNIQUE,
    transportation JSON,
    agreement BOOLEAN,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  }
});

// Signup Endpoint
app.post('/signup', (req, res) => {
  const { email, fullName, studentId, transportation, agreement } = req.body;

  // Validate transportation array length
  if (transportation.length > 3) {
    return res.status(400).json({ message: 'You can select up to 3 transportation options only.' });
  }

  // Insert user into the database
  const query = `
    INSERT INTO users (email, fullName, studentId, transportation, agreement)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(
    query,
    [email, fullName, studentId, JSON.stringify(transportation), agreement],
    (err, results) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error saving user data' });
      }
      res.status(200).json({ message: 'Signup successful!' });
    }
  );
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
