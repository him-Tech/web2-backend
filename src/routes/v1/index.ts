import express from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import stripeRoute from "./stripe.route";
import adminRoute from "./admin.route";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/stripe", stripeRoute);
router.use("/admin", adminRoute);

export default router;
