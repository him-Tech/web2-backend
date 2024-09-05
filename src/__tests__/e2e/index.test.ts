import request from "supertest";
import { type Express } from "express";
import { createApp } from "../../createApp";
import { getPool } from "../../db";
import { Migration } from "../../db/migration";

describe("/api/users", () => {
  let migration: Migration;
  let app: Express;

  beforeAll(async (): Promise<void> => {
    app = createApp();
    migration = new Migration(getPool());

    try {
      await migration.drop();
      console.log("Migration drop successful");
    } catch (e) {
      console.error("Error during migration drop in beforeAll: ", e);
    }

    try {
      await migration.migrate();
      console.log("Migration successful");
    } catch (e) {
      console.error("Error during migration in beforeAll: ", e);
    }
  });

  afterAll(async (): Promise<void> => {
    try {
      await migration.drop();
      console.log("Migration drop successful after tests");
    } catch (e) {
      console.error("Error during migration drop in afterAll: ", e);
    }
  });

  it("should return an empty array when getting /api/users", async (): Promise<void> => {
    const response = await request(app).get("/api/users");
    console.log("Response Body:", response.body); // Log the response body for debugging
    console.log("Response Status:", response.status); // Log the response status for debugging

    // Check if the response status is 200 OK
    expect(response.status).toBe(200);

    // Check if the response body is an empty array
    expect(response.body).toStrictEqual([]);
  });

  it("should create the user", async (): Promise<void> => {
    const response = await request(app).post("/api/users").send({
      name: "Adam",
      email: "adam123@example.com",
      hashedPassword: "pasdddassword", // Correct case
    });

    console.log("Response Body:", response.body); // Log the response body for debugging
    console.log("Response Status:", response.status); // Log the response status for debugging

    // Check if the response status is 201 Created
    expect(response.status).toBe(201);

    // Validate the structure of the response body if needed
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "Adam");
    expect(response.body).toHaveProperty("email", "adam123@example.com");
    expect(response.body).toHaveProperty("hashedPassword"); // Correct case
    expect(response.body).toHaveProperty("role", "user");
  });
});
