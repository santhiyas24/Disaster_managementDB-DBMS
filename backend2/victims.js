const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req,res) => {
  try {
    const q = `SELECT v.*, d.event_name AS disaster, CONCAT(l.district, ', ', l.city) AS location
               FROM victims v
               LEFT JOIN disasters d ON v.disaster_id = d.disaster_id
               LEFT JOIN locations l ON v.location_id = l.location_id
               ORDER BY v.victim_id DESC`;
    const r = await pool.query(q); res.json(r.rows);
  } catch(err){console.error(err); res.status(500).json({error:'DB Error'});}
});

router.get('/:id', async (req,res)=>{ try{ const r=await pool.query('SELECT * FROM victims WHERE victim_id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json(r.rows[0]); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add', async (req,res) => {
  const { name, age, gender, disaster_id, location_id, status } = req.body;
  try { const r = await pool.query('INSERT INTO victims(name,age,gender,disaster_id,location_id,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[name,age,gender,disaster_id,location_id,status]); res.json({message:'Added', victim:r.rows[0]}); }
  catch(err){console.error(err); res.status(500).json({error:'DB Error'});}
});

router.put('/:id',  async (req,res)=>{ const { name, age, gender, disaster_id, location_id, status } = req.body; try{ const r=await pool.query('UPDATE victims SET name=$1,age=$2,gender=$3,disaster_id=$4,location_id=$5,status=$6 WHERE victim_id=$7 RETURNING *',[name,age,gender,disaster_id,location_id,status,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', victim:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id', async (req,res)=>{ try{ await pool.query('DELETE FROM victims WHERE victim_id=$1',[req.params.id]); res.json({message:'Deleted'}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports = router;
