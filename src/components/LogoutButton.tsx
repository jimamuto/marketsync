"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    // Navigate to login after the API clears the session cookies.
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className="navbar-button">
      Logout
    </button>
  );
}
