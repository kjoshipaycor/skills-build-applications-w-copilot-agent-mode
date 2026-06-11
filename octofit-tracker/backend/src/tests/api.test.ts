import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../server';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/octofit_test';

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// ─── Feature 1: User Profiles ────────────────────────────────────────────────

describe('Feature 1: User Profiles', () => {
  const testUser = {
    username: 'john_doe',
    email: 'john@mergington.edu',
    password: 'securePass123',
    age: 16,
    fitnessLevel: 'beginner',
  };

  it('should create a new user profile', async () => {
    const res = await request(app).post('/api/users').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.username).toBe(testUser.username);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.password).toBeUndefined();
  });

  it('should get all user profiles', async () => {
    await request(app).post('/api/users').send(testUser);
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should get a user by ID', async () => {
    const created = await request(app).post('/api/users').send(testUser);
    const userId = created.body._id;
    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(testUser.username);
  });

  it('should update a user profile', async () => {
    const created = await request(app).post('/api/users').send(testUser);
    const userId = created.body._id;
    const res = await request(app).put(`/api/users/${userId}`).send({ fitnessLevel: 'intermediate' });
    expect(res.status).toBe(200);
    expect(res.body.fitnessLevel).toBe('intermediate');
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/users/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('should not create duplicate user', async () => {
    await request(app).post('/api/users').send(testUser);
    const res = await request(app).post('/api/users').send(testUser);
    expect(res.status).toBe(400);
  });
});

// ─── Feature 2: Activity Logging ─────────────────────────────────────────────

