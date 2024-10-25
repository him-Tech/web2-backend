import { Router } from "express";
import { AdminController } from "../../controllers/admin.controllers";

const router = Router();

router.post(
  "/issues",
  // TODO: add security check
  AdminController.sendCompanyAdminInvite,
);

export default router;
