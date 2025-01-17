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
    totalCommutes INT DEFAULT 0,
    currentStreak INT DEFAULT 0,
    totalGreenPoints INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  }
});

// Endpoint to log a commute
app.post('/log-commute', (req, res) => {
  const { transportationMethod, greenPoints } = req.body;

  // For now, we'll assume the user ID is 1 (you can replace this with actual user authentication)
  const userId = 1;

  // Update user stats
  const query = `
    UPDATE users
    SET
      totalCommutes = totalCommutes + 1,
      currentStreak = currentStreak + 1,
      totalGreenPoints = totalGreenPoints + ?
    WHERE id = ?
  `;

  db.query(query, [greenPoints, userId], (err, results) => {
    if (err) {
      console.error('Error updating user stats:', err);
      return res.status(500).json({ message: 'Error logging commute' });
    }

    res.status(200).json({ message: 'Commute logged successfully!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
