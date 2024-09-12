import { Router } from "express";
import passport from "passport";
import { AuthController } from "../../controllers/auth.controllers";
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../../validation/validationSchemas";

const router = Router();

router.get("/status", AuthController.status);

router.post(
  "/register",
  checkSchema(createUserValidationSchema),
  AuthController.register,
);

router.post("/login", passport.authenticate("local"), AuthController.login);

router.post("/logout", AuthController.logout);

export default router;
