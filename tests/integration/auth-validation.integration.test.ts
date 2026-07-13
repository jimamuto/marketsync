import { describe, expect, it, vi } from "vitest";
import { POST as register } from "../../src/app/api/auth/register/route";
import { POST as login } from "../../src/app/api/auth/login/route";
import { POST as logout } from "../../src/app/api/auth/logout/route";
import { GET as verifyEmail } from "../../src/app/api/auth/verify-email/route";
import { getDb } from "../../src/lib/database";
import { createTestUser, uniqueEmail } from "../helpers/test-data";
import { testRequest } from "../helpers/test-request";

vi.mock("../../src/lib/mail", () => ({
  sendMail: vi.fn(async () => ({ messageId: "test-message" })),
}));

describe("authentication validation and edge cases", () => {
  it("rejects missing registration fields and short passwords", async () => {
    const missing = await register(
      testRequest("/api/auth/register", { method: "POST", body: { email: "missing@example.test" } }),
    );
    expect(missing.status).toBe(400);

    const shortPassword = await register(
      testRequest("/api/auth/register", {
        method: "POST",
        body: { name: "Buyer", email: uniqueEmail("buyer"), password: "short", role: "buyer" },
      }),
    );
    expect(shortPassword.status).toBe(400);
  });

  it("rejects unsupported roles and duplicate email addresses", async () => {
    const invalidRole = await register(
      testRequest("/api/auth/register", {
        method: "POST",
        body: { name: "Manager", email: "manager@example.test", password: "Password123!", role: "manager" },
      }),
    );
    expect(invalidRole.status).toBe(400);

    const email = uniqueEmail("buyer");
    const payload = { name: "Buyer", email, password: "Password123!", role: "buyer" };
    expect((await register(testRequest("/api/auth/register", { method: "POST", body: payload }))).status).toBe(201);
    expect((await register(testRequest("/api/auth/register", { method: "POST", body: payload }))).status).toBe(409);
  });

  it("rejects an incorrect password without creating a session", async () => {
    const buyer = await createTestUser({ role: "buyer" });
    const response = await login(
      testRequest("/api/auth/login", {
        method: "POST",
        body: { email: buyer.email, password: "Incorrect123!" },
      }),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("deletes an expired verification token without verifying the user", async () => {
    const user = await createTestUser({ role: "farmer", verified: false });
    const token = `expired-${Date.now()}`;
    await getDb().query(
      "insert into email_verification_tokens (user_id, token, expires_at) values ($1, $2, CURRENT_TIMESTAMP - interval '1 minute')",
      [user.id, token],
    );

    const response = await verifyEmail(new Request(`http://localhost/api/auth/verify-email?token=${token}`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login");

    const tokenResult = await getDb().query("select id from email_verification_tokens where token = $1", [token]);
    const userResult = await getDb().query("select email_verified_at from users where id = $1", [user.id]);
    expect(tokenResult.rowCount).toBe(0);
    expect(userResult.rows[0].email_verified_at).toBeNull();
  });

  it("redirects missing and unknown verification tokens to login", async () => {
    const missing = await verifyEmail(new Request("http://localhost/api/auth/verify-email"));
    const unknown = await verifyEmail(
      new Request("http://localhost/api/auth/verify-email?token=does-not-exist"),
    );

    expect(missing.status).toBe(307);
    expect(unknown.status).toBe(307);
    expect(missing.headers.get("location")).toBe("http://localhost/login");
    expect(unknown.headers.get("location")).toBe("http://localhost/login");
  });

  it("clears both session cookies on logout", async () => {
    const response = await logout();
    const cookies = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(cookies).toContain("session_user_id=");
    expect(cookies).toContain("session_role=");
    expect(cookies).toContain("Max-Age=0");
  });
});
