const express=require('express'); const router=express.Router(); const pool=require('../db'); const { requireRole }=require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT rc.*, CONCAT(l.district, \', \', l.city) AS location FROM relief_centers rc LEFT JOIN locations l ON rc.location_id=l.location_id ORDER BY rc.center_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { name, capacity, location_id, contact } = req.body; try{ const r=await pool.query('INSERT INTO relief_centers(name,capacity,location_id,contact) VALUES($1,$2,$3,$4) RETURNING *',[name,capacity,location_id,contact]); res.json({message:'Added', center:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id', async (req,res)=>{ const { name, capacity, location_id, contact } = req.body; try{ const r=await pool.query('UPDATE relief_centers SET name=$1,capacity=$2,location_id=$3,contact=$4 WHERE center_id=$5 RETURNING *',[name,capacity,location_id,contact,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', center:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id', async (req,res)=>{ try{ await pool.query('DELETE FROM relief_centers WHERE center_id=$1',[req.params.id]); res.json({message:'Deleted'});}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports=router;
