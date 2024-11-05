import { Request, Response } from "express";
import {
  CreateIssueFundingBody,
  FundIssueBody,
  FundIssueParams,
  FundIssueQuery,
  FundIssueResponse,
  GetIssueBody,
  GetIssueParams,
  GetIssueQuery,
  GetIssueResponse,
  GetIssuesBody,
  GetIssuesParams,
  GetIssuesResponse,
  ResponseBody,
} from "../dtos";
import {
  CompanyId,
  IssueId,
  ManagedIssueState,
  OwnerId,
  RepositoryId,
} from "../model";
import { getFinancialIssueRepository } from "../db/FinancialIssue.repository";
import { StatusCodes } from "http-status-codes";
import {
  getDowNumberRepository,
  getIssueFundingRepository,
  getIssueRepository,
  getManagedIssueRepository,
} from "../db";
import { ApiError } from "../model/error/ApiError";
import Decimal from "decimal.js";

const issueRepository = getIssueRepository();
const financialIssueRepository = getFinancialIssueRepository();
const dowNumberRepository = getDowNumberRepository();
const managedIssueRepository = getManagedIssueRepository();
const issueFundingRepo = getIssueFundingRepository();

export class GithubController {
  static async issues(
    req: Request<
      GetIssuesParams,
      ResponseBody<GetIssuesResponse>,
      GetIssuesBody,
      {}
    >,
    res: Response<ResponseBody<GetIssuesResponse>>,
  ) {
    const issues = await financialIssueRepository.getAll();

    const response: GetIssuesResponse = {
      issues: issues,
    };
    res.status(StatusCodes.OK).send({ success: response });
  }

  static async issue(
    req: Request<
      GetIssueParams,
      ResponseBody<GetIssueResponse>,
      GetIssueBody,
      GetIssueQuery
    >,
    res: Response<ResponseBody<GetIssueResponse>>,
  ) {
    const ownerId = new OwnerId(req.params.owner);
    const repositoryId = new RepositoryId(ownerId, req.params.repo);
    const issueId = new IssueId(repositoryId, req.params.number);

    const issue = await financialIssueRepository.get(issueId);

    if (issue === null) {
      res.sendStatus(StatusCodes.NOT_FOUND);
    } else {
      const response: GetIssueResponse = {
        issue: issue,
      };

      res.status(StatusCodes.OK).send({ success: response });
    }
  }

  // TODO: security issue - this operation does not have an atomic check for the user's DoWs, user can spend DoWs that they don't have
  static async fundIssue(
    req: Request<
      FundIssueParams,
      ResponseBody<FundIssueResponse>,
      FundIssueBody,
      FundIssueQuery
    >,
    res: Response<ResponseBody<FundIssueResponse>>,
  ) {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized");
    }

    // TODO: fix this mess with optional githubId
    const ownerId = new OwnerId(req.params.owner);
    const repositoryId = new RepositoryId(ownerId, req.params.repo);
    const issue = await issueRepository.getById(
      new IssueId(repositoryId, req.params.number),
    );

    if (issue === null) {
      res.sendStatus(StatusCodes.NOT_FOUND);
      return;
    }

    const companyId = req.body.companyId
      ? new CompanyId(req.body.companyId)
      : undefined;
    const dowAmount = new Decimal(req.body.dowAmount);

    const managedIssue = await managedIssueRepository.getByIssueId(issue.id);
    if (
      managedIssue !== null &&
      managedIssue.state === ManagedIssueState.REJECTED
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Cannot fund an issue where funding was rejected before.",
      );
    }

    const availableDoWs = await dowNumberRepository.getAvailableDoWs(
      req.user.id,
      companyId,
    );
    if (dowAmount.greaterThan(availableDoWs)) {
      throw new ApiError(StatusCodes.PAYMENT_REQUIRED, "Not enough DoWs");
    }
    if (availableDoWs.isNeg()) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "The amount of available DoWs is negative",
      );
    }

    const issueFunding: CreateIssueFundingBody = {
      githubIssueId: issue.id,
      userId: req.user.id,
      downAmount: dowAmount,
    };

    await issueFundingRepo.create(issueFunding);

    return res.sendStatus(StatusCodes.CREATED);
  }
}
