import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  getSessionRole,
  getSessionUserId,
  hasAdminAccess,
  hasBuyerAccess,
  hasFarmerAccess,
} from "../../src/lib/session";

function request(cookie?: string) {
  return new NextRequest("http://localhost/test", {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("session access helpers", () => {
  it("reads valid session cookies", () => {
    const currentRequest = request("session_user_id=12; session_role=farmer");

    expect(getSessionUserId(currentRequest)).toBe(12);
    expect(getSessionRole(currentRequest)).toBe("farmer");
  });

  it("rejects invalid session identifiers and roles", () => {
    const currentRequest = request("session_user_id=abc; session_role=manager");

    expect(getSessionUserId(currentRequest)).toBeNull();
    expect(getSessionRole(currentRequest)).toBeNull();
  });

  it("applies role permissions", () => {
    expect(hasFarmerAccess("farmer")).toBe(true);
    expect(hasFarmerAccess("admin")).toBe(true);
    expect(hasFarmerAccess("buyer")).toBe(false);
    expect(hasBuyerAccess("buyer")).toBe(true);
    expect(hasBuyerAccess("admin")).toBe(true);
    expect(hasBuyerAccess("farmer")).toBe(false);
    expect(hasAdminAccess("admin")).toBe(true);
    expect(hasAdminAccess("buyer")).toBe(false);
  });
});
