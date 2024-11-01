import { Request, Response } from "express";
import {
  CreateIssueFundingBody,
  FundIssueBody,
  FundIssueQuery,
  FundIssueResponse,
  GetIssueQuery,
  GetIssueResponse,
  GetIssuesQuery,
  GetIssuesResponse,
  ResponseBody,
} from "../dtos";
import {
  IssueId,
  ManagedIssueState,
  OwnerId,
  RepositoryId,
  User,
} from "../model";
import { getFinancialIssueRepository } from "../db/FinancialIssue.repository";
import { StatusCodes } from "http-status-codes";
import {
  getDowNumberRepository,
  getIssueFundingRepository,
  getManagedIssueRepository,
} from "../db";
import { ApiError } from "../model/error/ApiError";

const financialIssueRepository = getFinancialIssueRepository();
const dowNumberRepository = getDowNumberRepository();
const managedIssueRepository = getManagedIssueRepository();
const issueFundingRepo = getIssueFundingRepository();

export class GithubController {
  static async issues(
    req: Request<{}, {}, {}, GetIssuesQuery>,
    res: Response<ResponseBody<GetIssuesResponse>>,
  ) {
    const issues = await financialIssueRepository.getAll();

    const response: GetIssuesResponse = {
      issues: issues,
    };
    res.status(StatusCodes.OK).send({ success: response });
  }

  static async issue(
    req: Request<{}, {}, {}, GetIssueQuery>,
    res: Response<ResponseBody<GetIssueResponse>>,
  ) {
    const query: GetIssueQuery = req.query;
    const ownerId = new OwnerId(query.owner);
    const repositoryId = new RepositoryId(ownerId, query.repo);
    const issueId = new IssueId(repositoryId, query.number);

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
    req: Request<{}, {}, FundIssueBody, FundIssueQuery>,
    res: Response<ResponseBody<FundIssueResponse>>,
  ) {
    const user = req.user! as User;

    const query: FundIssueQuery = req.query;
    const ownerId = new OwnerId(query.owner);
    const repositoryId = new RepositoryId(ownerId, query.repo);
    const issueId = new IssueId(repositoryId, query.number);

    const managedIssue = await managedIssueRepository.getByIssueId(issueId);
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
      user.id,
      req.body.companyId,
    );
    if (availableDoWs > req.body.dowAmount) {
      throw new ApiError(StatusCodes.PAYMENT_REQUIRED, "Not enough DoWs");
    }
    if (availableDoWs < 0) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "The amount of available DoWs is negative",
      );
    }

    await issueFundingRepo.create({
      issueId,
      userId: user.id,
      downAmount: req.body.dowAmount,
    } as CreateIssueFundingBody);

    return res.sendStatus(StatusCodes.CREATED);
  }
}
