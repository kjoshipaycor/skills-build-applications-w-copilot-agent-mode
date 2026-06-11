---
applyTo: "octofit-tracker/backend/**"
---
# Octofit Tracker Logic + Data Tier Guidelines

## Logic tier (Node.js + Express + TypeScript)

- Build API routes under `/api/`.
- Keep API service on port `8000`.
- Use environment-aware Codespaces URLs via `CODESPACE_NAME`.

Example base URL logic:

```ts
const codespaceName = process.env.CODESPACE_NAME;
const baseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';
```

## Data tier (MongoDB + Mongoose)

- Use Mongoose models for users, teams, activities, leaderboard, and workouts.
- Connect to `octofit_db`.
- Validate endpoints with `curl` after wiring routes.

## User profiles

- The `User` model supports two roles: `student` and `teacher` (default: `student`).
- Use the `role` field to distinguish between student and gym teacher profiles.
- Students track personal fitness progress; teachers manage teams and workout plans.

## Feature overview

- **User profiles**: Students and gym teachers, differentiated by `role`.
- **Activity tracking**: Log workouts and monitor fitness progress via the `/api/activities` route, which also auto-updates the leaderboard.
- **Team management**: Create and manage teams with member references via `/api/teams`.
- **Leaderboard**: Rank student performance by total points, activities, duration, and calories via `/api/leaderboard`.
- **Workout suggestions**: Retrieve personalised workout plans filtered by fitness level via `/api/workouts/suggest/:fitnessLevel`.
