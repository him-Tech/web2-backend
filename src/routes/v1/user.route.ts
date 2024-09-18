import { Router } from "express";
import { UserController } from "../../controllers/user.controllers";
import { isAuth } from "../../middlewares/isAuth";

const router = Router();

router.get("/", isAuth, UserController.getUsers);

router.get("/:id", isAuth, UserController.getUserById);

export default router;
