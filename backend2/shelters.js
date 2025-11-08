const express=require('express'); const router=express.Router(); const pool=require('../db'); const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT s.*, CONCAT(l.district, \', \', l.city) AS location FROM shelters s LEFT JOIN locations l ON s.location_id=l.location_id ORDER BY s.shelter_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { name, capacity, location_id, status } = req.body; try{ const r=await pool.query('INSERT INTO shelters(name,capacity,location_id,status) VALUES($1,$2,$3,$4) RETURNING *',[name,capacity,location_id,status]); res.json({message:'Added', shelter:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id',  async (req,res)=>{ const { name, capacity, location_id, status } = req.body; try{ const r=await pool.query('UPDATE shelters SET name=$1,capacity=$2,location_id=$3,status=$4 WHERE shelter_id=$5 RETURNING *',[name,capacity,location_id,status,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', shelter:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id',  async (req,res)=>{ try{ await pool.query('DELETE FROM shelters WHERE shelter_id=$1',[req.params.id]); res.json({message:'Deleted'});}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports=router;
