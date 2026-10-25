import type { Request, Response } from "express";
import { WorkoutLog, WorkoutPlan } from "../models/workout.model";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { dayOfWeek, todayKey } from "../utils/date";

const emptyLog = (date: string) => ({ date, sets: [] });

const planFor = async (date: string) => {
  const plan = await WorkoutPlan.findOne({ dow: dayOfWeek(date) });
  if (!plan) throw new ApiError(404, "No workout plan for this weekday. Run `npm run seed` in the backend.");
  return plan;
};

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await WorkoutPlan.find().sort({ dow: 1 });
  return ApiResponse(res, 200, "Workout plans fetched successfully", plans);
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await WorkoutPlan.findOne({ dow: Number(req.params.dow) });
  if (!plan) throw new ApiError(404, "Workout plan not found");
  return ApiResponse(res, 200, "Workout plan fetched successfully", plan);
});

export const listLogs = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from: string; to: string };
  const logs = await WorkoutLog.find({ date: { $gte: from, $lte: to } }).sort({ date: 1 });
  return ApiResponse(res, 200, "Workout logs fetched successfully", logs);
});

export const getLog = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  const log = await WorkoutLog.findOne({ date });
  return ApiResponse(res, 200, "Workout log fetched successfully", log ?? emptyLog(date));
});

/** Tick a set as done now, or untick it if it was already done. */
export const toggleSet = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  if (date > todayKey()) throw new ApiError(422, "This day hasn't come yet. Tracking opens on the day.");

  const { exercise, set } = req.body as { exercise: number; set: number };
  const plan = await planFor(date);
  const ex = plan.exercises[exercise];
  if (!ex) throw new ApiError(422, `This day has ${plan.exercises.length} exercises; exercise ${exercise} doesn't exist`);
  if (set >= ex.sets) throw new ApiError(422, `${ex.name} has ${ex.sets} sets; set ${set} doesn't exist`);

  const log = (await WorkoutLog.findOne({ date })) ?? new WorkoutLog({ date, sets: [] });
  const at = log.sets.findIndex((s) => s.exercise === exercise && s.set === set);
  if (at >= 0) log.sets.splice(at, 1);
  else log.sets.push({ exercise, set, doneAt: new Date() });
  await log.save();

  return ApiResponse(res, 200, at >= 0 ? "Set unmarked" : "Set marked done", log);
});

export const resetLog = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  await WorkoutLog.deleteOne({ date });
  return ApiResponse(res, 200, "Workout day reset", emptyLog(date));
});
