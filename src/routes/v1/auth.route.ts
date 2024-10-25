import { Router } from "express";
import passport from "passport";
import { AuthController } from "../../controllers/auth.controllers";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.get("/status", AuthController.status);

router.post(
  "/register",
  passport.authenticate("local-register"),
  AuthController.register,
);

router.post(
  "/register-as-company",
  AuthController.verifyCompanyToken,
  passport.authenticate("local-register"),
  AuthController.registerAsCompany,
);

router.post(
  "/login",
  passport.authenticate("local-login"),
  AuthController.login,
);

router.get("/github", passport.authenticate("github"));

router.get(
  "/redirect/github",
  passport.authenticate("github", {
    successRedirect: "http://localhost:3000/", // TODO: change this to the frontend URL
    failureRedirect: "http://localhost:3000/",
  }),
  (request, response) => {
    return response.status(StatusCodes.OK).send(request.user);
  },
);

router.post("/logout", AuthController.logout);

export default router;
