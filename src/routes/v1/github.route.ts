import { Router } from "express";
import { GithubController } from "../../controllers/github.controllers";
import { isAuth } from "../../middlewares/isAuth";

const router = Router();

router.get("/issues", GithubController.issues);

router.get(
  "/:owner/:repo/issues/:number",
  // checkSchema(createUserValidationSchema),
  GithubController.issue,
);

// TODO: add validation schema
router.post(
  "/:owner/:repo/issues/:number/fund",
  isAuth,
  GithubController.fundIssue,
);

export default router;
