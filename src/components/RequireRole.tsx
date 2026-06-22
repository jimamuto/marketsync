"use client";

import { ReactNode } from "react";
import { useRequireRole } from "../hooks/useRequireRole";

type RequireRoleProps = {
  role: "farmer" | "buyer" | "admin";
  children: ReactNode;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const isChecking = useRequireRole(role);

  if (isChecking) {
    return <main className="login-card-page">Checking access...</main>;
  }

  return children;
}
