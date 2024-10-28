import { Router } from "express";
import { AdminController } from "../../controllers/admin.controllers";
import { isWebsiteAdmin } from "../../middlewares/isWebsiteAdmin";

const router = Router();

router.post("/address", isWebsiteAdmin, AdminController.createAddress);
router.post("/company", isWebsiteAdmin, AdminController.createCompany);
router.post("/issues", isWebsiteAdmin, AdminController.sendCompanyAdminInvite);

export default router;
