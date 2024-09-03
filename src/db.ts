import {Pool, PoolClient} from "pg";

import * as dotenv from "dotenv";

dotenv.config();

export function getPool(): Pool {

  const { POSTGRES_DB_HOST, POSTGRES_DB_PORT, POSTGRES_DB_USERNAME, POSTGRES_DB_PASSWORD, POSTGRES_DB_DATABASE, NODE_ENV } =
      process.env;

  if (!POSTGRES_DB_HOST || !POSTGRES_DB_PORT || !POSTGRES_DB_USERNAME || !POSTGRES_DB_PASSWORD || !POSTGRES_DB_DATABASE) {
    throw new Error("Missing database configuration");
  }

  console.log("s", POSTGRES_DB_PASSWORD)
  return new Pool({
    user: POSTGRES_DB_USERNAME,
    password: POSTGRES_DB_PASSWORD,
    host: POSTGRES_DB_HOST,
    port: POSTGRES_DB_PORT as unknown as number, // TODO: fix this
    database: POSTGRES_DB_DATABASE,
    max: 10, // Pool max size
    idleTimeoutMillis: 1000 // Close idle clients after 1 second
  });
}

