import mongoose, { Schema, Document, Types } from "mongoose";
import { DATE_KEY_REGEX } from "../utils/date";

export const GENDERS = ["Male", "Female", "Other"] as const;
export type Gender = (typeof GENDERS)[number];

export interface IWeightEntry {
  _id: Types.ObjectId;
  date: string;
  kg: number;
  at: Date;
}

export interface IDailyRule {
  title: string;
  value: string;
  note: string;
}

export interface IUser extends Document {
  name: string;
  age: number;
  gender: Gender;
  startWeightKg: number;
  goalWeightKg: number;
  startDate: string;
  goalDate: string;
  height?: { ft: number; inch: number };
  weights: Types.DocumentArray<IWeightEntry & Document>;
  dailyRules: IDailyRule[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     WeightEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         date:
 *           type: string
 *           example: "2026-10-25"
 *         kg:
 *           type: number
 *           example: 79.4
 *         at:
 *           type: string
 *           format: date-time
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: AR Sahak
 *         age:
 *           type: integer
 *           example: 29
 *         gender:
 *           type: string
 *           enum: [Male, Female, Other]
 *         startWeightKg:
 *           type: number
 *           example: 80
 *         goalWeightKg:
 *           type: number
 *           example: 70
 *         startDate:
 *           type: string
 *           example: "2026-10-25"
 *         goalDate:
 *           type: string
 *           example: "2027-06-15"
 *         height:
 *           type: object
 *           properties:
 *             ft:
 *               type: integer
 *               example: 5
 *             inch:
 *               type: integer
 *               example: 8
 *         weights:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/WeightEntry'
 *         dailyRules:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               value:
 *                 type: string
 *               note:
 *                 type: string
 *     ApiErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

const dateKey = {
  type: String,
  required: true,
  match: [DATE_KEY_REGEX, "Date must look like YYYY-MM-DD"] as [RegExp, string],
};

const weightEntrySchema = new Schema<IWeightEntry>({
  date: dateKey,
  kg: { type: Number, required: true, min: 30, max: 250 },
  at: { type: Date, required: true, default: Date.now },
});

const dailyRuleSchema = new Schema<IDailyRule>(
  {
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    age: { type: Number, required: true, min: 10, max: 120 },
    gender: { type: String, enum: GENDERS, required: true },
    startWeightKg: { type: Number, required: true, min: 30, max: 250 },
    goalWeightKg: { type: Number, required: true, min: 30, max: 250 },
    startDate: dateKey,
    goalDate: dateKey,
    height: {
      type: new Schema(
        {
          ft: { type: Number, required: true, min: 3, max: 7 },
          inch: { type: Number, required: true, min: 0, max: 11 },
        },
        { _id: false }
      ),
      default: undefined,
    },
    weights: { type: [weightEntrySchema], default: [] },
    dailyRules: { type: [dailyRuleSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.set("toJSON", { versionKey: false });

export const User = mongoose.model<IUser>("User", userSchema);
