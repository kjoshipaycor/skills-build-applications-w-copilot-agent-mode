import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import usersRouter from './routes/users';
import teamsRouter from './routes/teams';
import activitiesRouter from './routes/activities';
import leaderboardRouter from './routes/leaderboard';
import workoutsRouter from './routes/workouts';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/workouts', workoutsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'OctoFit Tracker API is running' });
});

export { app };

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/octofit_db';
const PORT = process.env.PORT || 8000;

if (require.main === module) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB (octofit_db)');
      app.listen(PORT, () => {
        console.log(`OctoFit Tracker API running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });
}
