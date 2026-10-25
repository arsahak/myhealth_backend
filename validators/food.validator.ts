import { body, param, query } from "express-validator";
import { MEAL_SLOTS } from "../models/food.model";

export const optionQueryRules = [
  query("slot").optional().isIn(MEAL_SLOTS).withMessage(`slot must be one of ${MEAL_SLOTS.join(", ")}`),
];

export const slugParamRules = [param("slug").isSlug().withMessage("slug is not valid")];

export const toggleMealRules = [
  body("meal").isInt({ min: 0 }).withMessage("meal must be the meal's position (0, 1, 2...)").toInt(),
];

export const chooseMealRules = [
  body("meal").isInt({ min: 0 }).withMessage("meal must be the meal's position (0, 1, 2...)").toInt(),
  body("option").isSlug().withMessage("option must be a meal option slug"),
];
