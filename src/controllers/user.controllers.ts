import { ValidationError, validationResult } from "express-validator";
import { Request, Response } from "express";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { CreateUserQueryParams } from "../types/query-params";
import { getUserRepository } from "../db/userRepository";
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

  static async createUser(
    request: Request<{}, {}, CreateUserDto, CreateUserQueryParams>,
    response: Response<User | ValidationError[]>,
  ) {
    const result = validationResult(request);
    if (!result.isEmpty()) return response.status(400).send(result.array());

    try {
      const savedUser = await repo.insert(request.body);
      return response.status(201).send(savedUser);
    } catch (err) {
      console.log("Error: ", err);
      return response.sendStatus(400);
    }
  }

  // async signup(req: Request, res: Response) {
  //   const { name, email, password, role } = req.body;
  //   const encryptedPassword = await encrypt.encryptpass(password);
  //   const user = new User();
  //   user.name = name;
  //   user.email = email;
  //   user.password = encryptedPassword;
  //   user.role = role;
  //
  //   const userRepository = AppDataSource.getRepository(User);
  //   await userRepository.save(user);
  //
  //   // userRepository.create({ Name, email, password });
  //   const token = encrypt.generateToken({ id: user.id });
  //
  //   return res
  //     .status(201)
  //     .json({ message: "User created successfully", token, user });
  // }

  // async getUsers(req: Request, res: Response) {
  //   const data = cache.get("data");
  //   if (data) {
  //     console.log("serving from cache");
  //     return res.status(200).json({
  //       data,
  //     });
  //   } else {
  //     console.log("serving from db");
  //     const userRepository = AppDataSource.getRepository(User);
  //     const users = await userRepository.find();
  //
  //     cache.put("data", users, 6000);
  //     return res.status(200).json({
  //       data: users,
  //     });
  //   }
  // }
  // async updateUser(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const { name, email } = req.body;
  //   const userRepository = AppDataSource.getRepository(User);
  //   const user = await userRepository.findOne({
  //     where: { id },
  //   });
  //   user.name = name;
  //   user.email = email;
  //   await userRepository.save(user);
  //   res.status(200).json({ message: "udpdate", user });
  // }
  //
  // async deleteUser(req: Request, res: Response) {
  //   const { id } = req.params;
  //   const userRepository = AppDataSource.getRepository(User);
  //   const user = await userRepository.findOne({
  //     where: { id },
  //   });
  //   await userRepository.remove(user);
  //   res.status(200).json({ message: "ok" });
  // }
}
