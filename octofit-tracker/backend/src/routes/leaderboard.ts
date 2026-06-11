import { Router, Request, Response } from 'express';
import Leaderboard from '../models/Leaderboard';

const router = Router();

// GET leaderboard (sorted by points descending)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const leaderboard = await Leaderboard.find()
      .sort({ totalPoints: -1 })
      .populate('user', 'username email fitnessLevel');
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET leaderboard entry by user ID
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const entry = await Leaderboard.findOne({ user: req.params.userId }).populate('user', 'username email fitnessLevel');
    if (!entry) return res.status(404).json({ message: 'Leaderboard entry not found' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET top N entries
router.get('/top/:limit', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit, 10) || 10;
    const leaderboard = await Leaderboard.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .populate('user', 'username email fitnessLevel');
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
