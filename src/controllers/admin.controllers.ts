import { Request, Response } from "express";
import {
  CreateAddressBodyParams,
  CreateAddressQueryParams,
  CreateAddressResponse,
  CreateCompanyBodyParams,
  CreateCompanyQueryParams,
  CreateCompanyResponse,
  CreateCompanyUserPermissionTokenBodyParams,
  ResponseBody,
  SendCompanyAdminInviteBodyParams,
  SendCompanyAdminInviteQueryParams,
  SendCompanyAdminInviteResponse,
} from "../dtos";
import { StatusCodes } from "http-status-codes";
import {
  getAddressRepository,
  getCompanyRepository,
  getCompanyUserPermissionTokenRepository,
} from "../db";
import { secureToken } from "../utils";
import { MailService } from "../services";

const addressRepository = getAddressRepository();
const companyRepository = getCompanyRepository();
const companyUserPermissionTokenRepository =
  getCompanyUserPermissionTokenRepository();
const mailService = new MailService();

export class AdminController {
  static async createAddress(
    req: Request<{}, {}, CreateAddressBodyParams, CreateAddressQueryParams>,
    res: Response<ResponseBody<CreateAddressResponse>>,
  ) {
    const created = await addressRepository.create(req.body);

    const response: CreateAddressResponse = {
      createdAddressId: created.id,
    };
    res.status(StatusCodes.CREATED).send({ success: response });
  }

  static async createCompany(
    req: Request<{}, {}, CreateCompanyBodyParams, CreateCompanyQueryParams>,
    res: Response<ResponseBody<CreateCompanyResponse>>,
  ) {
    const created = await companyRepository.create(req.body);
    const response: CreateCompanyResponse = {
      createdCompanyId: created.id,
    };
    res.status(StatusCodes.CREATED).send({ success: response });
  }

  static async sendCompanyAdminInvite(
    req: Request<
      {},
      {},
      SendCompanyAdminInviteBodyParams,
      SendCompanyAdminInviteQueryParams
    >,
    res: Response<ResponseBody<SendCompanyAdminInviteResponse>>,
  ) {
    const [token, expiresAt] = secureToken.generate({
      email: req.body.userEmail,
    });

    const createCompanyUserPermissionTokenBodyParams: CreateCompanyUserPermissionTokenBodyParams =
      {
        userEmail: req.body.userEmail,
        token: token,
        companyId: req.body.companyId,
        companyUserRole: req.body.companyUserRole,
        expiresAt: expiresAt,
      };

    const existing = await companyUserPermissionTokenRepository.getByUserEmail(
      req.body.userEmail,
      req.body.companyId,
    );
    existing.forEach((permission) => {
      companyUserPermissionTokenRepository.delete(permission.token);
    });

    await companyUserPermissionTokenRepository.create(
      createCompanyUserPermissionTokenBodyParams,
    );

    await mailService.sendCompanyAdminInvite(req.body.userEmail, token);

    const response: SendCompanyAdminInviteResponse = {};
    res.status(StatusCodes.OK).send({ success: response });
  }
}
