import { config } from "../../config";
import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError";
import { StatusCodes } from "http-status-codes";

export interface TokenData {
  email?: string;
  userId?: string;
}

export class secureToken {
  /**
   *
   * @param data data email or userId
   *
   * @returns token and the expiration date
   */
  static generate(data: TokenData): [string, Date] {
    const expiresSecond = config.jwt.accessExpirationMinutes * 60;
    const expiresAt = new Date(Date.now() + expiresSecond * 1000);
    const token = jwt.sign(
      { exp: Math.floor(expiresSecond), ...data }, // TODO: add a random payload to be sure that each token is unique?
      config.jwt.secret,
    );
    return [token, expiresAt];
  }

  static async verify(token: string): Promise<any> {
    // TODO: lolo
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Invalid token: ${err}`);
    }
  }
}
