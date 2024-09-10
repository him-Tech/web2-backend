import passport from "passport";
import { getUserRepository, UserRepository } from "../db/UserRepository";
import { Provider, ThirdPartyUserId, User, UserId } from "../model";
import {
  getThirdPartyUserRepository,
  ThirdPartyUserRepository,
} from "../db/ThirdPartyUserRepository";

const userRepository: UserRepository = getUserRepository();
const thirdPartyUserRepo: ThirdPartyUserRepository =
  getThirdPartyUserRepository();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

// id passed to deserializeUser is the id returned from serializeUser
passport.deserializeUser(async (id, done) => {
  try {
    const user: User | null = await userRepository.getById(id as UserId);
    if (!user) {
      const findUser = await thirdPartyUserRepo.getById(
        // TODO: optimize this in the DB
        id as ThirdPartyUserId,
        Provider.GitHub,
      );
      return findUser
        ? done(null, findUser)
        : done(new Error("User Not Found"));
    }
    done(null, user); // user object attaches to the request as req.user
  } catch (err) {
    done(err, null);
  }
});

export default passport;
