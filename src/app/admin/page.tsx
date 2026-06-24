"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import DashboardSidebar from "../../components/DashboardSidebar";

type Summary = {
  users: number;
  supplies: number;
  demands: number;
  bookings: number;
};

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await fetch("/api/admin/summary");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load admin summary");
        }

        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin summary");
      } finally {
        setIsLoading(false);
      }
    }

    loadSummary();
  }, []);

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin Dashboard"
          title="System overview"
          description="Monitor users, supplies, demands, bookings, and reports"
        />

        <DashboardCard title="System summary">
          {isLoading && <p>Loading summary...</p>}
          {error && <p className="error-message">{error}</p>}

          {!isLoading && !error && summary && (
            <div className="match-grid">
              <Link href="/admin/users" className="match-card">
                <strong>Users</strong>
                <p>{summary.users}</p>
              </Link>

              <Link href="/admin/supplies" className="match-card">
                <strong>Supplies</strong>
                <p>{summary.supplies}</p>
              </Link>

              <Link href="/admin/demands" className="match-card">
                <strong>Demands</strong>
                <p>{summary.demands}</p>
              </Link>

              <Link href="/admin/bookings" className="match-card">
                <strong>Bookings</strong>
                <p>{summary.bookings}</p>
              </Link>
            </div>
          )}
        </DashboardCard>
      </section>
    </main>
  );
}
