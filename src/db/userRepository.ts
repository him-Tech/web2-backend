import { Pool } from "pg";
import { User, UserId } from "../model";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { getPool } from "../db";
import { encrypt } from "../strategies/helpers";

export function getUserRepository(): UserRepository {
  return new UserRepositoryImpl(getPool()); // Use the shared pool instance
}

export interface UserRepository {
  insert(user: CreateUserDto): Promise<User>;
  getById(id: UserId): Promise<User>;
  getAll(): Promise<User[]>;
  findOne(email: string): Promise<User | null>;
}

class UserRepositoryImpl implements UserRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private getOneUser(rows: any[]): User {
    if (rows.length === 0) {
      throw new Error("User not found");
    } else if (rows.length > 1) {
      throw new Error("Multiple users found");
    } else {
      const user = User.fromRaw(rows[0]);
      if (user instanceof Error) {
        throw user;
      }
      return user;
    }
  }

  private getUserList(rows: any[]): User[] {
    return rows.map((r) => {
      const user = User.fromRaw(r);
      if (user instanceof Error) {
        throw user;
      }
      return user;
    });
  }

  async getAll(): Promise<User[]> {
    const result = await this.pool.query(`
            SELECT id, name, email, hashed_password, role FROM users
        `);

    return this.getUserList(result.rows);
  }

  async getById(id: UserId): Promise<User> {
    const result = await this.pool.query(
      `
            SELECT id, name, email, hashed_password, role FROM users WHERE id = $1
        `,
      [id.id],
    );

    return this.getOneUser(result.rows);
  }

  async insert(user: CreateUserDto): Promise<User> {
    const client = await this.pool.connect();

    const hashedPassword = await encrypt.hashPassword(user.password);

    try {
      const result = await client.query(
        `
                INSERT INTO users (name, email, hashed_password, role)
                VALUES ($1, $2, $3, $4) RETURNING id, name, email, hashed_password, role
            `,
        [user.name, user.email, hashedPassword, "user"], // TODO: set the role
      );

      return this.getOneUser(result.rows);
    } finally {
      client.release(); // Always release the client // TODO: check where needs to be done
    }
  }

  async findOne(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `
            SELECT id, name, email, hashed_password, role FROM users WHERE email = $1
        `,
      [email],
    );

    return this.getOneUser(result.rows);
  }
}
