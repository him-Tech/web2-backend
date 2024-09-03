import {Pool} from "pg";


export class Migration {

    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool
    }

    public async migrate(): Promise<void> {
        await this.user();
        await this.session();
    }

    public async drop(): Promise<void> {
        await this.dropUser();
        await this.dropSession();
    }

    async user(): Promise<void> {
        await this.pool.query(
          `
              CREATE TABLE "users"  (
                "id" SERIAL PRIMARY KEY NOT NULL,
                "name" character varying,
                "email" character varying NOT NULL,
                "hashedPassword" character varying NOT NULL,
                "role"  character varying NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
              )
              `
        )
    }

    async session(): Promise<void> {
        await this.pool.query(
          ` 
              CREATE TABLE "user_session" (
                "sid" character varying NOT NULL COLLATE "default",
                "sess" json NOT NULL,
                "expire" TIMESTAMP NOT NULL
              )
              WITH (OIDS=FALSE);
              ALTER TABLE "user_session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
              CREATE INDEX "IDX_session_expire" ON "user_session" ("expire");
              `
        )
    }

    public async dropUser(): Promise<void> {
        await this.pool.query(`DROP TABLE "users"`)
    }

    public async dropSession(): Promise<void> {
        await this.pool.query(`DROP TABLE "user_session"`)
    }
}