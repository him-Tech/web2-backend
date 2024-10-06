import { IssueId, UserId } from "../model";

export interface CreateIssueFundingDto {
  githubIssueId: IssueId;
  userId: UserId;
  downAmount: number;
}
