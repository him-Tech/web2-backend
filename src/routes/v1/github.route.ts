import { Router } from "express";
import { GithubController } from "../../controllers/github.controllers";

const router = Router();

router.get("/issues", GithubController.issues);

router.get(
  "/:owner/:repo/issues/:number",
  // checkSchema(createUserValidationSchema),
  GithubController.issue,
);

export default router;
