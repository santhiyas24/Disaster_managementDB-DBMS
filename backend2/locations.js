// backend/routes/locations.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole } = require('../middleware/authMiddleware');

// READ all
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT location_id, district, city, pincode FROM locations ORDER BY location_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB Error' });
  }
});

// READ one
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM locations WHERE location_id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB Error' });
  }
});

// CREATE (admin only)
router.post('/add',  async (req, res) => {
  const { district, city, pincode } = req.body;
  try {
    const result = await pool.query('INSERT INTO locations(district, city, pincode) VALUES($1,$2,$3) RETURNING *', [district, city, pincode]);
    res.json({ message: 'Location added successfully', location: result.rows[0] });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB Error' });
  }
});

// UPDATE (admin)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { district, city, pincode } = req.body;
  try {
    const result = await pool.query('UPDATE locations SET district=$1, city=$2, pincode=$3 WHERE location_id=$4 RETURNING *', [district, city, pincode, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated', location: result.rows[0] });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB Error' });
  }
});

// DELETE (admin)
router.delete('/:id',  async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM locations WHERE location_id=$1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'DB Error' });
  }
});

module.exports = router;
