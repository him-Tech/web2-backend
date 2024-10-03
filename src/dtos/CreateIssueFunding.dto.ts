import { GithubIssueId, UserId } from "../model";

export interface CreateIssueFundingDto {
  githubIssueId: GithubIssueId;
  userId: UserId;
  downAmount: number;
}
