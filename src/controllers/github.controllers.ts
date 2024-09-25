import { Request, Response } from "express";
import { ResponseDto } from "../dtos";
import {
  GetIssuesDto,
  GetIssuesQueryParams,
  GetIssuesResponse,
} from "../dtos/GetIssues.dto";
import {
  GetIssueDto,
  GetIssueQueryParams,
  GetIssueResponse,
} from "../dtos/GetIssue.dto";
import { getGitHubAPI } from "../services/github.service";
import * as model from "../model";
import { FinancialIssue } from "../model";

const github = getGitHubAPI();

export class GithubController {
  static async issues(
    request: Request<{}, {}, GetIssuesDto, GetIssuesQueryParams>,
    response: Response<ResponseDto<GetIssuesResponse>>,
  ) {}

  static async issue(
    request: Request<{}, {}, GetIssueDto, GetIssueQueryParams>,
    response: Response<ResponseDto<GetIssueResponse>>,
  ) {
    const { params }: GetIssueQueryParams = request;
    const [owner, repository] = await github.getOwnerAndRepository(
      params.owner,
      params.repo,
    );
    const [issue, openedBy] = await github.getIssue(
      params.owner,
      params.repo,
      params.number,
    );

    // TODO: error handling
    const amountCollected = 30; //await sdk.getIssueFundingAmount({ financialIssue, repository: repo, number: number });

    const issueStatus = issue.closedAt
      ? new model.Closed(amountCollected)
      : new model.CollectToBeApproved(amountCollected);

    return new FinancialIssue(owner, repository, issue, openedBy, issueStatus);
  }
}
