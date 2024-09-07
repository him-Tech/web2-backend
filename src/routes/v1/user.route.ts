import { Router } from "express";
import { UserController } from "../../controllers/user.controllers";
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../../validation/validationSchemas";

const router = Router();

router.get("/", UserController.getUsers);

router.get("/:id", UserController.getUserById);

router.post(
  "/",
  checkSchema(createUserValidationSchema),
  UserController.createUser,
);

export default router;
