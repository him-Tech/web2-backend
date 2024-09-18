import passport from "passport";
import { getUserRepository, UserRepository } from "../db/";
import { User, UserId } from "../model";

const userRepository: UserRepository = getUserRepository();

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user.id);
});

// id passed to deserializeUser is the id returned from serializeUser
passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user with id:", id);
    const user: User | null = await userRepository.getById(id as UserId);
    console.log("Deserialized user:", user);
    user ? done(null, user) : done(new Error("User Not Found"));
  } catch (err) {
    done(err, null);
  }
});

export default passport;
