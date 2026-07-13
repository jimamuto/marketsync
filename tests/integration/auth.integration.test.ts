import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "../../src/lib/database";
import { POST as register } from "../../src/app/api/auth/register/route";
import { POST as login } from "../../src/app/api/auth/login/route";
import { GET as verifyEmail } from "../../src/app/api/auth/verify-email/route";
import { resetTestDatabase } from "../setup/integration";
import { responseJson, testRequest } from "../helpers/test-request";

vi.mock("../../src/lib/mail", () => ({
  sendMail: vi.fn(async () => ({ messageId: "test-message" })),
}));

import { sendMail } from "../../src/lib/mail";

describe("authentication API with PostgreSQL", () => {
  beforeEach(async () => {
    await resetTestDatabase();
    vi.mocked(sendMail).mockClear();
  });

  it("registers, verifies, and logs in a farmer", async () => {
    const email = `farmer-${Date.now()}@example.test`;
    const registrationResponse = await register(
      testRequest("/api/auth/register", {
        method: "POST",
        body: {
          name: "Integration Farmer",
          email,
          password: "Password123!",
          role: "farmer",
          location: "Nairobi",
        },
      }),
    );

    expect(registrationResponse.status).toBe(201);
    expect(vi.mocked(sendMail)).toHaveBeenCalledOnce();

    const tokenRow = await getDb().query<{ token: string; user_id: number }>(
      `select token, user_id from email_verification_tokens
       join users on users.id = email_verification_tokens.user_id
       where users.email = $1`,
      [email],
    );
    expect(tokenRow.rowCount).toBe(1);

    const loginBeforeVerification = await login(
      testRequest("/api/auth/login", {
        method: "POST",
        body: { email, password: "Password123!" },
      }),
    );
    expect(loginBeforeVerification.status).toBe(403);
    await expect(responseJson(loginBeforeVerification)).resolves.toMatchObject({
      verification_required: true,
    });

    const verificationResponse = await verifyEmail(
      new Request(`http://localhost/api/auth/verify-email?token=${tokenRow.rows[0].token}`),
    );
    expect(verificationResponse.status).toBe(307);

    const verifiedUser = await getDb().query(
      "select email_verified_at from users where id = $1",
      [tokenRow.rows[0].user_id],
    );
    expect(verifiedUser.rows[0].email_verified_at).not.toBeNull();

    const loginResponse = await login(
      testRequest("/api/auth/login", {
        method: "POST",
        body: { email, password: "Password123!" },
      }),
    );
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers.get("set-cookie")).toContain("session_user_id=");
    expect(await responseJson(loginResponse)).toMatchObject({
      user: { email, role: "farmer" },
    });
  });

  it("rejects public admin registration and invalid credentials", async () => {
    const adminResponse = await register(
      testRequest("/api/auth/register", {
        method: "POST",
        body: {
          name: "Not Allowed",
          email: "public-admin@example.test",
          password: "Password123!",
          role: "admin",
        },
      }),
    );
    expect(adminResponse.status).toBe(403);

    const loginResponse = await login(
      testRequest("/api/auth/login", {
        method: "POST",
        body: { email: "missing@example.test", password: "Password123!" },
      }),
    );
    expect(loginResponse.status).toBe(401);
  });
});
