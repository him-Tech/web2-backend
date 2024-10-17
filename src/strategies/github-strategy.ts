import passport from "passport";
import { Strategy } from "passport-github";
import { getUserRepository, UserRepository } from "../db/";
import { Provider, ThirdPartyUser, ThirdPartyUserId } from "../model";
import { config } from "../config";

const repo: UserRepository = getUserRepository();

passport.use(
  <passport.Strategy>new Strategy(
    {
      clientID: config.github.clientId,
      clientSecret: config.github.clientSecret,
      callbackURL: "/api/v1/auth/redirect/github",
      scope: [""],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const findUser = await repo.findByThirdPartyId(
          new ThirdPartyUserId(profile.id),
          Provider.Github,
        );
        if (!findUser) {
          const user = ThirdPartyUser.fromJson(profile);
          if (user instanceof Error) {
            return done(user);
          }
          const newSavedUser = await repo.insertGithub(user);
          return done(null, newSavedUser);
        }
        return done(null, findUser);
      } catch (err) {
        return done(err);
      }
    },
  ),
);
