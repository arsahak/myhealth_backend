import { Router } from "express";
import userRoutes from "./user.route";
import workoutRoutes from "./workout.route";
import foodRoutes from "./food.route";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "HealthApp API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/users", userRoutes);
router.use("/workouts", workoutRoutes);
router.use("/foods", foodRoutes);

export default router;
