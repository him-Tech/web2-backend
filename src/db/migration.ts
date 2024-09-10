import { Pool } from "pg";

export class Migration {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async migrate(): Promise<void> {
    await this.user();
    await this.session();
    await this.thirdPartyUser();
  }

  public async drop(): Promise<void> {
    await this.dropUser();
    await this.dropSession();
    await this.dropThirdPartyUser();
  }

  async user(): Promise<void> {
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

  async session(): Promise<void> {
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
  async thirdPartyUser(): Promise<void> {
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

  public async dropUser(): Promise<void> {
    await this.pool.query(`DROP TABLE IF EXISTS "users"`);
  }

  public async dropSession(): Promise<void> {
    await this.pool.query(`DROP TABLE IF EXISTS "user_session"`);
  }

  public async dropThirdPartyUser(): Promise<void> {
    await this.pool.query(`DROP TABLE IF EXISTS "third_party_users"`);
  }
}
