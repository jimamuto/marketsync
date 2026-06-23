"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

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
    <main className="dashboard-page">
      <PageHeader eyebrow="Admin" title="Reports" description="Read-only MVP report summary" />

      <DashboardCard title="System report">
        {isLoading && <p>Loading report...</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && summary && (
          <div className="booking-list">
            <article className="booking-card">
              <strong>Total users</strong>
              <p>{summary.users}</p>
            </article>

            <article className="booking-card">
              <strong>Total supplies</strong>
              <p>{summary.supplies}</p>
            </article>

            <article className="booking-card">
              <strong>Total demands</strong>
              <p>{summary.demands}</p>
            </article>

            <article className="booking-card">
              <strong>Total bookings</strong>
              <p>{summary.bookings}</p>
            </article>
          </div>
        )}
      </DashboardCard>

      <Link href="/admin" className="secondary-button">
        Back to admin
      </Link>
    </main>
  );
}
