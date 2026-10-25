import mongoose, { Schema, Document } from "mongoose";
import { DATE_KEY_REGEX } from "../utils/date";

// Each move id picks a cartoon on the website.
export const MOVE_IDS = [
  "armcircles", "bridge", "calf", "climber", "crunch", "curl", "dips",
  "jumpingjacks", "legraise", "lunge", "plank", "press", "pushup", "row",
  "run", "sideplank", "squat", "stepup", "stretch", "walk", "weigh", "yoga",
] as const;
export type MoveId = (typeof MOVE_IDS)[number];

export interface IExercise {
  name: string;
  sets: number;
  reps: string;
  move: MoveId;
  steps: string[];
  tip: string;
}

/** The workout for one weekday. The plan repeats every week. */
export interface IWorkoutPlan extends Document {
  dow: number; // 0 = Sunday ... 6 = Saturday
  day: string;
  short: string;
  focus: string;
  minutes: number;
  exercises: IExercise[];
}

export interface ISetEntry {
  exercise: number; // index in the day's exercise list
  set: number; // index of the set
  doneAt: Date;
}

/** Sets ticked off on one calendar day. */
export interface IWorkoutLog extends Document {
  date: string;
  sets: ISetEntry[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Bodyweight squats
 *         sets:
 *           type: integer
 *           example: 3
 *         reps:
 *           type: string
 *           example: 15 reps
 *         move:
 *           type: string
 *           example: squat
 *         steps:
 *           type: array
 *           items:
 *             type: string
 *         tip:
 *           type: string
 *     WorkoutPlan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         dow:
 *           type: integer
 *           description: 0 = Sunday ... 6 = Saturday
 *           example: 6
 *         day:
 *           type: string
 *           example: Saturday
 *         short:
 *           type: string
 *           example: Sat
 *         focus:
 *           type: string
 *           example: Full body strength
 *         minutes:
 *           type: integer
 *           example: 45
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Exercise'
 *     WorkoutLog:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           example: "2026-10-25"
 *         sets:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               exercise:
 *                 type: integer
 *               set:
 *                 type: integer
 *               doneAt:
 *                 type: string
 *                 format: date-time
 */

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true, min: 1, max: 20 },
    reps: { type: String, required: true, trim: true },
    move: { type: String, enum: MOVE_IDS, required: true },
    steps: { type: [String], default: [] },
    tip: { type: String, default: "" },
  },
  { _id: false }
);

const workoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    dow: { type: Number, required: true, min: 0, max: 6, unique: true },
    day: { type: String, required: true },
    short: { type: String, required: true },
    focus: { type: String, required: true, trim: true },
    minutes: { type: Number, required: true, min: 0 },
    exercises: { type: [exerciseSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

const setEntrySchema = new Schema<ISetEntry>(
  {
    exercise: { type: Number, required: true, min: 0 },
    set: { type: Number, required: true, min: 0 },
    doneAt: { type: Date, required: true },
  },
  { _id: false }
);

const workoutLogSchema = new Schema<IWorkoutLog>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      match: [DATE_KEY_REGEX, "Date must look like YYYY-MM-DD"],
    },
    sets: { type: [setEntrySchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const WorkoutPlan = mongoose.model<IWorkoutPlan>("WorkoutPlan", workoutPlanSchema);
export const WorkoutLog = mongoose.model<IWorkoutLog>("WorkoutLog", workoutLogSchema);
