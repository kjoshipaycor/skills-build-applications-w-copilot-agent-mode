import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import Team from '../models/Team';

const router = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}

// GET all teams
router.get('/', async (_req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate('members', '-password');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET team by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('members', '-password');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST create team
router.post('/', async (req: Request, res: Response) => {
  try {
    const team = new Team(req.body);
    await team.save();
    res.status(201).json(team);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Team name already exists' });
    }
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// PUT update team
router.put('/:id', async (req: Request, res: Response) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid team ID' });
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('members', '-password');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err: any) {
    res.status(400).json({ message: 'Update error', error: err.message });
  }
});

// POST add member to team
router.post('/:id/members', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', '-password');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (err: any) {
    res.status(400).json({ message: 'Error adding member', error: err.message });
  }
});

// DELETE team
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
