import express from "express";
import usersRouter from "./routes/users";
import session from "express-session";
import passport from "passport";
import auth from "./routes/auth";
import { getPool } from "./db";

export function createApp() {
  const app = express();
  var pgSession = require("connect-pg-simple")(session);

  app.use(express.json());
  app.use(
    session({
      secret: "anson the dev", // TODO: process.env.FOO_COOKIE_SECRET
      saveUninitialized: true,
      resave: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      store: new pgSession({
        pool: getPool(),
        tableName: "user_session", // Use another table-name than the default "session" one
        // Insert connect-pg-simple options here
      }),
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/users", usersRouter);
  app.use("/api/auth", auth);

  return app;
}
