import { Pool } from "pg";
import fs from "fs";

export class Migration {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async migrate(): Promise<void> {
    const sql = fs.readFileSync("src/db/migration.sql").toString();

    await this.pool.query(sql);
    await this.pool.query(`SET timezone = 'UTC';`);
  }

  public async drop(): Promise<void> {
    await this.pool.query(`DROP TABLE IF EXISTS "users"`);
    await this.pool.query(`DROP TABLE IF EXISTS "user_session"`);
    await this.pool.query(`DROP TABLE IF EXISTS "third_party_users"`);

    await this.pool.query(`TRUNCATE TABLE github_issue CASCADE`);
    await this.pool.query(`TRUNCATE TABLE github_repository CASCADE`);
    await this.pool.query(`TRUNCATE TABLE github_owner CASCADE`);

    await this.pool.query(`DROP TABLE IF EXISTS "github_issue" CASCADE`);
    await this.pool.query(`DROP TABLE IF EXISTS "github_repository" CASCADE`);
    await this.pool.query(`DROP TABLE IF EXISTS "github_owner" CASCADE`);
  }
}
