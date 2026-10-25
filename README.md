# HealthApp Backend

Express, TypeScript and MongoDB API for the HealthApp website. It stores the weekly workout plan, the meal plan and dish options, the profile, and what was done each day. There is no sign-in: the app has one profile.

## Setup

1. Put a MongoDB connection string in `.env` as `MONGO_URI`.
2. Run `npm run seed` once to load the plan, the dishes and the profile from `data/`.
3. Run `npm run dev`.

Running the seed again updates the plans and dishes in place. It keeps the profile's weight history and height. Add `--reset-profile` to also reset the profile details from `data/user.json`.

`APP_TIME_ZONE` (default `Asia/Dhaka`) decides which day is "today", so future days can't be ticked.

## Scripts

- `npm run dev` starts the server with nodemon.
- `npm run seed` loads the plan data into MongoDB.
- `npm run build` compiles TypeScript to `dist`.
- `npm start` runs the compiled server.

## Endpoints

All routes start with `/api/v1`. Dates are `YYYY-MM-DD`. Swagger docs are at `/api-docs`.

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/users/profile` | Profile, weight history and daily rules |
| PATCH | `/users/profile` | Update profile fields or height |
| POST | `/users/profile/weights` | Log a weight for today |
| DELETE | `/users/profile/weights/:entryId` | Remove a weight entry |
| GET | `/workouts/plans` | Workout for every weekday |
| GET | `/workouts/plans/:dow` | One weekday's workout (0 = Sunday) |
| GET | `/workouts/logs?from=&to=` | Ticked sets in a date range |
| GET | `/workouts/logs/:date` | One day's ticked sets |
| POST | `/workouts/logs/:date/sets/toggle` | Tick or untick a set |
| DELETE | `/workouts/logs/:date` | Reset a day's sets |
| GET | `/foods/options` | All dishes, optional `?slot=` |
| GET | `/foods/options/:slug` | One dish |
| GET | `/foods/plans` | Meals for every weekday |
| GET | `/foods/plans/:dow` | One weekday's meals |
| GET | `/foods/logs?from=&to=` | Meals eaten in a date range |
| GET | `/foods/logs/:date` | One day's meals eaten and dishes picked |
| POST | `/foods/logs/:date/meals/toggle` | Mark a meal eaten, or undo |
| PUT | `/foods/logs/:date/choices` | Pick a different dish for a meal |
| DELETE | `/foods/logs/:date` | Reset a day's eaten meals |
