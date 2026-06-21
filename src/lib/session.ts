import type { NextRequest } from "next/server";
import type { UserRole } from "./auth";

const SESSION_USER_ID = "session_user_id";
const SESSION_ROLE = "session_role";

export function getSessionUserId(request: NextRequest) {
  const value = request.cookies.get(SESSION_USER_ID)?.value;
  if (!value) {
    return null;
  }

  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export function getSessionRole(request: NextRequest): UserRole | null {
  const role = request.cookies.get(SESSION_ROLE)?.value;
  if (role === "farmer" || role === "buyer" || role === "admin") {
    return role;
  }

  return null;
}

export function hasFarmerAccess(role: UserRole | null) {
  return role === "farmer" || role === "admin";
}

export function hasBuyerAccess(role: UserRole | null) {
  return role === "buyer" || role === "admin";
}
