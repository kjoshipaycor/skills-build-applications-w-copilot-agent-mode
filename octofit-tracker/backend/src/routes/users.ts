import { Router, Request, Response } from 'express';
import User from '../models/User';

const router = Router();

// GET all users
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// GET user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST create user
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    const { password: _p, ...userObj } = user.toObject();
    res.status(201).json(userObj);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(400).json({ message: 'Validation error', error: err.message });
  }
});

// PUT update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: 'Update error', error: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router;
