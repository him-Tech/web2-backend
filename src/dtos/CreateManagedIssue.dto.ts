import {
  ContributorVisibility,
  GithubIssueId,
  ManagedIssueState,
  StripeProductId,
  UserId,
} from "../model/";

export interface CreateManagedIssueDto {
  githubIssueId: GithubIssueId;
  requestedDowAmount: number;
  managerId: UserId;
  contributorVisibility: ContributorVisibility;
  state: ManagedIssueState;
}
