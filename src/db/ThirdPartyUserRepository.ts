import { Pool } from "pg";
import { ThirdPartyUser, ThirdPartyUserId, Provider } from "../model";
import { getPool } from "../db";

export function getThirdPartyUserRepository(): ThirdPartyUserRepository {
  return new ThirdPartyUserRepositoryImpl(getPool()); // Use the shared pool instance
}

export interface ThirdPartyUserRepository {
  insert(thirdPartyUser: ThirdPartyUser): Promise<ThirdPartyUser>;
  getById(
    id: ThirdPartyUserId,
    provider: Provider,
  ): Promise<ThirdPartyUser | null>;
  getAll(): Promise<ThirdPartyUser[]>;
}

class ThirdPartyUserRepositoryImpl implements ThirdPartyUserRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneThirdPartyUser(rows: any[]): ThirdPartyUser {
    const thirdPartyUser = this.getOptionalThirdPartyUser(rows);
    if (thirdPartyUser === null) {
      throw new Error("ThirdPartyUser not found");
    } else {
      return thirdPartyUser;
    }
  }

  private getOptionalThirdPartyUser(rows: any[]): ThirdPartyUser | null {
    if (rows.length === 0) {
      return null;
    } else if (rows.length > 1) {
      throw new Error("Multiple ThirdPartyUsers found");
    } else {
      const thirdPartyUser = ThirdPartyUser.fromRaw(rows[0]);
      if (thirdPartyUser instanceof Error) {
        throw thirdPartyUser;
      }
      return thirdPartyUser;
    }
  }

  private getThirdPartyUserList(rows: any[]): ThirdPartyUser[] {
    return rows.map((r) => {
      const thirdPartyUser = ThirdPartyUser.fromRaw(r);
      if (thirdPartyUser instanceof Error) {
        throw thirdPartyUser;
      }
      return thirdPartyUser;
    });
  }

  async getAll(): Promise<ThirdPartyUser[]> {
    const result = await this.pool.query(`
      SELECT provider, id, display_name, username, name, emails, photos FROM third_party_users
    `);

    return this.getThirdPartyUserList(result.rows);
  }

  async getById(
    id: ThirdPartyUserId,
    provider: Provider,
  ): Promise<ThirdPartyUser | null> {
    const result = await this.pool.query(
      `
      SELECT provider, id, display_name, username, name, emails, photos FROM third_party_users WHERE id = $1 AND provider = $2
      `,
      [id.id, provider],
    );

    return this.getOptionalThirdPartyUser(result.rows);
  }

  async insert(thirdPartyUser: ThirdPartyUser): Promise<ThirdPartyUser> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
        INSERT INTO third_party_users (provider, id, display_name, username, name, emails, photos)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING provider, id, display_name, username, name, emails, photos
        `,
        [
          thirdPartyUser.provider,
          thirdPartyUser.id.id,
          thirdPartyUser.displayName,
          thirdPartyUser.username,
          JSON.stringify(thirdPartyUser.name),
          JSON.stringify(thirdPartyUser.emails),
          JSON.stringify(thirdPartyUser.photos),
        ],
      );

      return this.getOneThirdPartyUser(result.rows);
    } finally {
      client.release(); // Always release the client
    }
  }
}
