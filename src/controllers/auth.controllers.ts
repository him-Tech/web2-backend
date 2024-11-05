import { NextFunction, Request, Response } from "express";
import {
  Company,
  CompanyUserPermissionToken,
  CompanyUserRole,
  User,
  UserId,
} from "../model";
import { StatusCodes } from "http-status-codes";
import {
  GetCompanyUserInviteInfoQuery,
  GetCompanyUserInviteInfoResponse,
  LoginBody,
  LoginQuery,
  LoginResponse,
  RegisterBody,
  RegisterQuery,
  RegisterResponse,
  ResponseBody,
  StatusBody,
  StatusQuery,
  StatusResponse,
} from "../dtos";
import { secureToken } from "../utils";
import {
  getCompanyRepository,
  getCompanyUserPermissionTokenRepository,
  getUserCompanyRepository,
  getUserRepository,
} from "../db";
import { ApiError } from "../model/error/ApiError";

const companyRepo = getCompanyRepository();
const companyUserPermissionTokenRepo =
  getCompanyUserPermissionTokenRepository();
const userRepo = getUserRepository();
const userCompanyRepo = getUserCompanyRepository();

export class AuthController {
  // TODO: probably put info of the company in the session, to to much avoid request to the DB.
  //       Now, it is not the best implementation, but it works for now
  private static async getCompanyRoles(
    userId: UserId,
  ): Promise<[Company | null, CompanyUserRole | null]> {
    let company: Company | null = null;
    let companyRole: CompanyUserRole | null = null;

    const companyRoles = await userCompanyRepo.getByUserId(userId);
    if (companyRoles.length > 1) {
      throw new ApiError(
        StatusCodes.NOT_IMPLEMENTED,
        "User has multiple company roles",
      );
    } else if (companyRoles.length === 1) {
      const [companyId, role] = companyRoles[0];
      company = await companyRepo.getById(companyId);
      companyRole = role;
    }

    return [company, companyRole];
  }

  static async status(
    req: Request<{}, {}, StatusBody, StatusQuery>,
    res: Response<ResponseBody<StatusResponse>>,
  ) {
    if (req.isAuthenticated() && req.user) {
      const [company, companyRole] = await AuthController.getCompanyRoles(
        req.user.id,
      );

      const response: StatusResponse = {
        user: req.user as User,
        company: company,
        companyRole: companyRole,
      };
      return res.status(StatusCodes.OK).send({ success: response }); // TODO: json instead of send ?
    } else {
      const response: StatusResponse = {
        user: null,
        company: null,
        companyRole: null,
      };
      return res.status(StatusCodes.OK).send({ success: response });
    }
  }

  static async verifyCompanyToken(
    req: Request<{}, {}, RegisterBody, RegisterQuery>,
    res: Response<ResponseBody<RegisterResponse>>,
    next: NextFunction,
  ) {
    const query: RegisterQuery = req.query;

    if (query.companyToken) {
      const companyUserPermissionToken =
        await companyUserPermissionTokenRepo.getByToken(query.companyToken);
      const tokenData = await secureToken.verify(query.companyToken);

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
    req: Request<{}, {}, RegisterBody, RegisterQuery>,
    res: Response<ResponseBody<RegisterResponse>>,
  ) {
    // @ts-ignore TODO: why is this not working?
    const companyUserPermissionToken = req.companyUserPermissionToken!; // TODO: improve
    const userId = req.user?.id!; // TODO: improve

    const query: RegisterQuery = req.query;
    await userRepo.validateEmail(req.body.email);

    await userCompanyRepo.insert(
      userId,
      companyUserPermissionToken.companyId,
      companyUserPermissionToken.companyUserRole,
    );
    if (query.companyToken) {
      await companyUserPermissionTokenRepo.delete(query.companyToken);
    }

    res.sendStatus(StatusCodes.CREATED);
  }

  static async register(
    req: Request<{}, {}, RegisterBody, RegisterQuery>,
    res: Response<ResponseBody<RegisterResponse>>,
  ) {
    const response: RegisterResponse = {
      user: req.user as User,
      company: null,
      companyRole: null,
    };
    return res.status(StatusCodes.CREATED).send({ success: response });
  }

  static async login(
    req: Request<{}, {}, LoginBody, LoginQuery>,
    res: Response<ResponseBody<LoginResponse>>,
  ) {
    const user = req.user as User;
    const [company, companyRole] = await AuthController.getCompanyRoles(
      user.id,
    );

    const response: LoginResponse = {
      user: user,
      company,
      companyRole,
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
    req: Request<{}, {}, {}, GetCompanyUserInviteInfoQuery>,
    res: Response<ResponseBody<GetCompanyUserInviteInfoResponse>>,
  ) {
    const query: GetCompanyUserInviteInfoQuery = req.query;

    const companyUserPermissionToken: CompanyUserPermissionToken | null =
      await companyUserPermissionTokenRepo.getByToken(query.token);

    if (companyUserPermissionToken === null) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Token invalid or expired: ${query.token}`,
      );
    } else if (companyUserPermissionToken.expiresAt < new Date()) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Token invalid or expired: ${query.token}`,
      );
    } else {
      const response: GetCompanyUserInviteInfoResponse = {
        userName: companyUserPermissionToken.userName,
        userEmail: companyUserPermissionToken.userEmail,
      };
      return res.status(StatusCodes.OK).send({ success: response });
    }
  }
}
