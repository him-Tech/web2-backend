import { Pool } from "pg";
import {
  FinancialIssue,
  Issue,
  IssueFunding,
  IssueId,
  ManagedIssue,
  Owner,
  Repository,
} from "../model";
import { getPool } from "../dbPool";
import {
  getIssueRepository,
  getOwnerRepository,
  getRepositoryRepository,
} from "./github";
import { getManagedIssueRepository } from "./ManagedIssue.repository";
import { getIssueFundingRepository } from "./IssueFunding.repository";
import { getGitHubAPI, GitHubApi } from "../services/github.service";
import { logger } from "../config";

export function getFinancialIssueRepository(
  gitHubApi: GitHubApi = getGitHubAPI(),
): FinancialIssueRepository {
  return new FinancialIssueRepositoryImpl(getPool(), gitHubApi);
}

// TODO: optimize this implementation
export interface FinancialIssueRepository {
  get(issueId: IssueId): Promise<FinancialIssue | null>;

  getAll(): Promise<FinancialIssue[]>;
}

class FinancialIssueRepositoryImpl implements FinancialIssueRepository {
  pool: Pool;
  githubService: GitHubApi;

  ownerRepo = getOwnerRepository();
  repoRepo = getRepositoryRepository();
  issueRepo = getIssueRepository();
  managedIssueRepo = getManagedIssueRepository();
  issueFundingRepo = getIssueFundingRepository();

  constructor(pool: Pool, githubService = getGitHubAPI()) {
    this.pool = pool;
    this.githubService = githubService;
  }

  async get(issueId: IssueId): Promise<FinancialIssue> {
    const githubRepoPromise: Promise<[Owner, Repository]> =
      this.githubService.getOwnerAndRepository(issueId.repositoryId);
    const githubIssuePromise: Promise<[Issue, Owner]> =
      this.githubService.getIssue(issueId);

    Promise.all([githubRepoPromise, githubIssuePromise])
      .then(([repoResult, issueResult]) => {
        const [owner, repo] = repoResult;
        const [issue, issueCreatedBy] = issueResult; // Renamed createdBy to issueCreatedBy for clarity

        this.ownerRepo
          .insertOrUpdate(owner as Owner)
          .then(() => {
            this.repoRepo.insertOrUpdate(repo as Repository);
          })
          .then(() => {
            // Then insert the issue and its creator
            return Promise.all([
              this.issueRepo.createOrUpdate(issue as Issue),
              this.ownerRepo.insertOrUpdate(issueCreatedBy as Owner),
            ]);
          });
      })
      .catch((error) => {
        logger.error("Error fetching GitHub data:", error);
      });

    const owner: Promise<Owner> = this.ownerRepo
      .getById(issueId.repositoryId.ownerId)
      .then(async (owner) => {
        if (!owner) {
          const [owner, _] = await githubRepoPromise;
          return owner;
        }
        return owner;
      });
    const repo: Promise<Repository> = this.repoRepo
      .getById(issueId.repositoryId)
      .then(async (repo) => {
        if (!repo) {
          const [_, repo] = await githubRepoPromise;
          return repo;
        }
        return repo;
      });

    const issue: Promise<Issue> = this.issueRepo
      .getById(issueId)
      .then(async (issue) => {
        if (!issue) {
          const [issue, _] = await githubIssuePromise;
          return issue;
        }
        return issue;
      });

    let managedIssue = this.managedIssueRepo.getByIssueId(issueId);
    let issueFundings = this.issueFundingRepo.getAll(issueId);

    return new FinancialIssue(
      await owner,
      await repo,
      await issue,
      (await managedIssue) ?? undefined,
      await issueFundings,
    );
  }

  async getAll(): Promise<FinancialIssue[]> {
    const allManagedIssues = await this.managedIssueRepo.getAll();
    let managedIssues: Map<number | undefined, ManagedIssue> = new Map(
      allManagedIssues.map((m) => {
        if (!m.githubIssueId || !m.githubIssueId.githubId) {
          logger.error(
            `ManagedIssue of github issue id: ${m.githubIssueId}, does not have a githubId field defined in the DB`,
          );
        }
        return [m.githubIssueId?.githubId, m];
      }),
    );

    let issueFundings: Map<number, IssueFunding[]> = new Map();
    const allIssueFundings = await this.issueFundingRepo.getAll();
    allIssueFundings.forEach((i) => {
      const githubId = i.githubIssueId?.githubId;
      if (!githubId) {
        logger.error(
          `IssueFunding of github issue id: ${i.githubIssueId}, does not have a githubId field defined in the DB`,
        );
        return; // Skip if githubId is undefined
      }

      // Initialize an empty array if the key doesn't exist
      if (!issueFundings.has(githubId)) {
        issueFundings.set(githubId, []);
      }

      // Add the IssueFunding to the corresponding array
      issueFundings.get(githubId)?.push(i);
    });

    const issueIds: Map<number | undefined, IssueId> = new Map();

    allManagedIssues.forEach((m) => {
      const githubId = m.githubIssueId?.githubId;
      if (githubId !== undefined) {
        // Add to the map if the key doesn't already exist
        if (!issueIds.has(githubId)) {
          issueIds.set(githubId, m.githubIssueId);
        }
      }
    });

    allIssueFundings.forEach((i) => {
      const githubId = i.githubIssueId?.githubId;
      if (githubId !== undefined) {
        // Add to the map if the key doesn't already exist
        if (!issueIds.has(githubId)) {
          issueIds.set(githubId, i.githubIssueId);
        }
      }
    });

    const financialIssues: FinancialIssue[] = [];
    for (const [githubId, issueId] of issueIds) {
      if (!githubId) {
        logger.error(
          `Issue with github id: ${issueId}, does not have an id field defined in the DB`,
        );
        continue; // Skip if githubId is undefined
      }

      const managedIssue = managedIssues.get(githubId);
      const fundings = issueFundings.get(githubId) ?? [];

      const owner = await this.ownerRepo.getById(issueId.repositoryId.ownerId);
      const repo = await this.repoRepo.getById(issueId.repositoryId);
      const issue = await this.issueRepo.getById(issueId);

      if (!owner || !repo || !issue) {
        logger.error(
          `Financial issue with github id: ${githubId}, does not have a valid owner, repo, or issue in the DB`,
        );
        continue; // Use continue to skip to the next iteration
      }

      financialIssues.push(
        new FinancialIssue(owner, repo, issue, managedIssue, fundings),
      );
    }
    return financialIssues;
  }
}
