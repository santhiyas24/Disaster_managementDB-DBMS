const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireRole } = require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT d.*, r.name AS resource FROM donations d LEFT JOIN resources r ON d.resource_id=r.resource_id ORDER BY d.donation_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.get('/:id', async (req,res)=>{ try{ const r=await pool.query('SELECT * FROM donations WHERE donation_id=$1',[req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json(r.rows[0]); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { donor_name, resource_id, quantity, donated_at, received_by } = req.body; try{ const r=await pool.query('INSERT INTO donations(donor_name,resource_id,quantity,donated_at,received_by) VALUES($1,$2,$3,$4,$5) RETURNING *',[donor_name,resource_id,quantity,donated_at || new Date(),received_by]); res.json({message:'Added', donation:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id',  async (req,res)=>{ const { donor_name, resource_id, quantity, donated_at, received_by } = req.body; try{ const r=await pool.query('UPDATE donations SET donor_name=$1,resource_id=$2,quantity=$3,donated_at=$4,received_by=$5 WHERE donation_id=$6 RETURNING *',[donor_name,resource_id,quantity,donated_at,received_by,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', donation:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id',  async (req,res)=>{ try{ await pool.query('DELETE FROM donations WHERE donation_id=$1',[req.params.id]); res.json({message:'Deleted'}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports = router;
