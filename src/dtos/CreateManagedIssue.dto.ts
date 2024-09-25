import {
  ContributorVisibility,
  GithubIssueId,
  ManagedIssueState,
  StripeProductId,
  UserId,
} from "../model/";

export interface CreateManagedIssueDto {
  githubIssueId: GithubIssueId;
  productId: StripeProductId;
  requestedAmount: number;
  managerId: UserId;
  contributorVisibility: ContributorVisibility;
  state: ManagedIssueState;
}
