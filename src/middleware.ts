//performs operations before client side rendering
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = {
  "/farmer": "farmer",
  "/buyer": "buyer",
  "/admin": "admin",
} as const;

const authenticatedRoutes = ["/account"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;//gets the page type the user is trying to type

  //check if requested path is protecct
  const matchedRoute = Object.entries(protectedRoutes).find(([routePrefix]) =>
    pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
  );

  const needsAuthentication = authenticatedRoutes.some((routePrefix) =>
    pathname === routePrefix || pathname.startsWith(`${routePrefix}/`),
  );

  const sessionUserId = request.cookies.get("session_user_id")?.value;
  const sessionRole = request.cookies.get("session_role")?.value;

  if (needsAuthentication && !sessionUserId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  //if not protected proceed normally
  if (!matchedRoute) {
    return NextResponse.next();
  }

  //gets required role from matched route
  const requiredRole = matchedRoute[1];

  if (!sessionUserId || !sessionRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionRole !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
//allow user to proceed
  return NextResponse.next();
}

//telling nextjs which routes should run middleware
export const config = {
  matcher: ["/farmer/:path*", "/buyer/:path*", "/admin/:path*", "/account/:path*"], //including nested routes
};
