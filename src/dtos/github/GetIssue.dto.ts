import { FinancialIssue } from "../../model";

export interface GetIssueQueryParams {
  owner: string;
  repo: string;
  number: number;
}

export interface GetIssueResponse {
  issue: FinancialIssue;
}
