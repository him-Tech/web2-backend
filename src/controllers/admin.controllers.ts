import { Request, Response } from "express";
import {
  CreateAddressBody,
  CreateAddressQuery,
  CreateAddressResponse,
  CreateCompanyBody,
  CreateCompanyQuery,
  CreateCompanyResponse,
  CreateCompanyUserPermissionTokenBody,
  CreateManualInvoiceBody,
  CreateManualInvoiceQuery,
  CreateManualInvoiceResponse,
  ResponseBody,
  SendCompanyAdminInviteBody,
  SendCompanyAdminInviteQuery,
  SendCompanyAdminInviteResponse,
} from "../dtos";
import { StatusCodes } from "http-status-codes";
import {
  getAddressRepository,
  getCompanyRepository,
  getCompanyUserPermissionTokenRepository,
  getManualInvoiceRepository,
} from "../db";
import { secureToken } from "../utils";
import { MailService } from "../services";

const addressRepository = getAddressRepository();
const companyRepository = getCompanyRepository();
const companyUserPermissionTokenRepository =
  getCompanyUserPermissionTokenRepository();
const manualInvoiceRepository = getManualInvoiceRepository();
const mailService = new MailService();

export class AdminController {
  static async createAddress(
    req: Request<{}, {}, CreateAddressBody, CreateAddressQuery>,
    res: Response<ResponseBody<CreateAddressResponse>>,
  ) {
    const created = await addressRepository.create(req.body);

    const response: CreateAddressResponse = {
      createdAddressId: created.id,
    };
    res.status(StatusCodes.CREATED).send({ success: response });
  }

  static async createCompany(
    req: Request<{}, {}, CreateCompanyBody, CreateCompanyQuery>,
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
      SendCompanyAdminInviteBody,
      SendCompanyAdminInviteQuery
    >,
    res: Response<ResponseBody<SendCompanyAdminInviteResponse>>,
  ) {
    const [token, expiresAt] = secureToken.generate({
      email: req.body.userEmail,
    });

    const createCompanyUserPermissionTokenBody: CreateCompanyUserPermissionTokenBody =
      {
        userName: req.body.userName,
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

    for (const permission of existing) {
      await companyUserPermissionTokenRepository.delete(permission.token);
    }

    await companyUserPermissionTokenRepository.create(
      createCompanyUserPermissionTokenBody,
    );

    await mailService.sendCompanyAdminInvite(
      req.body.userName,
      req.body.userEmail,
      token,
    );

    const response: SendCompanyAdminInviteResponse = {};
    res.status(StatusCodes.OK).send({ success: response });
  }

  static async createManualInvoice(
    req: Request<{}, {}, CreateManualInvoiceBody, CreateManualInvoiceQuery>,
    res: Response<ResponseBody<CreateManualInvoiceResponse>>,
  ) {
    const created = await manualInvoiceRepository.create(req.body);
    const response: CreateManualInvoiceResponse = {
      createdInvoiceId: created.id,
    };
    res.status(StatusCodes.CREATED).send({ success: response });
  }
}
