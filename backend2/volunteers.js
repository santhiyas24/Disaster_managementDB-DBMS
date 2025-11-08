const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all volunteers
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT v.*, CONCAT(l.district, ', ', l.city) AS location
      FROM volunteers v
      LEFT JOIN locations l ON v.location_id = l.location_id
      ORDER BY v.volunteer_id DESC
    `);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Get single volunteer
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM volunteers WHERE volunteer_id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Add volunteer
router.post('/add', async (req, res) => {
  const { name, age, gender, phone, skill, location_id, availability } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO volunteers(name, age, gender, phone, skill, location_id, availability) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, age, gender, phone, skill, location_id, availability]
    );
    res.json({ message: 'Added', volunteer: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Update volunteer
router.put('/:id', async (req, res) => {
  const { name, age, gender, phone, skill, location_id, availability } = req.body;
  try {
    const r = await pool.query(
      'UPDATE volunteers SET name=$1, age=$2, gender=$3, phone=$4, skill=$5, location_id=$6, availability=$7 WHERE volunteer_id=$8 RETURNING *',
      [name, age, gender, phone, skill, location_id, availability, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated', volunteer: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Delete volunteer
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM volunteers WHERE volunteer_id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

module.exports = router;
