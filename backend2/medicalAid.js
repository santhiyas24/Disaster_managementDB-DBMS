const express=require('express'); const router=express.Router(); const pool=require('../db'); const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT m.*, CONCAT(l.district, \', \', l.city) AS location FROM medical_aid m LEFT JOIN locations l ON m.location_id=l.location_id ORDER BY m.aid_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { type, quantity, location_id, expiry_date } = req.body; try{ const r=await pool.query('INSERT INTO medical_aid(type,quantity,location_id,expiry_date) VALUES($1,$2,$3,$4) RETURNING *',[type,quantity,location_id,expiry_date]); res.json({message:'Added', aid:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id',  async (req,res)=>{ const { type, quantity, location_id, expiry_date } = req.body; try{ const r=await pool.query('UPDATE medical_aid SET type=$1,quantity=$2,location_id=$3,expiry_date=$4 WHERE aid_id=$5 RETURNING *',[type,quantity,location_id,expiry_date,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', aid:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id',  async (req,res)=>{ try{ await pool.query('DELETE FROM medical_aid WHERE aid_id=$1',[req.params.id]); res.json({message:'Deleted'});}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports=router;
