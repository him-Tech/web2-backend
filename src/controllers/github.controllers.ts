import { validationResult } from "express-validator";
import { Request, Response } from "express";
import { ResponseDto } from "../dtos";
import { getUserRepository } from "../db/";
import { StatusCodes } from "http-status-codes";
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

const userRepo = getUserRepository();
const githubService = getGitHubAPI();

export class GithubController {
  static async issues(
    request: Request<{}, {}, GetIssuesDto, GetIssuesQueryParams>,
    response: Response<ResponseDto<GetIssuesResponse>>,
  ) {
    githubService.getIssue(
      request.params.owner,
      request.params.repo,
      request.params.number,
    );
  }

  static async issue(
    request: Request<{}, {}, GetIssueDto, GetIssueQueryParams>,
    response: Response<ResponseDto<GetIssueResponse>>,
  ) {}
}
