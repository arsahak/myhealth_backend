import { Router } from "express";
import { getLog, getPlan, listLogs, listPlans, resetLog, toggleSet } from "../controllers/workout.controller";
import { validate } from "../middleware/validate";
import { dateParamRules, dateRangeRules, dowParamRules } from "../validators/common.validator";
import { toggleSetRules } from "../validators/workout.validator";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Workouts
 *   description: Weekly workout plan and the sets ticked off each day
 */

/**
 * @swagger
 * /workouts/plans:
 *   get:
 *     summary: List the workout plan for every weekday
 *     tags: [Workouts]
 *     responses:
 *       200:
 *         description: Workout plans fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkoutPlan'
 * /workouts/plans/{dow}:
 *   get:
 *     summary: Get one weekday's workout (0 = Sunday ... 6 = Saturday)
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: dow
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workout plan fetched successfully
 *       404:
 *         description: Not found
 */
router.get("/plans", listPlans);
router.get("/plans/:dow", dowParamRules, validate, getPlan);

/**
 * @swagger
 * /workouts/logs:
 *   get:
 *     summary: List workout logs between two days (inclusive)
 *     tags: [Workouts]
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
 *         description: Workout logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkoutLog'
 * /workouts/logs/{date}:
 *   get:
 *     summary: Get one day's workout log (empty if nothing logged)
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-10-25"
 *     responses:
 *       200:
 *         description: Workout log fetched successfully
 *   delete:
 *     summary: Reset a day (clears every ticked set)
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workout day reset
 * /workouts/logs/{date}/sets/toggle:
 *   post:
 *     summary: Tick a set as done now, or untick it
 *     tags: [Workouts]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-10-25"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [exercise, set]
 *             properties:
 *               exercise:
 *                 type: integer
 *                 example: 0
 *               set:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       200:
 *         description: Returns the updated day log
 *       422:
 *         description: Future day, or exercise/set out of range
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/logs", dateRangeRules, validate, listLogs);
router.get("/logs/:date", dateParamRules, validate, getLog);
router.delete("/logs/:date", dateParamRules, validate, resetLog);
router.post("/logs/:date/sets/toggle", dateParamRules, toggleSetRules, validate, toggleSet);

export default router;
