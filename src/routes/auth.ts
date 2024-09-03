import {Router} from "express";
import {UserController} from "../controllers/user.controllers";
import passport from "passport";

const router = Router();

router.post(
    "/",
    passport.authenticate("local"),
    (request, response) => {
        response.sendStatus(200);
    }
);

router.get(
    "/status",
    (request, response) => {
        return request.user ? response.send(request.user) : response.sendStatus(401);
    }
);

router.post(
    "/logout",
    (request, response) => {
        if (!request.user) return response.sendStatus(401);
        request.logout((err) => {
            if (err) return response.sendStatus(400);
            response.send(200);
        });
    }
);

// router.get("/discord", passport.authenticate("discord"));
//
// router.get(
//     "/discord/redirect",
//     passport.authenticate("discord"),
//     (request, response) => {
//         response.sendStatus(200);
//     }
// );

export default router;