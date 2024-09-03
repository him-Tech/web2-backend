import request from "supertest";
import {type Express} from "express-serve-static-core";
import {createApp} from "../../createApp";
import {getPool} from "../../db";
import {Migration} from "../../db/migration";

describe("/api/users", () => {
	let migration: Migration;
	let app: Express;

	beforeAll(async () => {
		app = createApp();
		migration = new Migration(getPool());
		try {
			await migration.drop();
		} catch (e){}

		await migration.migrate();
	});

	afterAll(async () => {
		await migration.drop();
	})

	it("should return an empty array when getting /api/users", async () => {
		const response = await request(app).get("/api/users");
		expect(response).toStrictEqual([]);
	});

	it("should create the user", async () => {
		const response = await request(app).post("/api/users").send({
			email: "adam123",
			hashedPassword: "pasdddassword",
		});

		console.log(response)
		expect(response.statusCode).toBe(201);
	});
});
