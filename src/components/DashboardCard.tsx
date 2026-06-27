import { ReactNode } from "react";

type DashboardCardVariant = "default" | "primary" | "metric" | "action" | "subtle";

type DashboardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  variant?: DashboardCardVariant;
};

export default function DashboardCard({
  title,
  children,
  className = "",
  variant = "default",
}: DashboardProps) {
  const classes = ["dashboard-card", `dashboard-card--${variant}`, className].filter(Boolean).join(" ");

  return (
    <section className={classes}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
