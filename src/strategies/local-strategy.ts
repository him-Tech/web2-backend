import passport from "passport";
import {Strategy} from "passport-local";
import {encrypt} from "./helpers";
import {getUserRepository, UserRepository} from "../db/userRepository";
import {User, UserId} from "../model";

// TODO
declare global {
	namespace Express {
		interface User {
			id: UserId;
		}
	}
}

const userRepository: UserRepository = getUserRepository()

passport.serializeUser((user, done) => {
	done(null, user.id);
});

// id passed to deserializeUser is the id returned from serializeUser
passport.deserializeUser(async (id, done) => {
	try {
		const user: User = await userRepository.getById(id as UserId);
		if (!user) return done(new Error("User Not Found"));
		done(null, user); // user object attaches to the request as req.user
	} catch (err) {
		done(err, null);
	}
});

passport.use(
	// email field in the request body and send that as argument for the username
	new Strategy({usernameField: "email"}, async (username, password, done) => {
		try {
			// const user: User = await userRepository.findOne(username);
			// if (!user) return done(new Error("User not found"));
			// else if (!encrypt.comparePassword(password, user.password)) return done(new Error("Bad Credentials"));
			// else done(null, user); // user object attaches to the request as req.user
		} catch (err) {
			done(err);
		}
	})
);
