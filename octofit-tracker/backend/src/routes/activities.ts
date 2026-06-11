import { Router, Request, Response } from 'express';
import Activity from '../models/Activity';
import Leaderboard from '../models/Leaderboard';

const router = Router();

// Calculate points from an activity
function calculatePoints(activity: { activityType: string; duration: number; caloriesBurned: number }): number {
  const basePoints: Record<string, number> = {
    running: 10,
    cycling: 8,
    swimming: 9,
    strength_training: 7,
    walking: 5,
    yoga: 6,
    other: 5,
  };
  const base = basePoints[activity.activityType] ?? 5;
  return Math.round(base * (activity.duration / 30) + activity.caloriesBurned / 50);
}

// GET all activities
router.get('/', async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.find().populate('user', 'username email');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET activities by user
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const activities = await Activity.find({ user: req.params.userId }).populate('user', 'username email');
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET activity by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('user', 'username email');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST create activity (and update leaderboard)
router.post('/', async (req: Request, res: Response) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();

    // Update leaderboard
    const points = calculatePoints(activity);
    await Leaderboard.findOneAndUpdate(
      { user: activity.user },
      {
        $inc: {
          totalPoints: points,
          totalActivities: 1,
          totalDuration: activity.duration,
          totalCalories: activity.caloriesBurned,
        },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    res.status(201).json(activity);
  } catch (err: any) {
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// DELETE activity
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Activity deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
