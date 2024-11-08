import { Pool } from "pg";
import {
  DowCurrency,
  RepositoryId,
  RepositoryUserPermissionToken,
  RepositoryUserPermissionTokenId,
  RepositoryUserRole,
} from "../model";
import { getPool } from "../dbPool";
import { logger } from "../config";
import Decimal from "decimal.js";

export function getRepositoryUserPermissionTokenRepository(): RepositoryUserPermissionTokenRepository {
  return new RepositoryUserPermissionTokenRepositoryImpl(getPool());
}
export interface CreateRepositoryUserPermissionTokenBody {
  userName: string | null;
  userEmail: string;
  userGithubOwnerLogin: string;
  token: string;
  repositoryId: RepositoryId;
  repositoryUserRole: RepositoryUserRole;
  dowRate: Decimal;
  dowCurrency: DowCurrency;
  expiresAt: Date;
}

export interface RepositoryUserPermissionTokenRepository {
  create(
    token: CreateRepositoryUserPermissionTokenBody,
  ): Promise<RepositoryUserPermissionToken>;

  update(
    token: RepositoryUserPermissionToken,
  ): Promise<RepositoryUserPermissionToken>;

  getById(
    id: RepositoryUserPermissionTokenId,
  ): Promise<RepositoryUserPermissionToken | null>;

  getByRepositoryId(
    repositoryId: RepositoryId,
  ): Promise<RepositoryUserPermissionToken[]>;

  getByToken(token: string): Promise<RepositoryUserPermissionToken | null>;

  getAll(): Promise<RepositoryUserPermissionToken[]>;

  delete(token: string): Promise<void>;
}

class RepositoryUserPermissionTokenRepositoryImpl
  implements RepositoryUserPermissionTokenRepository
{
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(
    token: CreateRepositoryUserPermissionTokenBody,
  ): Promise<RepositoryUserPermissionToken> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
                    INSERT INTO repository_user_permission_token (
                                                                  user_name,
                                                                  user_email,
                                                                  user_github_owner_login, 
                                                                  token,
                                                                  github_owner_id,
                                                                  github_owner_login,
                                                                  github_repository_id,
                                                                  github_repository_name,
                                                                  repository_user_role, 
                                                                  dow_rate, 
                                                                  dow_currency, 
                                                                  expires_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING *
                `,
        [
          token.userName,
          token.userEmail,
          token.userGithubOwnerLogin,
          token.token,
          token.repositoryId.ownerId.githubId,
          token.repositoryId.ownerId.login,
          token.repositoryId.githubId,
          token.repositoryId.name,
          token.repositoryUserRole,
          token.dowRate.toString(),
          token.dowCurrency.toString(),
          token.expiresAt,
        ],
      );

      return RepositoryUserPermissionToken.fromBackend(
        result.rows[0],
      ) as RepositoryUserPermissionToken;
    } finally {
      client.release();
    }
  }

  async update(
    token: RepositoryUserPermissionToken,
  ): Promise<RepositoryUserPermissionToken> {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
                    UPDATE repository_user_permission_token
                    SET user_name = $1,
                        user_github_owner_login = $2,
                        token = $3,
                        github_owner_id = $4,
                        github_owner_login = $5,
                        github_repository_id = $6,
                        github_repository_name = $7,
                        repository_user_role = $8,
                        dow_rate = $9,
                        dow_currency = $10,
                        expires_at = $11,
                        updated_at = now()
                    WHERE id = $12
                    RETURNING *
                `,
        [
          token.userName,
          token.userGithubOwnerLogin,
          token.token,
          token.repositoryId.ownerId.githubId,
          token.repositoryId.ownerId.login,
          token.repositoryId.githubId,
          token.repositoryId.name,
          token.repositoryUserRole,
          token.dowRate.toString(),
          token.dowCurrency.toString(),
          token.expiresAt,
          token.id.toString(),
        ],
      );

      return RepositoryUserPermissionToken.fromBackend(
        result.rows[0],
      ) as RepositoryUserPermissionToken;
    } finally {
      client.release();
    }
  }

  async getById(
    id: RepositoryUserPermissionTokenId,
  ): Promise<RepositoryUserPermissionToken | null> {
    const result = await this.pool.query(
      `
                SELECT *
                FROM repository_user_permission_token
                WHERE id = $1
            `,
      [id.toString()],
    );

    return result.rows.length > 0
      ? (RepositoryUserPermissionToken.fromBackend(
          result.rows[0],
        ) as RepositoryUserPermissionToken)
      : null;
  }

  async getByRepositoryId(
    repositoryId: RepositoryId,
  ): Promise<RepositoryUserPermissionToken[]> {
    const result = await this.pool.query(
      `
                SELECT *
                FROM repository_user_permission_token
                WHERE github_owner_login = $1
                  AND github_repository_name = $2
            `,
      [repositoryId.ownerLogin(), repositoryId.name],
    );

    return result.rows.map(
      (row) =>
        RepositoryUserPermissionToken.fromBackend(
          row,
        ) as RepositoryUserPermissionToken,
    );
  }

  async getByToken(
    token: string,
  ): Promise<RepositoryUserPermissionToken | null> {
    const result = await this.pool.query(
      `
                SELECT *
                FROM repository_user_permission_token
                WHERE token = $1
            `,
      [token],
    );

    return result.rows.length > 0
      ? (RepositoryUserPermissionToken.fromBackend(
          result.rows[0],
        ) as RepositoryUserPermissionToken)
      : null;
  }

  async getAll(): Promise<RepositoryUserPermissionToken[]> {
    const result = await this.pool.query(
      `
                SELECT *
                FROM repository_user_permission_token
            `,
    );

    return result.rows.map(
      (row) =>
        RepositoryUserPermissionToken.fromBackend(
          row,
        ) as RepositoryUserPermissionToken,
    );
  }

  async delete(token: string): Promise<void> {
    logger.debug("Deleting permission token: ", token);
    await this.pool.query(
      `
                DELETE FROM repository_user_permission_token
                WHERE token = $1
            `,
      [token],
    );
  }
}
