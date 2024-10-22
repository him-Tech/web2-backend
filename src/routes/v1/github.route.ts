import { Router } from "express";
import { GithubController } from "../../controllers/github.controllers";

const router = Router();

router.get("/issues", GithubController.issues);

router.get(
  "/:owner/:repo/issues/:number",
  // checkSchema(createUserValidationSchema),
  GithubController.issue,
);

// TODO: add validation schema
// TODO: add authentication middleware
router.post("/:owner/:repo/issues/:number/fund", GithubController.fundIssue);

export default router;
