import { ValidationError, Validator } from "./utils";
import { GithubIssueId, StripeProductId, UserId, UserRole } from "./index";

export enum ContributorVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum ManagedIssueState {
  OPEN = "open",
  REJECTED = "rejected",
  SOLVED = "solved",
}

export class ManagedIssueId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export class ManagedIssue {
  id: ManagedIssueId;
  githubIssueId: GithubIssueId;
  productId: StripeProductId;
  requestedAmount: number;
  managerId: UserId;
  contributorVisibility: ContributorVisibility;
  state: ManagedIssueState;

  constructor(
    id: ManagedIssueId,
    githubIssueId: GithubIssueId,
    productId: StripeProductId,
    requestedAmount: number,
    managerId: UserId,
    contributorVisibility: ContributorVisibility,
    state: ManagedIssueState,
  ) {
    this.id = id;
    this.githubIssueId = githubIssueId;
    this.productId = productId;
    this.requestedAmount = requestedAmount;
    this.managerId = managerId;
    this.contributorVisibility = contributorVisibility;
    this.state = state;
  }

  static fromBackend(row: any): ManagedIssue | ValidationError {
    const validator = new Validator(row);
    const id = validator.requiredNumber("id");
    const issueId = validator.requiredNumber("github_issue_id");
    const productId = validator.requiredString("product_id");
    const requestedAmount = validator.requiredNumber("requested_amount");
    const managerId = validator.requiredNumber("manager_id");
    const contributorVisibility = validator.requiredEnum(
      "contributor_visibility",
      Object.values(ContributorVisibility) as ContributorVisibility[],
    );
    const state = validator.requiredEnum(
      "state",
      Object.values(ManagedIssueState) as ManagedIssueState[],
    );

    const error = validator.getFirstError();
    if (error) {
      return error;
    }

    return new ManagedIssue(
      new ManagedIssueId(id),
      new GithubIssueId(issueId),
      new StripeProductId(productId),
      requestedAmount,
      new UserId(managerId),
      contributorVisibility,
      state,
    );
  }
}
