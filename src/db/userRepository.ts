import {Pool, PoolClient} from "pg";
import {User, UserId} from "../model";
import {CreateUserDto} from "../dtos/CreateUser.dto";

export function getUserRepository(): UserRepository  {
    return new UserRepositoryImpl(new Pool());
}

export interface UserRepository {
    insert(user: CreateUserDto): Promise<User>;
    getById(id: UserId): Promise<User>;
    getAll(): Promise<User[]>;
    findOne(email: string): Promise<User>;
}

class UserRepositoryImpl implements UserRepository {

    pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool
    }

    async getAll(): Promise<User[]> {
        const result = await this.pool.query(
            ` 
            select * from users
            `
        )
        return result.rows;
    }

    async getById(id: UserId): Promise<User> {
        const result = await this.pool.query(
            ` 
            select *
            from users
            `
        )

        return result.rows[0];
        // TODO
    }

    async insert(user: CreateUserDto): Promise<User> {
        const { email, hashedPassword} = user;
        const client = await this.pool.connect();
        const result = await client.query(
            `
                INSERT INTO users (name, email, hashedPassword, role)
                VALUES ($1, $2, $3, $4) RETURNING id, name, hashedPassword, role, createdAt, updatedAt
            `,
            [email, hashedPassword]
        );



        return result.rows[0];
    }

    async findOne(email: string): Promise<User> {
        const result = await this.pool.query(
            ` 
            select
              name,
              age
            from users
            where age > ${ email }
              `
        )

        return result.rows[0];
        // TODO
    }
}