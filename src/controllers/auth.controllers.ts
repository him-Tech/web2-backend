import { NextFunction, Request, Response } from "express";
import { User } from "../model";
import { StatusCodes } from "http-status-codes";
import { ResponseDto } from "../dtos";
import {
  RegisterDto,
  RegisterQueryParams,
  RegisterResponse,
} from "../dtos/auth";
import { secureToken, TokenData } from "../utils";
import {
  getCompanyUserPermissionTokenRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../db";
import { ApiError } from "../model/error/ApiError";
import {
  StatusDto,
  StatusQueryParams,
  StatusResponse,
} from "../dtos/auth/Status.dto";

const companyUserPermissionTokenRepo =
  getCompanyUserPermissionTokenRepository();
const userRepo = getUserRepository();
const userCompanyRepo = getUserCompanyRepository();

export class AuthController {
  static async status(
    req: Request<{}, {}, StatusDto, StatusQueryParams>,
    res: Response<ResponseDto<StatusResponse>>,
  ) {
    if (req.isAuthenticated() && req.user) {
      const response: StatusResponse = {
        user: req.user as User,
      };
      return res.status(StatusCodes.OK).send({ success: response }); // TODO: json instead of send ?
    } else {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .send({ error: "Unauthorized" });
    }
  }

  static async verifyCompanyToken(
    req: Request<{}, {}, RegisterDto, RegisterQueryParams>,
    res: Response<ResponseDto<RegisterResponse>>,
    next: NextFunction,
  ) {
    // @ts-ignore TODO: why is this not working?
    const { params }: RegisterQueryParams = req;

    if (params.companyToken) {
      const companyUserPermissionToken =
        await companyUserPermissionTokenRepo.getByToken(params.companyToken);
      const tokenData = (await secureToken.verify(
        params.companyToken,
      )) as TokenData;

      if (companyUserPermissionToken === null) {
        next(new ApiError(StatusCodes.BAD_REQUEST, "Token invalid"));
      } else if (companyUserPermissionToken?.userEmail !== req.body.email) {
        next(new ApiError(StatusCodes.BAD_REQUEST, "Token invalid"));
      } else if (companyUserPermissionToken?.userEmail !== tokenData.email) {
        next(
          new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Tokens are not matching",
          ),
        );
      } else if (companyUserPermissionToken.expiresAt < new Date()) {
        next(new ApiError(StatusCodes.BAD_REQUEST, "Token expired"));
      } else {
        // Pass the verified token if needed
        // @ts-ignore TODO: why is this not working?
        req.companyUserPermissionToken = companyUserPermissionToken;
        next();
      }
    } else {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "No token provided"));
    }
  }

  static async registerAsCompany(
    req: Request<{}, {}, RegisterDto, RegisterQueryParams>,
    res: Response<ResponseDto<RegisterResponse>>,
  ) {
    // @ts-ignore TODO: why is this not working?
    const companyUserPermissionToken = req.companyUserPermissionToken!; // TODO: improve
    const userId = req.user?.id!; // TODO: improve

    // @ts-ignore TODO: why is this not working?
    const { params }: RegisterQueryParams = req;
    await userRepo.validateEmail(req.body.email);

    await userCompanyRepo.insert(
      userId,
      companyUserPermissionToken.companyId,
      companyUserPermissionToken.companyUserRole,
    );
    await companyUserPermissionTokenRepo.delete(params.companyToken);

    res.sendStatus(StatusCodes.CREATED);
  }

  static async register(
    req: Request<{}, {}, RegisterDto, {}>,
    res: Response<ResponseDto<RegisterResponse>>,
  ) {
    res.sendStatus(StatusCodes.CREATED);
  }

  static async login(req: Request, res: Response) {
    res.sendStatus(StatusCodes.OK);
  }

  static async logout(req: Request, res: Response) {
    if (!req.user) return res.sendStatus(StatusCodes.OK);
    req.logout((err) => {
      if (err) return res.sendStatus(StatusCodes.BAD_REQUEST);
      res.sendStatus(StatusCodes.OK);
    });
  }
}
