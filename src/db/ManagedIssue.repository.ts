import { Pool } from "pg";
import { ManagedIssue, ManagedIssueId } from "../model";
import { getPool } from "../dbPool";
import { CreateManagedIssueDto } from "../dtos";

export function getManagedIssueRepository(): ManagedIssueRepository {
  return new ManagedIssueRepositoryImpl(getPool());
}

export interface ManagedIssueRepository {
  create(managedIssue: CreateManagedIssueDto): Promise<ManagedIssue>;
  update(managedIssue: ManagedIssue): Promise<ManagedIssue>;
  getById(id: ManagedIssueId): Promise<ManagedIssue | null>;
  getAll(): Promise<ManagedIssue[]>;
}

class ManagedIssueRepositoryImpl implements ManagedIssueRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneManagedIssue(rows: any[]): ManagedIssue {
    const managedIssue = this.getOptionalManagedIssue(rows);
    if (managedIssue === null) {
      throw new Error("ManagedIssue not found");
    } else {
      return managedIssue;
    }
  }

  private getOptionalManagedIssue(rows: any[]): ManagedIssue | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple managed issues found");
    } else {
      const managedIssue = ManagedIssue.fromBackend(rows[0]);
      if (managedIssue instanceof Error) {
        throw managedIssue;
      }
      return managedIssue;
    }
  }

  private getManagedIssueList(rows: any[]): ManagedIssue[] {
    return rows.map((r) => {
      const managedIssue = ManagedIssue.fromBackend(r);
      if (managedIssue instanceof Error) {
        throw managedIssue;
      }
      return managedIssue;
    });
  }

  async create(managedIssue: CreateManagedIssueDto): Promise<ManagedIssue> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
        INSERT INTO managed_issue (github_issue_id, requested_dow_amount, manager_id, contributor_visibility, state)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, github_issue_id, requested_dow_amount, manager_id, contributor_visibility, state
        `,
        [
          managedIssue.githubIssueId.toString(),
          managedIssue.requestedDowAmount,
          managedIssue.managerId.toString(),
          managedIssue.contributorVisibility,
          managedIssue.state,
        ],
      );

      return this.getOneManagedIssue(result.rows);
    } finally {
      client.release();
    }
  }

  async update(managedIssue: ManagedIssue): Promise<ManagedIssue> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
        UPDATE managed_issue
        SET 
            github_issue_id = $1,
            requested_dow_amount = $2,
            manager_id = $3,
            contributor_visibility = $4,
            state = $5
        WHERE id = $6
        RETURNING id, github_issue_id, requested_dow_amount, manager_id, contributor_visibility, state
        `,
        [
          managedIssue.githubIssueId.toString(),
          managedIssue.requestedDowAmount,
          managedIssue.managerId.toString(),
          managedIssue.contributorVisibility,
          managedIssue.state,
          managedIssue.id.id,
        ],
      );

      return this.getOneManagedIssue(result.rows);
    } finally {
      client.release();
    }
  }

  async getById(id: ManagedIssueId): Promise<ManagedIssue | null> {
    const result = await this.pool.query(
      `
      SELECT *
      FROM managed_issue
      WHERE id = $1
      `,
      [id.id],
    );

    return this.getOptionalManagedIssue(result.rows);
  }

  async getAll(): Promise<ManagedIssue[]> {
    const result = await this.pool.query(`
      SELECT *
      FROM managed_issue
    `);

    return this.getManagedIssueList(result.rows);
  }
}
