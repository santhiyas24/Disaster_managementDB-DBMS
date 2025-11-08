const express = require('express');
const router = express.Router();
const pool = require('../db');
const cors = require('cors');

// Enable CORS for all origins (so frontend can fetch without issues)
router.use(cors());

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT e.*, CONCAT(l.district, ', ', l.city) AS location
      FROM emergency_contacts e
      LEFT JOIN locations l ON e.location_id = l.location_id
      ORDER BY e.contact_id DESC
    `);
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Add contact
router.post('/add', async (req, res) => {
  const { name, role, phone, location_id } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO emergency_contacts(name, role, phone, location_id) VALUES($1,$2,$3,$4) RETURNING *',
      [name, role, phone, location_id]
    );
    res.json({ message: 'Added', contact: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Delete contact
router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query(
      'DELETE FROM emergency_contacts WHERE contact_id=$1 RETURNING *',
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

module.exports = router;
