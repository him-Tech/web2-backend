import { NextFunction, Request, Response } from "express";
import { CompanyUserPermissionToken, User } from "../model";
import { StatusCodes } from "http-status-codes";
import { ResponseBody } from "../dtos";
import {
  LoginBodyParams,
  LoginQueryParams,
  LoginResponse,
  RegisterBodyParams,
  RegisterQueryParams,
  RegisterResponse,
  StatusBodyParams,
  StatusQueryParams,
  StatusResponse,
} from "../dtos/auth";
import { secureToken, TokenData } from "../utils";
import {
  getCompanyUserPermissionTokenRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../db";
import { ApiError } from "../model/error/ApiError";
import {
  GetCompanyUserInviteInfoBodyParams,
  GetCompanyUserInviteInfoQueryParams,
  GetCompanyUserInviteInfoResponse,
} from "../dtos/auth";

const companyUserPermissionTokenRepo =
  getCompanyUserPermissionTokenRepository();
const userRepo = getUserRepository();
const userCompanyRepo = getUserCompanyRepository();

export class AuthController {
  static async status(
    req: Request<{}, {}, StatusBodyParams, StatusQueryParams>,
    res: Response<ResponseBody<StatusResponse>>,
  ) {
    if (req.isAuthenticated() && req.user) {
      const response: StatusResponse = {
        user: req.user as User,
      };
      return res.status(StatusCodes.OK).send({ success: response }); // TODO: json instead of send ?
    } else {
      const response: StatusResponse = {
        user: null,
      };
      return res.status(StatusCodes.OK).send({ success: response });
    }
  }

  static async verifyCompanyToken(
    req: Request<{}, {}, RegisterBodyParams, RegisterQueryParams>,
    res: Response<ResponseBody<RegisterResponse>>,
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
    req: Request<{}, {}, RegisterBodyParams, RegisterQueryParams>,
    res: Response<ResponseBody<RegisterResponse>>,
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
    req: Request<{}, {}, RegisterBodyParams, RegisterQueryParams>,
    res: Response<ResponseBody<RegisterResponse>>,
  ) {
    const response: RegisterResponse = {
      user: req.user as User,
    };
    return res.status(StatusCodes.CREATED).send({ success: response });
  }

  static async login(
    req: Request<{}, {}, LoginBodyParams, LoginQueryParams>,
    res: Response<ResponseBody<LoginResponse>>,
  ) {
    const response: LoginResponse = {
      user: req.user as User,
    };
    return res.status(StatusCodes.OK).send({ success: response });
  }

  static async logout(req: Request, res: Response) {
    if (!req.user) return res.sendStatus(StatusCodes.OK);
    req.logout((err) => {
      if (err) return res.sendStatus(StatusCodes.BAD_REQUEST);
      res.sendStatus(StatusCodes.OK);
    });
  }

  static async getCompanyUserInviteInfo(
    req: Request<
      {},
      {},
      GetCompanyUserInviteInfoBodyParams,
      GetCompanyUserInviteInfoQueryParams
    >,
    res: Response<ResponseBody<GetCompanyUserInviteInfoResponse>>,
  ) {
    // @ts-ignore TODO: why is this not working?
    const { params }: GetCompanyUserInviteInfoQueryParams = req.params;
    const companyUserPermissionToken: CompanyUserPermissionToken | null =
      await companyUserPermissionTokenRepo.getByToken(params.token);

    if (companyUserPermissionToken === null) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Token invalid or expired");
    } else if (companyUserPermissionToken.expiresAt < new Date()) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Token invalid or expired");
    } else {
      const response: GetCompanyUserInviteInfoResponse = {
        userName: companyUserPermissionToken.userName,
        userEmail: companyUserPermissionToken.userEmail,
      };
      return res.status(StatusCodes.OK).send({ success: response });
    }
  }
}
