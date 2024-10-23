import { Pool } from "pg";
import { UserId, CompanyId } from "../model";
import { getPool } from "../dbPool";

export function getUserCompanyRepository(): UserCompanyRepository {
  return new UserCompanyRepositoryImpl(getPool());
}

export interface UserCompanyRepository {
  insert(userId: UserId, companyId: CompanyId): Promise<[UserId, CompanyId]>;
  delete(userId: UserId, companyId: CompanyId): Promise<void>;
  getByUserId(userId: UserId): Promise<CompanyId[]>;
  getByCompanyId(companyId: CompanyId): Promise<UserId[]>;
}

class UserCompanyRepositoryImpl implements UserCompanyRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async insert(
    userId: UserId,
    companyId: CompanyId,
  ): Promise<[UserId, CompanyId]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                INSERT INTO user_company (user_id, company_id)
                VALUES ($1, $2)
                RETURNING user_id, company_id
                `,
        [userId.uuid, companyId.uuid],
      );

      return [
        new UserId(result.rows[0].user_id),
        new CompanyId(result.rows[0].company_id),
      ];
    } catch (error) {
      throw error; // You might want to handle specific errors here
    } finally {
      client.release();
    }
  }

  async delete(userId: UserId, companyId: CompanyId): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(
        `
                DELETE FROM user_company
                WHERE user_id = $1 AND company_id = $2
                `,
        [userId.uuid, companyId.uuid],
      );
    } catch (error) {
      throw error; // Handle errors as needed
    } finally {
      client.release();
    }
  }

  async getByUserId(userId: UserId): Promise<CompanyId[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                SELECT company_id
                FROM user_company
                WHERE user_id = $1
                `,
        [userId.uuid],
      );

      return result.rows.map((row) => new CompanyId(row.company_id));
    } catch (error) {
      throw error; // Handle errors as needed
    } finally {
      client.release();
    }
  }

  async getByCompanyId(companyId: CompanyId): Promise<UserId[]> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                SELECT user_id
                FROM user_company
                WHERE company_id = $1
                `,
        [companyId.uuid],
      );

      return result.rows.map((row) => new UserId(row.user_id));
    } catch (error) {
      throw error; // Handle errors as needed
    } finally {
      client.release();
    }
  }
}
