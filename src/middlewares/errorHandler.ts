import { NextFunction } from "express";
import { Request, Response } from "express";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("err");
  const errorStatus = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(errorStatus);

  const responseBody = {
    message: err.message,
    stack: err.stack, // TODO: not for production
  };

  console.error(err.stack); // TODO: log

  res.send("Something went wrong!");
}
