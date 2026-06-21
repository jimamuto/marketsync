import type { NextRequest } from "next/server";
import type { UserRole } from "./auth";

const SESSION_USER_ID = "session_user_id";
const SESSION_ROLE = "session_role"; //e.g farmer,admin etc

export function getSessionUserId(request: NextRequest) {
  const value = request.cookies.get(SESSION_USER_ID)?.value; //extracts cookies from the request. is null if absent
  if (!value) {
    return null;
  }
//converts user id into a number
  const userId = Number(value);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}
//receives request and returns valid user role or null
export function getSessionRole(request: NextRequest): UserRole | null {
  const role = request.cookies.get(SESSION_ROLE)?.value;
  if (role === "farmer" || role === "buyer" || role === "admin") {
    return role;
  }

  return null;
}
//admin has full access to the farmer and buyer
export function hasFarmerAccess(role: UserRole | null) {
  return role === "farmer" || role === "admin";
}

export function hasBuyerAccess(role: UserRole | null) {
  return role === "buyer" || role === "admin";
}
