const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query(`SELECT r.*, CONCAT(l.district, ', ', l.city) AS location FROM resources r LEFT JOIN locations l ON r.location_id=l.location_id ORDER BY r.resource_id DESC`); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.get('/:id', async (req,res)=>{ try{ const r=await pool.query('SELECT * FROM resources WHERE resource_id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json(r.rows[0]); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { name, unit, total_quantity, available_quantity, location_id } = req.body; try{ const r=await pool.query('INSERT INTO resources(name,unit,total_quantity,available_quantity,location_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[name,unit,total_quantity,available_quantity,location_id]); res.json({message:'Added', resource:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id', async (req,res)=>{ const { name, unit, total_quantity, available_quantity, location_id } = req.body; try{ const r=await pool.query('UPDATE resources SET name=$1,unit=$2,total_quantity=$3,available_quantity=$4,location_id=$5 WHERE resource_id=$6 RETURNING *',[name,unit,total_quantity,available_quantity,location_id,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', resource:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id', async (req,res)=>{ try{ await pool.query('DELETE FROM resources WHERE resource_id=$1',[req.params.id]); res.json({message:'Deleted'}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports = router;
