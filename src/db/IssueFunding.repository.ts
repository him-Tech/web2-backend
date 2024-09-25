import { Pool } from "pg";
import { IssueFunding, IssueFundingId } from "../model";
import { getPool } from "../dbPool";
import { CreateIssueFundingDto } from "../dtos";

export function getIssueFundingRepository(): IssueFundingRepository {
  return new IssueFundingRepositoryImpl(getPool());
}

export interface IssueFundingRepository {
  create(issueFunding: CreateIssueFundingDto): Promise<IssueFunding>;
  getById(id: IssueFundingId): Promise<IssueFunding | null>;
  getAll(): Promise<IssueFunding[]>;
}

class IssueFundingRepositoryImpl implements IssueFundingRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneIssueFunding(rows: any[]): IssueFunding {
    const issueFunding = this.getOptionalIssueFunding(rows);
    if (issueFunding === null) {
      throw new Error("IssueFunding not found");
    } else {
      return issueFunding;
    }
  }

  private getOptionalIssueFunding(rows: any[]): IssueFunding | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple issue fundings found");
    } else {
      const issueFunding = IssueFunding.fromBackend(rows[0]);
      if (issueFunding instanceof Error) {
        throw issueFunding;
      }
      return issueFunding;
    }
  }

  private getIssueFundingList(rows: any[]): IssueFunding[] {
    return rows.map((r) => {
      const issueFunding = IssueFunding.fromBackend(r);
      if (issueFunding instanceof Error) {
        throw issueFunding;
      }
      return issueFunding;
    });
  }

  async create(issueFunding: CreateIssueFundingDto): Promise<IssueFunding> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
        INSERT INTO issue_funding (github_issue_id, user_id, product_id, amount)
        VALUES ($1, $2, $3, $4)
        RETURNING id, github_issue_id, user_id, product_id, amount
        `,
        [
          issueFunding.githubIssueId.toString(),
          issueFunding.userId.toString(),
          issueFunding.productId.toString(),
          issueFunding.amount,
        ],
      );

      return this.getOneIssueFunding(result.rows);
    } finally {
      client.release();
    }
  }

  async getById(id: IssueFundingId): Promise<IssueFunding | null> {
    const result = await this.pool.query(
      `
      SELECT *
      FROM issue_funding
      WHERE id = $1
      `,
      [id.toString()],
    );

    return this.getOptionalIssueFunding(result.rows);
  }

  async getAll(): Promise<IssueFunding[]> {
    const result = await this.pool.query(`
      SELECT *
      FROM issue_funding
    `);

    return this.getIssueFundingList(result.rows);
  }
}
