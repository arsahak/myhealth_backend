import { body, param } from "express-validator";
import { GENDERS } from "../models/user.model";
import { isDateKey } from "../utils/date";

export const updateProfileRules = [
  body("name").optional().isString().trim().isLength({ min: 1, max: 80 }).withMessage("name must be 1-80 characters"),
  body("age").optional().isInt({ min: 10, max: 120 }).withMessage("age must be between 10 and 120").toInt(),
  body("gender").optional().isIn(GENDERS).withMessage(`gender must be one of ${GENDERS.join(", ")}`),
  body("startWeightKg").optional().isFloat({ min: 30, max: 250 }).withMessage("startWeightKg must be 30-250").toFloat(),
  body("goalWeightKg").optional().isFloat({ min: 30, max: 250 }).withMessage("goalWeightKg must be 30-250").toFloat(),
  body("startDate").optional().custom(isDateKey).withMessage("startDate must look like 2026-10-25"),
  body("goalDate").optional().custom(isDateKey).withMessage("goalDate must look like 2027-06-15"),
  body("height")
    .optional({ values: "null" })
    .isObject()
    .withMessage("height must be an object like { ft: 5, inch: 8 } or null"),
  body("height.ft").if(body("height").isObject()).isInt({ min: 3, max: 7 }).withMessage("height.ft must be 3-7").toInt(),
  body("height.inch").if(body("height").isObject()).isInt({ min: 0, max: 11 }).withMessage("height.inch must be 0-11").toInt(),
  body("dailyRules").optional().isArray({ max: 12 }).withMessage("dailyRules must be a list"),
  body("dailyRules.*.title").isString().trim().notEmpty().withMessage("Each daily rule needs a title"),
  body("dailyRules.*.value").isString().trim().notEmpty().withMessage("Each daily rule needs a value"),
  body("dailyRules.*.note").optional().isString().trim(),
];

export const addWeightRules = [
  body("kg").isFloat({ min: 30, max: 250 }).withMessage("kg must be a number between 30 and 250").toFloat(),
  body("date").optional().custom(isDateKey).withMessage("date must look like 2026-10-25"),
];

export const weightIdRules = [param("entryId").isMongoId().withMessage("entryId is not valid")];
