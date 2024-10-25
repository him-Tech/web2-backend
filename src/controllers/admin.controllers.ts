import { Request, Response } from "express";
import {
  CreateCompanyUserPermissionTokenDto,
  ResponseDto,
  SendCompanyAdminInviteDto,
  SendCompanyAdminInviteQueryParams,
  SendCompanyAdminInviteResponse,
} from "../dtos";
import { StatusCodes } from "http-status-codes";
import { getCompanyUserPermissionTokenRepository } from "../db";
import { secureToken } from "../model/utils";
import { MailService } from "../services";

const companyUserPermissionTokenRepository =
  getCompanyUserPermissionTokenRepository();
const mailService = new MailService();

export class AdminController {
  static async sendCompanyAdminInvite(
    req: Request<
      {},
      {},
      SendCompanyAdminInviteDto,
      SendCompanyAdminInviteQueryParams
    >,
    res: Response<ResponseDto<SendCompanyAdminInviteResponse>>,
  ) {
    const [token, expiresAt] = secureToken.generate({
      email: req.body.userEmail,
    });
    const createCompanyUserPermissionTokenDto = {
      userEmail: req.body.userEmail,
      token: token,
      companyId: req.body.companyId,
      companyUserRole: req.body.companyUserRole,
      expiresAt: expiresAt,
    } as CreateCompanyUserPermissionTokenDto;

    const existing = await companyUserPermissionTokenRepository.getByUserEmail(
      req.body.userEmail,
      req.body.companyId,
    );
    existing.forEach((permission) => {
      companyUserPermissionTokenRepository.delete(permission.token);
    });

    await companyUserPermissionTokenRepository.create(
      createCompanyUserPermissionTokenDto,
    );

    await mailService.sendCompanyAdminInvite(req.body.userEmail, token);

    const response: SendCompanyAdminInviteResponse = {};
    res.status(StatusCodes.OK).send({ data: response });
  }
}
