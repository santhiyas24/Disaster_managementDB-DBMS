const express = require('express');
const router = express.Router();
const pool = require('../db'); // your PostgreSQL pool

// Get all agencies
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT a.*, CONCAT(l.district, ', ', l.city) AS location
      FROM agencies a
      LEFT JOIN locations l ON a.location_id = l.location_id
      ORDER BY a.agency_id DESC
    `);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error', details: err.message });
  }
});

// Get single agency
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM agencies WHERE agency_id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error', details: err.message });
  }
});

// Add agency
router.post('/add', async (req, res) => {
  const { name, type, contact, location_id } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO agencies(name,type,contact,location_id) VALUES($1,$2,$3,$4) RETURNING *',
      [name, type, contact, location_id]
    );
    res.json({ message: 'Added', agency: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error', details: err.message });
  }
});

// Update agency
router.put('/:id', async (req, res) => {
  const { name, type, contact, location_id } = req.body;
  try {
    const r = await pool.query(
      'UPDATE agencies SET name=$1, type=$2, contact=$3, location_id=$4 WHERE agency_id=$5 RETURNING *',
      [name, type, contact, location_id, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated', agency: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error', details: err.message });
  }
});

// Delete agency
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM agencies WHERE agency_id=$1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found or linked to other data' });
    res.json({ message: 'Deleted', agency: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error', details: err.message });
  }
});

module.exports = router;
