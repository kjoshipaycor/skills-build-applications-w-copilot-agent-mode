---
applyTo: "octofit-tracker/frontend/**"
---
# Octofit Tracker React Presentation Tier Guidelines

Use commands that target `octofit-tracker/frontend` without changing directories.

```bash
npm create vite@latest octofit-tracker/frontend -- --template react
npm install --prefix octofit-tracker/frontend
npm install bootstrap react-router-dom --prefix octofit-tracker/frontend
```

Add Bootstrap CSS import at the top of `octofit-tracker/frontend/src/main.jsx`.

## Images

Use `docs/octofitapp-small.png` for the app logo.

## Pages and features

- **Users** (`/users`): Display and create user profiles with `username`, `email`, `age`, `fitnessLevel`, and `role` (`student` / `teacher`). Show a role badge to distinguish students from gym teachers.
- **Activities** (`/activities`): Log fitness activities (type, duration, distance, calories) linked to a user.
- **Teams** (`/teams`): Create and manage fitness teams with member lists.
- **Leaderboard** (`/leaderboard`): Show ranked student performance by points and stats.
- **Workouts** (`/workouts`): Browse and create personalised workout plans; filter by fitness level using the `/api/workouts/suggest/:fitnessLevel` endpoint.
