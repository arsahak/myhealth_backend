import { param, query } from "express-validator";
import { isDateKey } from "../utils/date";

export const MAX_RANGE_DAYS = 800;

export const dateParamRules = [
  param("date").custom(isDateKey).withMessage("date must be a real day like 2026-10-25"),
];

export const dowParamRules = [
  param("dow").isInt({ min: 0, max: 6 }).withMessage("dow must be 0 (Sunday) to 6 (Saturday)").toInt(),
];

export const dateRangeRules = [
  query("from").custom(isDateKey).withMessage("from must be a real day like 2026-10-01"),
  query("to")
    .custom(isDateKey)
    .withMessage("to must be a real day like 2026-10-31")
    .custom((to: string, { req }) => {
      const from = req.query?.from as string;
      if (isDateKey(from)) {
        if (to < from) throw new Error("to must be on or after from");
        const days = (Date.parse(to) - Date.parse(from)) / 86_400_000;
        if (days > MAX_RANGE_DAYS) throw new Error(`Range can be at most ${MAX_RANGE_DAYS} days`);
      }
      return true;
    }),
];
