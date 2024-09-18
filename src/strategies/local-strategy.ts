import passport from "passport";
import { Strategy } from "passport-local";

import { encrypt } from "./helpers";
import { getUserRepository, UserRepository } from "../db/";
import { LocalUser, User } from "../model";
import { CreateLocalUserDto } from "../dtos";

const repo: UserRepository = getUserRepository();

passport.use(
  "local-login",
  // email field in the request body and send that as argument for the username
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (username, password, done) => {
      console.log("Strategy: local-login:");
      try {
        const user: User | null = await repo.findOne(username);
        if (!user) {
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        } else if (!(user.data instanceof LocalUser)) {
          return done(null, false, {
            message: "Already registered with a third party",
          });
        } else if (
          !encrypt.comparePassword(password, user.data.hashedPassword)
        ) {
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        } else {
          return done(null, user); // user object attaches to the request as req.user
        }
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  "local-register",
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      console.log("Strategy: local-register:");

      try {
        const user: User | null = await repo.findOne(email);
        if (user) {
          if (!(user.data instanceof LocalUser)) {
            return done(null, false, {
              message: "Already registered with a third party",
            });
          } else if (
            !encrypt.comparePassword(password, user.data.hashedPassword)
          ) {
            return done(null, false, {
              message: "Incorrect username or password.",
            });
          } else {
            return done(null, user); // user object attaches to the request as req.user
          }
        }

        const savedUser = await repo.insertLocal({
          email,
          password,
        } as CreateLocalUserDto);
        return done(null, savedUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);
