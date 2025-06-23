require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Error connecting to Neon PostgreSQL:', err);
  } else {
    console.log('Connected to Neon PostgreSQL successfully');
    
    // Create movies table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        director VARCHAR(255),
        release_year INTEGER,
        genre VARCHAR(100),
        poster VARCHAR(500),
        rating DECIMAL(3,1),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    pool.query(createTableQuery)
      .then(() => console.log('Movies table created or already exists'))
      .catch(err => console.error('Error creating movies table:', err));
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Movie Application API' });
});

// Movies routes
app.get('/api/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY id');
    res.json({ movies: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json({ movie: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
