import { Router } from "express";
import passport from "passport";
import { StatusCodes } from "http-status-codes";

const router = Router();

router.post("/", passport.authenticate("local"), (request, response) => {
  response.sendStatus(StatusCodes.OK);
});

router.get("/status", (request, response) => {
  return request.user
    ? response.send(request.user)
    : response.sendStatus(StatusCodes.UNAUTHORIZED);
});

router.post("/logout", (request, response) => {
  if (!request.user) return response.sendStatus(StatusCodes.UNAUTHORIZED);
  request.logout((err) => {
    if (err) return response.sendStatus(StatusCodes.BAD_REQUEST);
    response.send(StatusCodes.OK);
  });
});

// router.get("/discord", passport.authenticate("discord"));
//
// router.get(
//     "/discord/redirect",
//     passport.authenticate("discord"),
//     (request, response) => {
//         response.sendStatus(StatusCodes.OK);
//     }
// );

export default router;
