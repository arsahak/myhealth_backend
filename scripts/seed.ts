// Loads the workout plan, meal plan, meal options and profile into MongoDB.
// Safe to run again: plans and options are updated in place, and an existing
// profile keeps its weight history and height. Pass --reset-profile to
// overwrite the profile details from data/user.json (history is still kept).

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { User } from "../models/user.model";
import { WorkoutPlan } from "../models/workout.model";
import { MealOption, MealPlan } from "../models/food.model";
import workouts from "../data/workouts.json";
import foods from "../data/foods.json";
import user from "../data/user.json";

const run = async () => {
  const host = await connectDB();
  console.log(`Connected to ${host}`);

  // Update by key, or create. Goes through save() so schema validation runs.
  const upsert = async <T extends { set: (v: object) => unknown; save: () => Promise<unknown> }>(
    find: () => Promise<T | null>,
    create: () => Promise<unknown>,
    value: object
  ) => {
    const doc = await find();
    if (doc) {
      doc.set(value);
      await doc.save();
    } else {
      await create();
    }
  };

  for (const plan of workouts) {
    await upsert(() => WorkoutPlan.findOne({ dow: plan.dow }), () => WorkoutPlan.create(plan), plan);
  }
  console.log(`Workout plans: ${workouts.length} days`);

  for (const option of foods.mealOptions) {
    await upsert(() => MealOption.findOne({ slug: option.slug }), () => MealOption.create(option), option);
  }
  console.log(`Meal options: ${foods.mealOptions.length}`);

  for (const plan of foods.mealPlans) {
    await upsert(() => MealPlan.findOne({ dow: plan.dow }), () => MealPlan.create(plan), plan);
  }
  console.log(`Meal plans: ${foods.mealPlans.length} days`);

  const existing = await User.findOne().sort({ createdAt: 1 });
  if (!existing) {
    await User.create(user);
    console.log(`Profile created for ${user.name}`);
  } else if (process.argv.includes("--reset-profile")) {
    existing.set(user);
    await existing.save();
    console.log(`Profile details reset for ${user.name}`);
  } else {
    console.log(`Profile already exists for ${existing.name} (kept as is)`);
  }
};

run()
  .catch((err) => {
    console.error(`Seed failed: ${(err as Error).message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
