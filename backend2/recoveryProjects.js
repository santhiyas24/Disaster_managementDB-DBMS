const express=require('express'); const router=express.Router(); const pool=require('../db'); const { requireRole }=require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT r.*, CONCAT(l.district, \', \', l.city) AS location FROM recovery_projects r LEFT JOIN locations l ON r.location_id=l.location_id ORDER BY r.project_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { name, start_date, end_date, budget, location_id } = req.body; try{ const r=await pool.query('INSERT INTO recovery_projects(name,start_date,end_date,budget,location_id) VALUES($1,$2,$3,$4,$5) RETURNING *',[name,start_date,end_date,budget,location_id]); res.json({message:'Added', project:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id',  async (req,res)=>{ const { name, start_date, end_date, budget, location_id } = req.body; try{ const r=await pool.query('UPDATE recovery_projects SET name=$1,start_date=$2,end_date=$3,budget=$4,location_id=$5 WHERE project_id=$6 RETURNING *',[name,start_date,end_date,budget,location_id,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', project:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id',  async (req,res)=>{ try{ await pool.query('DELETE FROM recovery_projects WHERE project_id=$1',[req.params.id]); res.json({message:'Deleted'});}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports=router;
