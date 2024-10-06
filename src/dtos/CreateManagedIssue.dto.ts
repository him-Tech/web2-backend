import {
  ContributorVisibility,
  IssueId,
  ManagedIssueState,
  UserId,
} from "../model/";

export interface CreateManagedIssueDto {
  githubIssueId: IssueId;
  requestedDowAmount: number;
  managerId: UserId;
  contributorVisibility: ContributorVisibility;
  state: ManagedIssueState;
}
