import { NextFunction, Request, Response } from "express";
import { User } from "../model";
import { StatusCodes } from "http-status-codes";
import { ResponseDto } from "../dtos";
import {
  RegisterDto,
  RegisterQueryParams,
  RegisterResponse,
} from "../dtos/auth";
import { secureToken, TokenData } from "../model/utils";
import {
  getCompanyUserPermissionTokenRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../db";
import { ApiError } from "../model/utils/ApiError";

const companyUserPermissionTokenRepo =
  getCompanyUserPermissionTokenRepository();
const userRepo = getUserRepository();
const userCompanyRepo = getUserCompanyRepository();

export class AuthController {
  static async status(request: Request, response: Response<User | null>) {
    if (request.isAuthenticated()) {
      return response.status(StatusCodes.OK).send(request.user! as User); // TODO: json instead of send ?
    } else {
      return response.status(StatusCodes.OK).send(null);
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

  static async login(request: Request, response: Response) {
    response.sendStatus(StatusCodes.OK);
  }

  static async logout(request: Request, response: Response) {
    if (!request.user) return response.sendStatus(StatusCodes.OK);
    request.logout((err) => {
      if (err) return response.sendStatus(StatusCodes.BAD_REQUEST);
      response.sendStatus(StatusCodes.OK);
    });
  }
}
