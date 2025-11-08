const express=require('express'); const router=express.Router(); const pool=require('../db'); const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT t.*, CONCAT(l.district, \', \', l.city) AS location FROM transportation t LEFT JOIN locations l ON t.location_id=l.location_id ORDER BY t.transport_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { type, capacity, available, location_id } = req.body; try{ const r=await pool.query('INSERT INTO transportation(type,capacity,available,location_id) VALUES($1,$2,$3,$4) RETURNING *',[type,capacity,available,location_id]); res.json({message:'Added', transport:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id',  async (req,res)=>{ const { type, capacity, available, location_id } = req.body; try{ const r=await pool.query('UPDATE transportation SET type=$1,capacity=$2,available=$3,location_id=$4 WHERE transport_id=$5 RETURNING *',[type,capacity,available,location_id,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', transport:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id', async (req,res)=>{ try{ await pool.query('DELETE FROM transportation WHERE transport_id=$1',[req.params.id]); res.json({message:'Deleted'});}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports=router;
