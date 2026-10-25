import type { Request, Response } from "express";
import { User } from "../models/user.model";
import { asyncHandler } from "../middleware/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { todayKey } from "../utils/date";

// The app has a single profile and no sign-in.
const findProfile = async () => {
  const user = await User.findOne().sort({ createdAt: 1 });
  if (!user) throw new ApiError(404, "Profile not found. Run `npm run seed` in the backend first.");
  return user;
};

export const getProfile = asyncHandler(async (_req: Request, res: Response) => {
  const user = await findProfile();
  return ApiResponse(res, 200, "Profile fetched successfully", user);
});

const EDITABLE = [
  "name",
  "age",
  "gender",
  "startWeightKg",
  "goalWeightKg",
  "startDate",
  "goalDate",
  "height",
  "dailyRules",
] as const;

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await findProfile();

  for (const key of EDITABLE) {
    if (req.body[key] === undefined) continue;
    if (key === "height") {
      user.height = req.body.height === null ? undefined : { ft: req.body.height.ft, inch: req.body.height.inch };
    } else {
      user.set(key, req.body[key]);
    }
  }

  if (user.goalDate <= user.startDate) {
    throw new ApiError(422, "goalDate must be after startDate");
  }

  await user.save();
  return ApiResponse(res, 200, "Profile updated successfully", user);
});

export const addWeight = asyncHandler(async (req: Request, res: Response) => {
  const user = await findProfile();
  const date: string = req.body.date ?? todayKey();
  if (date > todayKey()) throw new ApiError(422, "You can't log a weight for a future day");

  user.weights.push({ date, kg: Math.round(req.body.kg * 10) / 10, at: new Date() });
  user.weights.sort((a, b) => a.date.localeCompare(b.date) || a.at.getTime() - b.at.getTime());
  await user.save();

  return ApiResponse(res, 201, "Weight saved successfully", user);
});

export const deleteWeight = asyncHandler(async (req: Request, res: Response) => {
  const user = await findProfile();
  const entry = user.weights.id(req.params.entryId);
  if (!entry) throw new ApiError(404, "Weight entry not found");

  entry.deleteOne();
  await user.save();

  return ApiResponse(res, 200, "Weight entry deleted successfully", user);
});
