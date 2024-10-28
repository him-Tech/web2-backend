import * as model from "./index";

export class FinancialIssue {
  public owner: model.Owner;
  public repository: model.Repository;
  public issue: model.Issue;
  public issueManager: model.User | null;
  public managedIssue: model.ManagedIssue | null;
  public issueFundings: model.IssueFunding[];

  constructor(
    owner: model.Owner,
    repository: model.Repository,
    issue: model.Issue,
    issueManager: model.User | null,
    managedIssue: model.ManagedIssue | null,
    issueFundings: model.IssueFunding[],
  ) {
    this.owner = owner;
    this.repository = repository;
    this.issue = issue;
    this.issueManager = issueManager;
    this.managedIssue = managedIssue;
    this.issueFundings = issueFundings;
  }

  public amountCollected(): number {
    // @ts-ignore
    return (
      this.issueFundings?.reduce(
        (acc, funding) => acc + funding.dowAmount,
        0,
      ) ?? 0
    );
  }

  public amountRequested(): number | undefined {
    return this.managedIssue?.requestedDowAmount;
  }

  public successfullyFunded(): boolean {
    return this.amountCollected() >= (this.amountRequested() ?? 0);
  }

  public isClosed(): boolean {
    return (
      this.managedIssue?.state === model.ManagedIssueState.REJECTED ||
      this.managedIssue?.state === model.ManagedIssueState.SOLVED
    );
  }

  public id(): string {
    return `${this.owner.id}/${this.repository.id}/${this.issue.id.number}`;
  }
}
