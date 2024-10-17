import * as dotenv from "dotenv";
import Joi from "joi";
import { NodeEnv } from "./NodeEnv";

dotenv.config();

const envVarsSchema = Joi.object({
  ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .required(),
  PORT: Joi.number().default(3000),

  // JWT_SECRET: Joi.string().required().description('JWT secret key'),
  // JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
  //     .default(30)
  //     .description('minutes after which access tokens expire'),
  // JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
  //     .default(30)
  //     .description('days after which refresh tokens expire'),
  //
  // COOKIE_EXPIRATION_HOURS: Joi.number()
  //     .default(24)
  //     .description('hours after which httpOnly cookie expire'),

  POSTGRES_USER: Joi.string().description("postgres name"),
  POSTGRES_HOST: Joi.string().description("postgres host"),
  POSTGRES_PORT: Joi.number().description("postgres database port"),
  POSTGRES_DATABASE: Joi.string().description("postgres database"),
  POSTGRES_PASSWORD: Joi.string().description("postgres password"),
  POSTGRES_POOL_MAX_SIZE: Joi.number().description(
    "postgres database pool max size",
  ),
  POSTGRES_POOL_MIN_SIZE: Joi.number().description(
    "postgres database pool min size",
  ),
  POSTGRES_POOL_IDLE_TIMEOUT_MILLIS: Joi.number().description(
    "postgres: close idle clients after x millis",
  ),

  GITHUB_CLIENT_ID: Joi.string().description("github client id"),
  GITHUB_CLIENT_SECRET: Joi.string().description("github client secret"),
  GITHUB_REQUEST_TOKEN: Joi.string().description("github request token"),

  STRIPE_SECRET_KEY: Joi.string().description("stripe secret key"),
  STRIPE_WEBHOOK_SECRET: Joi.string().description("stripe webhook secret"),

  // SQL_MAX_POOL: Joi.number()
  //     .default(10)
  //     .min(5)
  //     .description('sqldb max pool connection'),
  // SQL_MIN_POOL: Joi.number()
  //     .default(0)
  //     .min(0)
  //     .description('sqldb min pool connection'),
  // SQL_IDLE: Joi.number()
  //     .default(10000)
  //     .description('sqldb max pool idle time in milliseconds'),

  // SMTP_HOST: Joi.string().description('server that will send the emails'),
  // SMTP_PORT: Joi.number().description(
  //     'port to connect to the email server'
  // ),
  // SMTP_USERNAME: Joi.string().description('username for email server'),
  // SMTP_PASSWORD: Joi.string().description('password for email server'),
  // EMAIL_FROM: Joi.string().description(
  //     'the from field in the emails sent by the app'
  // ),
}).unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

interface Postgres {
  user: string;
  host: string;
  port: number;
  database: string;
  password: string;
  pool: {
    maxSize: number;
    minSize: number;
    idleTimeoutMillis: number; // Close idle clients after...
  };
}

interface Github {
  clientId: string;
  clientSecret: string;
  requestToken: string;
}

interface Stripe {
  secretKey: string;
  webhookSecret: string;
}

interface Config {
  env: NodeEnv; // Use enum type here
  port: number;
  // pagination: {
  //     limit: number;
  //     page: number;
  // };
  // jwt: {
  //     secret: string;
  //     accessExpirationMinutes: number;
  //     refreshExpirationDays: number;
  //     resetPasswordExpirationMinutes: number;
  // };
  // cookie: {
  //     cookieExpirationHours: number;
  // };
  postgres: Postgres;
  github: Github;
  stripe: Stripe;
  // email: {
  //     smtp: {
  //         host: string;
  //         port: number;
  //         auth: {
  //             user: string;
  //             pass: string;
  //         };
  //     };
  //     from: string;
  // };
}

export const config: Config = {
  env: envVars.ENV as NodeEnv,
  port: envVars.PORT,
  // pagination: {
  //     limit: 10,
  //     page: 1,
  // },
  // jwt: {
  //     secret: envVars.JWT_SECRET,
  //     accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
  //     refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  //     resetPasswordExpirationMinutes: 10,
  // },
  // cookie: {
  //     cookieExpirationHours: envVars.COOKIE_EXPIRATION_HOURS,
  // },
  postgres: {
    user: envVars.POSTGRES_USER,
    host: envVars.POSTGRES_HOST,
    port: envVars.POSTGRES_PORT,
    database: envVars.POSTGRES_DATABASE,
    password: envVars.POSTGRES_PASSWORD,
    pool: {
      maxSize: envVars.POSTGRES_POOL_MAX_SIZE,
      minSize: envVars.POSTGRES_POOL_MIN_SIZE,
      idleTimeoutMillis: envVars.POSTGRES_POOL_IDLE_TIMEOUT_MILLIS,
    },
  } as Postgres,

  github: {
    clientId: envVars.GITHUB_CLIENT_ID,
    clientSecret: envVars.GITHUB_CLIENT_SECRET,
    requestToken: envVars.GITHUB_REQUEST_TOKEN,
  } as Github,

  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  } as Stripe,

  // email: {
  //     smtp: {
  //         host: envVars.SMTP_HOST,
  //         port: envVars.SMTP_PORT,
  //         auth: {
  //             user: envVars.SMTP_USERNAME,
  //             pass: envVars.SMTP_PASSWORD,
  //         },
  //     },
  //     from: envVars.EMAIL_FROM,
  // },
};
