import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

// TODO
const saltRounds = 10;
dotenv.config();
const { JWT_SECRET = "" } = process.env;

export class encrypt {
  static async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  }

  static comparePassword(hashPassword: string, password: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  // import * as jwt from "jsonwebtoken";
  // static generateToken(payload: payload) {
  // 	return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
  // }
}
