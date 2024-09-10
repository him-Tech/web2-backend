import { Pool } from "pg";

export class Migration {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async migrate(): Promise<void> {
    await this.createUser();
    await this.createSession();
    await this.createThirdPartyUser();

    await this.createOwner();
    await this.createRepository();
    await this.createIssue();

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

  async createUser(): Promise<void> {
    await this.pool.query(
      `
                CREATE TABLE IF NOT EXISTS "users" (
                "id" SERIAL PRIMARY KEY NOT NULL,
                "name" character varying,
                "email" character varying NOT NULL,
                "hashed_password" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `,
    );
  }

  async createSession(): Promise<void> {
    await this.pool.query(
      ` 
              CREATE TABLE IF NOT EXISTS "user_session" (
                "sid" character varying NOT NULL COLLATE "default",
                "sess" json NOT NULL,
                "expire" TIMESTAMP NOT NULL
              )
              WITH (OIDS=FALSE);
              ALTER TABLE "user_session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
              CREATE INDEX "IDX_session_expire" ON "user_session" ("expire");
              `,
    );
  }
  // https://www.passportjs.org/reference/normalized-profile/
  async createThirdPartyUser(): Promise<void> {
    await this.pool.query(
      `
            CREATE TABLE IF NOT EXISTS "third_party_users" (
                 "provider" VARCHAR(50) NOT NULL,
                 "id" VARCHAR(100) PRIMARY KEY,
                 "display_name" VARCHAR(255),
                 "username" VARCHAR(255),
                 "name" JSONB,
                 "emails" JSONB,
                 "photos" JSONB
            );
            `,
    );
  }

  async createOwner(): Promise<void> {
    await this.pool.query(`
            -- Owner Table
            CREATE TABLE IF NOT EXISTS github_owner (
                id SERIAL,
                github_id INTEGER PRIMARY KEY,
                github_type VARCHAR(127) NOT NULL,
                github_login VARCHAR(255) NOT NULL,
                github_html_url VARCHAR(510) NOT NULL,
                github_avatar_url VARCHAR(510) NOT NULL
            );
        `);
  }

  async createRepository(): Promise<void> {
    await this.pool.query(`
            -- Repository Table
            CREATE TABLE IF NOT EXISTS github_repository (
                id SERIAL,
                github_id INTEGER PRIMARY KEY,
                github_owner_id INTEGER NOT NULL,
                github_html_url VARCHAR(510) NOT NULL,
                github_name VARCHAR(255) NOT NULL,
                github_description VARCHAR(510) NOT NULL,
                FOREIGN KEY (github_owner_id) REFERENCES github_owner(github_id) ON DELETE RESTRICT
            );
        `);
  }

  // TODO: deal with the date format
  // -- github_created_at TIMESTAMP,
  // -- github_closed_at TIMESTAMP,
  async createIssue(): Promise<void> {
    await this.pool.query(`
            -- Issue Table
            CREATE TABLE IF NOT EXISTS github_issue (
                id SERIAL,
                github_id INTEGER PRIMARY KEY,
                github_number INTEGER NOT NULL,
                github_repository_id INTEGER NOT NULL,
                github_title VARCHAR(510) NOT NULL,
                github_body VARCHAR(1020) NOT NULL,
                github_open_by_owner_id INTEGER,
                github_html_url VARCHAR(510) NOT NULL,
                github_created_at VARCHAR(510),
                github_closed_at VARCHAR(510),
                FOREIGN KEY (github_repository_id) REFERENCES github_repository(github_id) ON DELETE RESTRICT,
                FOREIGN KEY (github_open_by_owner_id) REFERENCES github_owner(github_id) ON DELETE RESTRICT
            );
        `);
  }
}
