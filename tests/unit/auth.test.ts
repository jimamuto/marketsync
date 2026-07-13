import { describe, expect, it } from "vitest";
import { IsvalidRole, confirmPassword, hashPassword, tosafeUser } from "../../src/lib/auth";

describe("authentication helpers", () => {
  it("accepts only supported user roles", () => {
    expect(IsvalidRole("farmer")).toBe(true);
    expect(IsvalidRole("buyer")).toBe(true);
    expect(IsvalidRole("admin")).toBe(true);
    expect(IsvalidRole("manager")).toBe(false);
    expect(IsvalidRole(null)).toBe(false);
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Password123!");

    expect(hash).not.toBe("Password123!");
    await expect(confirmPassword("Password123!", hash)).resolves.toBe(true);
    await expect(confirmPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("returns only safe user fields", () => {
    expect(
      tosafeUser({
        id: 4,
        name: "Amina Farmer",
        email: "amina@example.test",
        role: "farmer",
        phone: null,
        location: "Nairobi",
        password_hash: "secret",
      } as never),
    ).toEqual({
      id: 4,
      name: "Amina Farmer",
      email: "amina@example.test",
      role: "farmer",
      phone: null,
      location: "Nairobi",
    });
  });
});
