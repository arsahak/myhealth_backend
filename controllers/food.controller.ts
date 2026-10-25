import type { Request, Response } from "express";
import { FoodLog, MealOption, MealPlan } from "../models/food.model";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { dayOfWeek, todayKey } from "../utils/date";

const emptyLog = (date: string) => ({ date, meals: [], choices: [] });

const planFor = async (date: string) => {
  const plan = await MealPlan.findOne({ dow: dayOfWeek(date) });
  if (!plan) throw new ApiError(404, "No meal plan for this weekday. Run `npm run seed` in the backend.");
  return plan;
};

export const listOptions = asyncHandler(async (req: Request, res: Response) => {
  const filter = req.query.slot ? { slot: req.query.slot } : {};
  const options = await MealOption.find(filter).sort({ createdAt: 1 });
  return ApiResponse(res, 200, "Meal options fetched successfully", options);
});

export const getOption = asyncHandler(async (req: Request, res: Response) => {
  const option = await MealOption.findOne({ slug: req.params.slug });
  if (!option) throw new ApiError(404, "Meal option not found");
  return ApiResponse(res, 200, "Meal option fetched successfully", option);
});

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await MealPlan.find().sort({ dow: 1 });
  return ApiResponse(res, 200, "Meal plans fetched successfully", plans);
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await MealPlan.findOne({ dow: Number(req.params.dow) });
  if (!plan) throw new ApiError(404, "Meal plan not found");
  return ApiResponse(res, 200, "Meal plan fetched successfully", plan);
});

export const listLogs = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as { from: string; to: string };
  const logs = await FoodLog.find({ date: { $gte: from, $lte: to } }).sort({ date: 1 });
  return ApiResponse(res, 200, "Food logs fetched successfully", logs);
});

export const getLog = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  const log = await FoodLog.findOne({ date });
  return ApiResponse(res, 200, "Food log fetched successfully", log ?? emptyLog(date));
});

/** Mark a meal as eaten now, or undo it if it was already marked. */
export const toggleMeal = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  if (date > todayKey()) throw new ApiError(422, "This day hasn't come yet. Tracking opens on the day.");

  const meal = req.body.meal as number;
  const plan = await planFor(date);
  if (!plan.meals[meal]) throw new ApiError(422, `This day has ${plan.meals.length} meals; meal ${meal} doesn't exist`);

  const log = (await FoodLog.findOne({ date })) ?? new FoodLog(emptyLog(date));
  const at = log.meals.findIndex((m) => m.meal === meal);
  if (at >= 0) log.meals.splice(at, 1);
  else log.meals.push({ meal, eatenAt: new Date() });
  await log.save();

  return ApiResponse(res, 200, at >= 0 ? "Meal unmarked" : "Meal marked eaten", log);
});

/** Swap the planned dish for another option of the same meal type. */
export const chooseMeal = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  const { meal, option } = req.body as { meal: number; option: string };

  const plan = await planFor(date);
  const planned = plan.meals[meal];
  if (!planned) throw new ApiError(422, `This day has ${plan.meals.length} meals; meal ${meal} doesn't exist`);

  const [plannedOption, picked] = await Promise.all([
    MealOption.findOne({ slug: planned.option }),
    MealOption.findOne({ slug: option }),
  ]);
  if (!picked) throw new ApiError(404, "Meal option not found");
  if (plannedOption && picked.slot !== plannedOption.slot) {
    throw new ApiError(422, `${picked.name} is a ${picked.slot} option, but this meal is ${plannedOption.slot}`);
  }
  if (picked.treat && picked.slug !== planned.option) {
    throw new ApiError(422, `${picked.name} is only offered on its own day`);
  }

  const log = (await FoodLog.findOne({ date })) ?? new FoodLog(emptyLog(date));
  log.choices = log.choices.filter((c) => c.meal !== meal);
  if (picked.slug !== planned.option) log.choices.push({ meal, option: picked.slug });
  await log.save();

  return ApiResponse(res, 200, "Meal option saved", log);
});

export const resetLog = asyncHandler(async (req: Request, res: Response) => {
  const date = req.params.date;
  const log = await FoodLog.findOne({ date });
  if (!log) return ApiResponse(res, 200, "Food day reset", emptyLog(date));

  log.meals = [];
  await log.save();
  return ApiResponse(res, 200, "Food day reset", log);
});
