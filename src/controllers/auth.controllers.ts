import { Request, Response } from "express";
import { User } from "../model";
import { StatusCodes } from "http-status-codes";

export class AuthController {
  static async status(request: Request, response: Response<User | null>) {
    console.log("Request.isAuthenticated():", request.isAuthenticated());
    if (request.isAuthenticated()) {
      return response.status(StatusCodes.OK).send(request.user);
    } else {
      return response.status(StatusCodes.OK).send(null);
    }
  }

  static async register(request: Request, response: Response) {
    response.sendStatus(StatusCodes.CREATED);
  }

  static async login(request: Request, response: Response) {
    response.sendStatus(StatusCodes.OK);
  }

  static async logout(request: Request, response: Response) {
    if (!request.user) return response.send(StatusCodes.OK);
    request.logout((err) => {
      if (err) return response.sendStatus(StatusCodes.BAD_REQUEST);
      response.send(StatusCodes.OK);
    });
  }
}
