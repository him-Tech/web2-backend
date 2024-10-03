import { Pool } from "pg";
import { FinancialIssue, IssueId, StripeProduct } from "../model";
import { getPool } from "../dbPool";
import { getUserRepository } from "./User.repository";
import {
  getIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
} from "./github";
import { getStripeProductRepository } from "./stripe";
import { getManagedIssueRepository } from "./ManagedIssue.repository";

export function getFinancialIssueRepository(): FinancialIssueRepository {
  return new FinancialIssueRepositoryImpl(getPool());
}

export interface FinancialIssueRepository {
  get(issueId: IssueId): Promise<FinancialIssue | null>;
}

class FinancialIssueRepositoryImpl implements FinancialIssueRepository {
  pool: Pool;
  userRepo = getUserRepository();
  ownerRepo = getOwnerRepository();
  repoRepo = getRepositoryRepository();
  issueRepo = getIssueRepository();
  productRepo = getStripeProductRepository();
  managedIssueRepo = getManagedIssueRepository();

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async get(issueId: IssueId): Promise<FinancialIssue> {
    // TODO: need to optimize this
    const owner = this.ownerRepo.getById(issueId.repositoryId.ownerId);
    const repo = this.repoRepo.getById(issueId.repositoryId);
    const issue = await this.issueRepo.getById(issueId);

    let product: Promise<StripeProduct | null>;
    if (issue?.id.githubId) {
    }

    let openBy = this.ownerRepo.getById(issue?.open);
    let managedIssue = this.managedIssueRepo.getById(issue?.id);
    let issueFundings = this.issueRepo.getAll(issue?.id);
    // product = this.productRepo.getById(issue?.id.githubId);
  }
}
