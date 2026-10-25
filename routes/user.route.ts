import { Router } from "express";
import { addWeight, deleteWeight, getProfile, updateProfile } from "../controllers/user.controller";
import { validate } from "../middleware/validate";
import { addWeightRules, updateProfileRules, weightIdRules } from "../validators/user.validator";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The app's single profile (no sign-in)
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the profile, weight history and daily rules
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: No profile yet (run the seed script)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *   patch:
 *     summary: Update profile details or height
 *     description: Send only the fields to change. Send `height` as null to clear it.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               startWeightKg:
 *                 type: number
 *               goalWeightKg:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 example: "2026-10-25"
 *               goalDate:
 *                 type: string
 *                 example: "2027-06-15"
 *               height:
 *                 type: object
 *                 nullable: true
 *                 properties:
 *                   ft:
 *                     type: integer
 *                     example: 5
 *                   inch:
 *                     type: integer
 *                     example: 8
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.get("/profile", getProfile);
router.patch("/profile", updateProfileRules, validate, updateProfile);

/**
 * @swagger
 * /users/profile/weights:
 *   post:
 *     summary: Log a weight (defaults to today)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kg]
 *             properties:
 *               kg:
 *                 type: number
 *                 example: 79.4
 *               date:
 *                 type: string
 *                 example: "2026-10-25"
 *     responses:
 *       201:
 *         description: Weight saved; returns the updated profile
 *       422:
 *         description: Validation failed or future day
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post("/profile/weights", addWeightRules, validate, addWeight);

/**
 * @swagger
 * /users/profile/weights/{entryId}:
 *   delete:
 *     summary: Delete one weight entry
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: entryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Entry deleted; returns the updated profile
 *       404:
 *         description: Entry not found
 */
router.delete("/profile/weights/:entryId", weightIdRules, validate, deleteWeight);

export default router;
