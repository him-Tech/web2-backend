import { ValidationError } from "express-validator";
import { Request, Response } from "express";
import { getUserRepository } from "../db/";
import { User } from "../model";

const userRepo = getUserRepository();

export class UserController {
  static async getUsers(
    request: Request,
    response: Response<User[] | ValidationError[]>,
  ) {
    const users = await userRepo.getAll();
    response.send(users);
  }

  static async getUserById(request: Request, response: Response) {
    response.send({});
  }
}
