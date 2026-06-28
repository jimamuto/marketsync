"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type Summary = {
  users: number;
  supplies: number;
  demands: number;
  bookings: number;
};

export default function AdminReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        const response = await fetch("/api/admin/summary");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load reports");
        }

        setSummary(data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    }

    loadReports();
  }, []);

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
      <PageHeader eyebrow="Admin" title="Reports" description="Report summary" />

      <section className="admin-info-section" aria-labelledby="admin-report-heading">

        {isLoading && <p className="section-empty-state">Loading report...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && summary && (
          <div className="admin-report-list">
            <Link href="/admin/users" className="admin-report-row">
              <span>Total users</span>
              <strong>{summary.users}</strong>
            </Link>

            <Link href="/admin/supplies" className="admin-report-row">
              <span>Total supplies</span>
              <strong>{summary.supplies}</strong>
            </Link>

            <Link href="/admin/demands" className="admin-report-row">
              <span>Total demands</span>
              <strong>{summary.demands}</strong>
            </Link>

            <Link href="/admin/bookings" className="admin-report-row">
              <span>Total bookings</span>
              <strong>{summary.bookings}</strong>
            </Link>
          </div>
        )}
      </section>

          </section>
    </main>
  );
}
