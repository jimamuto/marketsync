import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "./LogoutButton";

const dashboardRoutes = {
  farmer: "/farmer",
  buyer: "/buyer",
  admin: "/admin",
} as const;

export default async function Navbar() {
  const cookieStore = await cookies();

  // Extract specific cookie values safely. They are undefined when the user is logged out.
  const userId = cookieStore.get("session_user_id")?.value;
  const role = cookieStore.get("session_role")?.value;

  const isLoggedIn = Boolean(userId);

  // Send logged-in users to the dashboard that matches their saved database role.
  const dashboardHref =
    role === "farmer" || role === "buyer" || role === "admin"
      ? dashboardRoutes[role]
      : "/";

  return (
    <header className="navbar">
      <Link href="/" className="navbar-logo">
        MarketSync
      </Link>

      <nav className="navbar-links" aria-label="Main navigation">
        <Link href="/">Home</Link>

        {isLoggedIn ? (
          <>
            <Link href={dashboardHref}>Dashboard</Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link href="/register">Register</Link>
            <Link href="/login">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
}
