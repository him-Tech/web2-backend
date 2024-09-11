import request from "supertest";
import { type Express } from "express";
import { createApp } from "../../createApp";
import { setupTestDB } from "../jest.setup";

describe("/api/v1/auth", () => {
  let app: Express = createApp();

  setupTestDB();

  it("/api/v1/auth/status should return 401 when not logged in", async () => {
    const response = await request(app).get("/api/v1/auth/status");
    expect(response.statusCode).toBe(401);
  });

  it("Login", async () => {
    const email = "lauriane@gmail.com";
    const password = "password";

    // create user

    await request(app).post("/api/v1/users").send({
      email: email,
      password: password,
    });

    // login

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: email,
      password: password,
    });

    expect(loginResponse.status).toBe(200);

    // should be logged in

    const response = await request(app)
      .get("/api/v1/auth/status")
      .set("Cookie", loginResponse.headers["set-cookie"]);

    console.log("Response Body:", response.body);
    console.log("Response Status:", response.status);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("data.name", null);
    expect(response.body).toHaveProperty("data.email", email);
    expect(response.body).toHaveProperty("role", "user");
  });

  it("Log out", async () => {
    const email = "lauriane@gmail.com";
    const password = "password";

    // create user

    await request(app).post("/api/v1/users").send({
      email: email,
      password: password,
    });

    // login

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: email,
      password: password,
    });

    expect(loginResponse.status).toBe(200);

    // logout

    const logoutResponse = await request(app)
      .post("/api/v1/auth/logout")
      .set("Cookie", loginResponse.headers["set-cookie"]);

    expect(logoutResponse.status).toBe(200);

    // should NOT be logged in

    const response = await request(app)
      .get("/api/v1/auth/status")
      .set("Cookie", loginResponse.headers["set-cookie"]);

    expect(response.statusCode).toBe(401);
  });
});
