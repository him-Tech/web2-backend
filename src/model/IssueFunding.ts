import { ValidationError, Validator } from "./utils";
import { GithubIssueId, IssueId } from "./github";
import { UserId } from "./user";
import { StripeProductId } from "./stripe";

export class IssueFundingId {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
  toString(): string {
    return this.id.toString();
  }
}

export class IssueFunding {
  id: IssueFundingId;
  githubIssueId: GithubIssueId;
  userId: UserId;
  productId: StripeProductId;
  amount: number;

  constructor(
    id: IssueFundingId,
    githubIssueId: GithubIssueId,
    userId: UserId,
    productId: StripeProductId,
    amount: number,
  ) {
    this.id = id;
    this.githubIssueId = githubIssueId;
    this.userId = userId;
    this.productId = productId;
    this.amount = amount;
  }

  static fromBackend(row: any): IssueFunding | ValidationError {
    const validator = new Validator(row);
    const id = validator.requiredNumber("id");
    const githubIssueId = validator.requiredNumber("github_issue_id");
    const userId = validator.requiredNumber("user_id");
    const productId = validator.requiredString("product_id");
    const amount = validator.requiredNumber("amount");

    const error = validator.getFirstError();
    if (error) {
      return error;
    }

    return new IssueFunding(
      new IssueFundingId(id),
      new GithubIssueId(githubIssueId),
      new UserId(userId),
      new StripeProductId(productId),
      amount,
    );
  }
}
