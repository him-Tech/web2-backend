import { CompanyId } from "../../model";

export interface FundIssueDto {
  companyId?: CompanyId;
  dowAmount: number;
}

export interface FundIssueQueryParams {
  owner: string;
  repo: string;
  number: number;
}

export interface FundIssueResponse {}
