"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "farmer" | "buyer" | "admin";

export function useRequireRole(requiredRole: UserRole) {
  const router = useRouter();
  // isChecking keeps the protected page hidden while the app confirms the user's session and role.
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        // Ask the backend who is currently logged in using the saved session cookies.
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();

        // If the user is logged in but has the wrong role, block access to this page.
        if (data.user.role !== requiredRole) {
          router.push("/unauthorized");
          return;
        }
      } catch {
        // If the request fails, treat it as not authenticated.
        router.push("/login");
      } finally {
        // Stop showing the checking message once the access check finishes.
        setIsChecking(false);
      }
    }

    checkAccess();
  }, [requiredRole, router]);

  // Return this so pages/layouts can show "Checking access..." before rendering protected content.
  return isChecking;
}
