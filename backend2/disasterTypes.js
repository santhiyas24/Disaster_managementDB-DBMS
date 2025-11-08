const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all types
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM disaster_types ORDER BY type_id DESC');
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Get single type
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM disaster_types WHERE type_id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Add new type
router.post('/add', async (req, res) => {
  const { type_name, description } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO disaster_types(type_name, description) VALUES($1, $2) RETURNING *',
      [type_name, description || '']
    );
    res.json({ message: 'Added', type: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Update type
router.put('/:id', async (req, res) => {
  const { type_name, description } = req.body;
  try {
    const r = await pool.query(
      'UPDATE disaster_types SET type_name=$1, description=$2 WHERE type_id=$3 RETURNING *',
      [type_name, description || '', req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Updated', type: r.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

// Delete type
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM disaster_types WHERE type_id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB Error' });
  }
});

module.exports = router;
