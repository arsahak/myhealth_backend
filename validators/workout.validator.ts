import { body } from "express-validator";

export const toggleSetRules = [
  body("exercise").isInt({ min: 0 }).withMessage("exercise must be the exercise's position (0, 1, 2...)").toInt(),
  body("set").isInt({ min: 0 }).withMessage("set must be the set's position (0, 1, 2...)").toInt(),
];
