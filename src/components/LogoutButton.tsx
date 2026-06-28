"use client";

import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className = "navbar-button" }: LogoutButtonProps) {
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
    <button type="button" onClick={handleLogout} className={className}>
      Logout
    </button>
  );
}
