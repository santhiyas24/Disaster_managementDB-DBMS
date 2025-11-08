const express=require('express'); const router=express.Router(); const pool=require('../db'); const { requireRole }=require('../middleware/authMiddleware');

router.get('/', async (req,res)=>{ try{ const r=await pool.query('SELECT d.*, ds.event_name AS disaster FROM damage_assessments d LEFT JOIN disasters ds ON d.disaster_id=ds.disaster_id ORDER BY d.assessment_id DESC'); res.json(r.rows);}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.post('/add',  async (req,res)=>{ const { disaster_id, assessed_at, damaged_houses, estimated_loss } = req.body; try{ const r=await pool.query('INSERT INTO damage_assessments(disaster_id,assessed_at,damaged_houses,estimated_loss) VALUES($1,$2,$3,$4) RETURNING *',[disaster_id,assessed_at,damaged_houses,estimated_loss]); res.json({message:'Added', assessment:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.put('/:id',  async (req,res)=>{ const { disaster_id, assessed_at, damaged_houses, estimated_loss } = req.body; try{ const r=await pool.query('UPDATE damage_assessments SET disaster_id=$1,assessed_at=$2,damaged_houses=$3,estimated_loss=$4 WHERE assessment_id=$5 RETURNING *',[disaster_id,assessed_at,damaged_houses,estimated_loss,req.params.id]); if(!r.rows.length) return res.status(404).json({error:'Not found'}); res.json({message:'Updated', assessment:r.rows[0]}); }catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

router.delete('/:id',  async (req,res)=>{ try{ await pool.query('DELETE FROM damage_assessments WHERE assessment_id=$1',[req.params.id]); res.json({message:'Deleted'});}catch(err){console.error(err);res.status(500).json({error:'DB Error'});} });

module.exports=router;
