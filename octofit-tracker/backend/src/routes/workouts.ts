import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Workout from '../models/Workout';

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// GET all workouts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const workouts = await Workout.find();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET workouts by fitness level (personalized suggestions)
router.get('/suggest/:fitnessLevel', async (req: Request, res: Response) => {
  try {
    const { fitnessLevel } = req.params;
    const workouts = await Workout.find({ fitnessLevel });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET workout by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST create workout
router.post('/', async (req: Request, res: Response) => {
  try {
    const workout = new Workout(req.body);
    await workout.save();
    res.status(201).json(workout);
  } catch (err: any) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// PUT update workout
router.put('/:id', async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid workout ID' });
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json(workout);
  } catch (err: any) {
    res.status(400).json({ message: 'Update error', error: err.message });
  }
});

// DELETE workout
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) return res.status(404).json({ message: 'Workout not found' });
    res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
