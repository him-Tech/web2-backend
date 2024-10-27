import { Router } from "express";
import { AdminController } from "../../controllers/admin.controllers";
import { isWebsiteAdmin } from "../../middlewares/isWebsiteAdmin";

const router = Router();

router.post("/issues", isWebsiteAdmin, AdminController.sendCompanyAdminInvite);

export default router;
