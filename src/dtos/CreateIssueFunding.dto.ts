import { GithubIssueId, IssueId, StripeProductId, UserId } from "../model";

export interface CreateIssueFundingDto {
  githubIssueId: GithubIssueId;
  userId: UserId;
  productId: StripeProductId;
  amount: number;
}