describe('Feature 2: Activity Logging and Tracking', () => {
  let userId: string;

  beforeEach(async () => {
    const userRes = await request(app).post('/api/users').send({
      username: 'athlete1',
      email: 'athlete1@mergington.edu',
      password: 'pass123',
      age: 15,
      fitnessLevel: 'intermediate',
    });
    userId = userRes.body._id;
  });

  it('should log a new activity', async () => {
    const res = await request(app).post('/api/activities').send({
      user: userId,
      activityType: 'running',
      duration: 30,
      distance: 5,
      caloriesBurned: 300,
    });
    expect(res.status).toBe(201);
    expect(res.body.activityType).toBe('running');
    expect(res.body.duration).toBe(30);
  });

  it('should get all activities', async () => {
    await request(app).post('/api/activities').send({
      user: userId,
      activityType: 'walking',
      duration: 20,
      caloriesBurned: 100,
    });
    const res = await request(app).get('/api/activities');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should get activities by user', async () => {
    await request(app).post('/api/activities').send({
      user: userId,
      activityType: 'cycling',
      duration: 45,
      caloriesBurned: 400,
    });
    const res = await request(app).get(`/api/activities/user/${userId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].activityType).toBe('cycling');
  });

  it('should reject invalid activity type', async () => {
    const res = await request(app).post('/api/activities').send({
      user: userId,
      activityType: 'dancing',
      duration: 30,
      caloriesBurned: 200,
    });
    expect(res.status).toBe(400);
  });

  it('should delete an activity', async () => {
    const created = await request(app).post('/api/activities').send({
      user: userId,
      activityType: 'yoga',
      duration: 60,
      caloriesBurned: 150,
    });
    const actId = created.body._id;
    const res = await request(app).delete(`/api/activities/${actId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});

// ─── Feature 3: Team Management ──────────────────────────────────────────────

describe('Feature 3: Team Creation and Management', () => {
  it('should create a new team', async () => {
    const res = await request(app).post('/api/teams').send({
      name: 'Mergington Runners',
      description: 'The running club',
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Mergington Runners');
  });

  it('should get all teams', async () => {
    await request(app).post('/api/teams').send({ name: 'Team Alpha', description: 'Alpha squad' });
    const res = await request(app).get('/api/teams');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should add a member to a team', async () => {
    const userRes = await request(app).post('/api/users').send({
      username: 'teamMember',
      email: 'member@mergington.edu',
      password: 'pass123',
      age: 17,
      fitnessLevel: 'beginner',
    });
    const userId = userRes.body._id;

    const teamRes = await request(app).post('/api/teams').send({ name: 'Power Team', description: '' });
    const teamId = teamRes.body._id;

    const res = await request(app).post(`/api/teams/${teamId}/members`).send({ userId });
    expect(res.status).toBe(200);
    expect(res.body.members.length).toBe(1);
  });

  it('should not create duplicate team names', async () => {
    await request(app).post('/api/teams').send({ name: 'Unique Team', description: '' });
    const res = await request(app).post('/api/teams').send({ name: 'Unique Team', description: '' });
    expect(res.status).toBe(400);
  });

  it('should delete a team', async () => {
    const created = await request(app).post('/api/teams').send({ name: 'Delete Me', description: '' });
    const teamId = created.body._id;
    const res = await request(app).delete(`/api/teams/${teamId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });
});

// ─── Feature 4: Leaderboard ───────────────────────────────────────────────────

describe('Feature 4: Competitive Leaderboard', () => {
  it('should update leaderboard when activity is logged', async () => {
    const userRes = await request(app).post('/api/users').send({
      username: 'leaderUser',
      email: 'leader@mergington.edu',
      password: 'pass123',
      age: 16,
      fitnessLevel: 'advanced',
    });
    const userId = userRes.body._id;

    await request(app).post('/api/activities').send({
      user: userId,
      activityType: 'running',
      duration: 60,
      caloriesBurned: 500,
    });

    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const entry = res.body.find((e: any) => e.user._id === userId);
    expect(entry).toBeDefined();
    expect(entry.totalPoints).toBeGreaterThan(0);
  });

  it('should return leaderboard sorted by points descending', async () => {
    // Create two users and log activities
    const user1 = await request(app).post('/api/users').send({
      username: 'userHigh', email: 'high@test.edu', password: 'p', age: 15, fitnessLevel: 'advanced',
    });
    const user2 = await request(app).post('/api/users').send({
      username: 'userLow', email: 'low@test.edu', password: 'p', age: 15, fitnessLevel: 'beginner',
    });

    await request(app).post('/api/activities').send({
      user: user1.body._id, activityType: 'running', duration: 120, caloriesBurned: 800,
    });
    await request(app).post('/api/activities').send({
      user: user2.body._id, activityType: 'walking', duration: 10, caloriesBurned: 50,
    });

    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    if (res.body.length >= 2) {
      expect(res.body[0].totalPoints).toBeGreaterThanOrEqual(res.body[1].totalPoints);
    }
  });

  it('should get top N leaderboard entries', async () => {
    const res = await request(app).get('/api/leaderboard/top/5');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(5);
  });

  it('should get leaderboard entry by user ID', async () => {
    const userRes = await request(app).post('/api/users').send({
      username: 'singleUser',
      email: 'single@mergington.edu',
      password: 'pass',
      age: 16,
      fitnessLevel: 'intermediate',
    });
    const userId = userRes.body._id;
    await request(app).post('/api/activities').send({
      user: userId, activityType: 'swimming', duration: 45, caloriesBurned: 350,
    });

    const res = await request(app).get(`/api/leaderboard/user/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.totalActivities).toBe(1);
  });
});

// ─── Feature 5: Workout Suggestions ──────────────────────────────────────────

describe('Feature 5: Personalized Workout Suggestions', () => {
  const beginnerWorkout = {
    name: 'Beginner Full Body',
    description: 'Simple full-body workout for beginners',
    fitnessLevel: 'beginner',
    exercises: [
      { name: 'Squats', sets: 3, reps: 10, restSeconds: 60 },
      { name: 'Push-ups', sets: 2, reps: 8, restSeconds: 45 },
    ],
    estimatedDuration: 30,
    estimatedCalories: 150,
    category: 'strength',
  };

  it('should create a workout plan', async () => {
    const res = await request(app).post('/api/workouts').send(beginnerWorkout);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Beginner Full Body');
    expect(res.body.exercises.length).toBe(2);
  });

  it('should get all workouts', async () => {
    await request(app).post('/api/workouts').send(beginnerWorkout);
    const res = await request(app).get('/api/workouts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should suggest workouts by fitness level', async () => {
    await request(app).post('/api/workouts').send(beginnerWorkout);
    await request(app).post('/api/workouts').send({
      ...beginnerWorkout,
      name: 'Advanced HIIT',
      fitnessLevel: 'advanced',
      category: 'cardio',
    });
    const res = await request(app).get('/api/workouts/suggest/beginner');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((w: any) => w.fitnessLevel === 'beginner')).toBe(true);
  });

  it('should update a workout', async () => {
    const created = await request(app).post('/api/workouts').send(beginnerWorkout);
    const workoutId = created.body._id;
    const res = await request(app).put(`/api/workouts/${workoutId}`).send({ estimatedDuration: 45 });
    expect(res.status).toBe(200);
    expect(res.body.estimatedDuration).toBe(45);
  });

  it('should delete a workout', async () => {
    const created = await request(app).post('/api/workouts').send(beginnerWorkout);
    const workoutId = created.body._id;
    const res = await request(app).delete(`/api/workouts/${workoutId}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  it('should return 404 for non-existent workout', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/workouts/${fakeId}`);
    expect(res.status).toBe(404);
  });
});
