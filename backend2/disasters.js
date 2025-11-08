const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole } = require('../middleware/authMiddleware');

// GET all (with joins)
router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT d.disaster_id, dt.type_name AS disaster_type, d.event_name, d.date_occurred,
             CONCAT(l.district, ', ', l.city, ' - ', l.pincode) AS location,
             d.severity, d.status, d.type_id, d.location_id
      FROM disasters d
      LEFT JOIN disaster_types dt ON d.type_id = dt.type_id
      LEFT JOIN locations l ON d.location_id = l.location_id
      ORDER BY d.date_occurred DESC
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'DB Error' }); }
});

router.get('/:id', async (req, res) => {
  try { const r = await pool.query('SELECT * FROM disasters WHERE disaster_id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json(r.rows[0]); }
  catch(err){console.error(err); res.status(500).json({error:'DB Error'});}
});

// CREATE (admin)
router.post('/add',  async (req,res) => {
  const { type_id, event_name, date_occurred, location_id, severity, status } = req.body;
  try {
    const r = await pool.query(
      `INSERT INTO disasters(type_id,event_name,date_occurred,location_id,severity,status)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [type_id, event_name, date_occurred, location_id, severity, status]
    );
    res.json({ message: 'Added', disaster: r.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: 'DB Error' }); }
});

router.put('/:id',  async (req,res) => {
  const { type_id, event_name, date_occurred, location_id, severity, status } = req.body;
  try {
    const r = await pool.query(
      `UPDATE disasters SET type_id=$1,event_name=$2,date_occurred=$3,location_id=$4,severity=$5,status=$6
       WHERE disaster_id=$7 RETURNING *`,
      [type_id, event_name, date_occurred, location_id, severity, status, req.params.id]
    );
    if(!r.rows.length) return res.status(404).json({error:'Not found'});
    res.json({ message:'Updated', disaster: r.rows[0] });
  } catch(err){console.error(err); res.status(500).json({error:'DB Error'});}
});

router.delete('/:id', async (req,res)=>{
  try { await pool.query('DELETE FROM disasters WHERE disaster_id=$1',[req.params.id]); res.json({message:'Deleted'}); }
  catch(err){console.error(err); res.status(500).json({error:'DB Error'});}
});

module.exports = router;
