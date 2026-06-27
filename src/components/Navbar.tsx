// Adds the bell notification button beside the dashboard link and avatar for logged-in users.
import Link from "next/link";
import { cookies } from "next/headers";
import { getDb } from "../lib/database";
import NavbarAccountMenu from "./NavbarAccountMenu";
import NavbarNotifications from "./NavbarNotifications";

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
  let userName: string | null = null;

  if (userId) {
    try {
      const result = await getDb().query(
        `select name from users where id = $1 limit 1`,
        [Number(userId)],
      );
      userName = result.rows[0]?.name ?? null;
    } catch {
      userName = null;
    }
  }

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
            <NavbarNotifications />
            <NavbarAccountMenu name={userName} role={role} />
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
