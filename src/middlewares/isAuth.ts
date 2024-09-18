import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function isAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(StatusCodes.UNAUTHORIZED);
}
