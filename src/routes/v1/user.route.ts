import { Router } from "express";
import { UserController } from "../../controllers/user.controllers";
import { isAuth } from "../../middlewares/isAuth";
import { isWebsiteAdmin } from "../../middlewares/isWebsiteAdmin";

const router = Router();

// TODO: move to admin route
router.get("/", isWebsiteAdmin, UserController.getUsers);

router.get("/:id", isAuth, UserController.getUserById);

export default router;
