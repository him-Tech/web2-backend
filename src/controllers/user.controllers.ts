import { ValidationError } from "express-validator";
import { Request, Response } from "express";
import { getUserRepository } from "../db/";
import { User } from "../model";

const repo = getUserRepository();

export class UserController {
  static async getUsers(
    request: Request,
    response: Response<User[] | ValidationError[]>,
  ) {
    console.log("Getting all users");
    const users = await repo.getAll();
    response.send(users);
  }

  static async getUserById(request: Request, response: Response) {
    response.send({});
  }
}
