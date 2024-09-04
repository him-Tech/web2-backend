import { Pool } from "pg";
import { User, UserId } from "../model";
import { CreateUserDto } from "../dtos/CreateUser.dto";
import { getPool } from "../db"; // Import the getPool function to use the same pool
export function getUserRepository(): UserRepository {
  return new UserRepositoryImpl(getPool()); // Use the shared pool instance
}

export interface UserRepository {
  insert(user: CreateUserDto): Promise<User>;
  getById(id: UserId): Promise<User>;
  getAll(): Promise<User[]>;
  findOne(email: string): Promise<User | null>; // Return null if not found
}

class UserRepositoryImpl implements UserRepository {
  pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async getAll(): Promise<User[]> {
    const result = await this.pool.query(`
            SELECT id, name, email, hashedpassword, role FROM users
        `);
    // Map database rows to User instances
    return result.rows.map(
      (row: any) =>
        new User(
          new UserId(row.id),
          row.name,
          row.email,
          row.hashedpassword,
          row.role,
        ),
    );
  }

  async getById(id: UserId): Promise<User> {
    const result = await this.pool.query(
      `
            SELECT id, name, email, hashedpassword, role FROM users WHERE id = $1
        `,
      [id.id],
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const row = result.rows[0];
    return new User(
      new UserId(row.id),
      row.name,
      row.email,
      row.hashedpassword,
      row.role,
    );
  }

  async insert(user: CreateUserDto): Promise<User> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
                INSERT INTO users (name, email, hashedpassword, role)
                VALUES ($1, $2, $3, $4) RETURNING id, name, email, hashedpassword, role
            `,
        [user.name, user.email, user.hashedpassword, "user"],
      );

      const row = result.rows[0];
      return new User(
        new UserId(row.id),
        row.name,
        row.email,
        row.hashedpassword,
        row.role,
      );
    } finally {
      client.release(); // Always release the client
    }
  }

  async findOne(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `
            SELECT id, name, email, hashedpassword, role FROM users WHERE email = $1
        `,
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return new User(
      new UserId(row.id),
      row.name,
      row.email,
      row.hashedpassword,
      row.role,
    );
  }
}
