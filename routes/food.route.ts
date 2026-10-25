import { Router } from "express";
import {
  chooseMeal,
  getLog,
  getOption,
  getPlan,
  listLogs,
  listOptions,
  listPlans,
  resetLog,
  toggleMeal,
} from "../controllers/food.controller";
import { validate } from "../middleware/validate";
import { dateParamRules, dateRangeRules, dowParamRules } from "../validators/common.validator";
import { chooseMealRules, optionQueryRules, slugParamRules, toggleMealRules } from "../validators/food.validator";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: Meal options, weekly meal plan and the meals eaten each day
 */

/**
 * @swagger
 * /foods/options:
 *   get:
 *     summary: List meal options (dishes)
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: slot
 *         schema:
 *           type: string
 *           enum: [breakfast, snack, lunch, dinner]
 *     responses:
 *       200:
 *         description: Meal options fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MealOption'
 * /foods/options/{slug}:
 *   get:
 *     summary: Get one meal option
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           example: rice-fish
 *     responses:
 *       200:
 *         description: Meal option fetched successfully
 *       404:
 *         description: Not found
 * /foods/plans:
 *   get:
 *     summary: List the meal plan for every weekday
 *     tags: [Foods]
 *     responses:
 *       200:
 *         description: Meal plans fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MealPlan'
 * /foods/plans/{dow}:
 *   get:
 *     summary: Get one weekday's meals (0 = Sunday ... 6 = Saturday)
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: dow
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meal plan fetched successfully
 */
router.get("/options", optionQueryRules, validate, listOptions);
router.get("/options/:slug", slugParamRules, validate, getOption);
router.get("/plans", listPlans);
router.get("/plans/:dow", dowParamRules, validate, getPlan);

/**
 * @swagger
 * /foods/logs:
 *   get:
 *     summary: List food logs between two days (inclusive)
 *     tags: [Foods]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-10-01"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-10-31"
 *     responses:
 *       200:
 *         description: Food logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FoodLog'
 * /foods/logs/{date}:
 *   get:
 *     summary: Get one day's food log (empty if nothing logged)
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food log fetched successfully
 *   delete:
 *     summary: Reset eaten meals for a day (picked dishes stay)
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Food day reset
 * /foods/logs/{date}/meals/toggle:
 *   post:
 *     summary: Mark a meal as eaten now, or undo it
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meal]
 *             properties:
 *               meal:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Returns the updated day log
 *       422:
 *         description: Future day or meal out of range
 * /foods/logs/{date}/choices:
 *   put:
 *     summary: Pick a different dish for a meal
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meal, option]
 *             properties:
 *               meal:
 *                 type: integer
 *                 example: 0
 *               option:
 *                 type: string
 *                 example: oats-banana
 *     responses:
 *       200:
 *         description: Returns the updated day log
 *       422:
 *         description: Option doesn't fit this meal
 */
router.get("/logs", dateRangeRules, validate, listLogs);
router.get("/logs/:date", dateParamRules, validate, getLog);
router.delete("/logs/:date", dateParamRules, validate, resetLog);
router.post("/logs/:date/meals/toggle", dateParamRules, toggleMealRules, validate, toggleMeal);
router.put("/logs/:date/choices", dateParamRules, chooseMealRules, validate, chooseMeal);

export default router;
