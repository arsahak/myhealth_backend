import mongoose, { Schema, Document } from "mongoose";
import { DATE_KEY_REGEX } from "../utils/date";

export const MEAL_SLOTS = ["breakfast", "snack", "lunch", "dinner"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

// Each food kind picks a small drawing on the website's plate.
export const FOOD_KINDS = [
  "rice", "polao", "ruti", "egg", "sabji", "dal", "fish", "chicken", "beef",
  "salad", "cucumber", "carrot", "oats", "milk", "banana", "apple", "papaya",
  "doi", "chira", "tea", "nuts", "chola", "muri", "soup",
] as const;
export type FoodKind = (typeof FOOD_KINDS)[number];

export interface IFoodItem {
  name: string;
  amount: string;
  kind: FoodKind;
}

/** One dish that can be eaten for a meal. */
export interface IMealOption extends Document {
  slug: string;
  slot: MealSlot;
  name: string;
  items: IFoodItem[];
  kcal: number;
  protein: number;
  tip: string;
  treat: boolean; // only offered on its own day
}

export interface IPlannedMeal {
  time: string;
  label: string;
  option: string; // MealOption slug
}

/** The meals for one weekday. The plan repeats every week. */
export interface IMealPlan extends Document {
  dow: number; // 0 = Sunday ... 6 = Saturday
  day: string;
  meals: IPlannedMeal[];
}

export interface IMealEntry {
  meal: number; // index in the day's meal list
  eatenAt: Date;
}

export interface IMealChoice {
  meal: number;
  option: string; // MealOption slug picked instead of the planned one
}

/** Meals eaten and dishes picked on one calendar day. */
export interface IFoodLog extends Document {
  date: string;
  meals: IMealEntry[];
  choices: IMealChoice[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     MealOption:
 *       type: object
 *       properties:
 *         slug:
 *           type: string
 *           example: rice-fish
 *         slot:
 *           type: string
 *           enum: [breakfast, snack, lunch, dinner]
 *         name:
 *           type: string
 *           example: Rice, fish curry, dal & salad
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: string
 *               kind:
 *                 type: string
 *         kcal:
 *           type: integer
 *           example: 540
 *         protein:
 *           type: integer
 *           example: 32
 *         tip:
 *           type: string
 *         treat:
 *           type: boolean
 *     MealPlan:
 *       type: object
 *       properties:
 *         dow:
 *           type: integer
 *           example: 6
 *         day:
 *           type: string
 *           example: Saturday
 *         meals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               time:
 *                 type: string
 *                 example: "8:00"
 *               label:
 *                 type: string
 *                 example: Breakfast
 *               option:
 *                 type: string
 *                 example: ruti-egg-sabji
 *     FoodLog:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           example: "2026-10-25"
 *         meals:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               meal:
 *                 type: integer
 *               eatenAt:
 *                 type: string
 *                 format: date-time
 *         choices:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               meal:
 *                 type: integer
 *               option:
 *                 type: string
 */

const foodItemSchema = new Schema<IFoodItem>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: String, required: true, trim: true },
    kind: { type: String, enum: FOOD_KINDS, required: true },
  },
  { _id: false }
);

const mealOptionSchema = new Schema<IMealOption>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    slot: { type: String, enum: MEAL_SLOTS, required: true },
    name: { type: String, required: true, trim: true },
    items: { type: [foodItemSchema], default: [] },
    kcal: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    tip: { type: String, default: "" },
    treat: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const plannedMealSchema = new Schema<IPlannedMeal>(
  {
    time: { type: String, required: true },
    label: { type: String, required: true },
    option: { type: String, required: true },
  },
  { _id: false }
);

const mealPlanSchema = new Schema<IMealPlan>(
  {
    dow: { type: Number, required: true, min: 0, max: 6, unique: true },
    day: { type: String, required: true },
    meals: { type: [plannedMealSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

const foodLogSchema = new Schema<IFoodLog>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      match: [DATE_KEY_REGEX, "Date must look like YYYY-MM-DD"],
    },
    meals: {
      type: [
        new Schema<IMealEntry>(
          { meal: { type: Number, required: true, min: 0 }, eatenAt: { type: Date, required: true } },
          { _id: false }
        ),
      ],
      default: [],
    },
    choices: {
      type: [
        new Schema<IMealChoice>(
          { meal: { type: Number, required: true, min: 0 }, option: { type: String, required: true } },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

export const MealOption = mongoose.model<IMealOption>("MealOption", mealOptionSchema);
export const MealPlan = mongoose.model<IMealPlan>("MealPlan", mealPlanSchema);
export const FoodLog = mongoose.model<IFoodLog>("FoodLog", foodLogSchema);
