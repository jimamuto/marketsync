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

        {error && <p className="error-message">{error}</p>}

        <section className="dashboard-priority-grid" aria-label="Admin next steps and summary">
          <DashboardCard title="Today’s priority" variant="primary">
            <p>Start with demand, supply, and booking health before drilling into individual user records.</p>
            <div className="dashboard-card-actions">
              <Link href="/admin/reports" className="primary-button">
                View reports
              </Link>
              <Link href="/admin/bookings" className="secondary-button">
                Check bookings
              </Link>
            </div>
          </DashboardCard>

          <section className="admin-overview" aria-label="Admin system summary">
            {isLoading && <p className="section-empty-state">Loading summary...</p>}

            {!isLoading && !error && summary && (
              <>
                <Link href="/admin/users">
                  <span>Users</span>
                  <strong>{summary.users}</strong>
                </Link>

                <Link href="/admin/supplies">
                  <span>Supplies</span>
                  <strong>{summary.supplies}</strong>
                </Link>

                <Link href="/admin/demands">
                  <span>Demands</span>
                  <strong>{summary.demands}</strong>
                </Link>

                <Link href="/admin/bookings">
                  <span>Bookings</span>
                  <strong>{summary.bookings}</strong>
                </Link>
              </>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
