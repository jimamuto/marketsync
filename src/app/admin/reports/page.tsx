"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type DemandSupplyGap = {
  crop_name: string;
  unit: string;
  requested_quantity: number;
  available_quantity: number;
  gap_quantity: number;
  status: string;
};

type HarvestProjection = {
  harvest_month: string;
  crop_name: string;
  unit: string;
  projected_quantity: number;
  farmer_count: number;
};

type Summary = {
  users: number;
  supplies: number;
  demands: number;
  bookings: number;
  demandSupplyGap: DemandSupplyGap[];
  harvestProjection: HarvestProjection[];
};

function formatQuantity(value: number, unit: string) {
  return `${Number(value).toLocaleString()} ${unit}`;
}

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

  const reportTotals = useMemo(() => {
    if (!summary) {
      return null;
    }

    const requested = summary.demandSupplyGap.reduce((total, item) => total + item.requested_quantity, 0);
    const available = summary.demandSupplyGap.reduce((total, item) => total + item.available_quantity, 0);
    const gap = summary.demandSupplyGap.reduce((total, item) => total + item.gap_quantity, 0);
    const projected = summary.harvestProjection.reduce((total, item) => total + item.projected_quantity, 0);
    const farmers = new Set(summary.harvestProjection.map((item) => `${item.crop_name}-${item.harvest_month}`)).size;

    return { requested, available, gap, projected, farmers };
  }, [summary]);

  const maxGapChartValue = Math.max(
    1,
    ...(summary?.demandSupplyGap.flatMap((item) => [item.requested_quantity, item.available_quantity]) ?? []),
  );

  const maxProjectionValue = Math.max(
    1,
    ...(summary?.harvestProjection.map((item) => item.projected_quantity) ?? []),
  );

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin"
          title="Reports"
          description="Demand-supply gap and harvest projection reports for planning decisions."
        />

        <section className="admin-info-section" aria-labelledby="admin-report-heading">
          {isLoading && <p className="section-empty-state">Loading report...</p>}
          {error && <p className="error-message">{error}</p>}

          {!isLoading && !error && summary && reportTotals && (
            <>
              <div className="admin-report-list admin-report-list--summary">
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

              <section className="report-panel" aria-labelledby="gap-report-heading">
                <div className="admin-section-heading">
                  <h2 id="gap-report-heading">Demand vs supply gap</h2>
                  <p>Compares non-cancelled buyer demand against active farmer supply by crop and unit.</p>
                </div>

                <div className="report-metric-grid" aria-label="Demand supply gap totals">
                  <div>
                    <span>Total requested</span>
                    <strong>{Number(reportTotals.requested).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Total available</span>
                    <strong>{Number(reportTotals.available).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Total gap</span>
                    <strong>{Number(reportTotals.gap).toLocaleString()}</strong>
                  </div>
                </div>

                {summary.demandSupplyGap.length === 0 ? (
                  <p className="section-empty-state">No demand records available for gap reporting.</p>
                ) : (
                  <div className="report-chart-list">
                    {summary.demandSupplyGap.map((item) => (
                      <article className="report-chart-row" key={`${item.crop_name}-${item.unit}`}>
                        <div className="report-chart-heading">
                          <div>
                            <strong>{item.crop_name}</strong>
                            <span>{item.status}</span>
                          </div>
                          <small>Gap: {formatQuantity(item.gap_quantity, item.unit)}</small>
                        </div>

                        <div className="report-bars" aria-label={`${item.crop_name} demand and supply chart`}>
                          <div className="report-bar-line">
                            <span>Demand</span>
                            <div>
                              <i style={{ width: `${(item.requested_quantity / maxGapChartValue) * 100}%` }} />
                            </div>
                            <strong>{formatQuantity(item.requested_quantity, item.unit)}</strong>
                          </div>
                          <div className="report-bar-line report-bar-line--supply">
                            <span>Supply</span>
                            <div>
                              <i style={{ width: `${(item.available_quantity / maxGapChartValue) * 100}%` }} />
                            </div>
                            <strong>{formatQuantity(item.available_quantity, item.unit)}</strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="report-panel" aria-labelledby="projection-report-heading">
                <div className="admin-section-heading">
                  <h2 id="projection-report-heading">Harvest projections</h2>
                  <p>Shows upcoming active harvest quantities by month, crop, and contributing farmer records.</p>
                </div>

                <div className="report-metric-grid" aria-label="Harvest projection totals">
                  <div>
                    <span>Projected harvest</span>
                    <strong>{Number(reportTotals.projected).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Projection rows</span>
                    <strong>{summary.harvestProjection.length}</strong>
                  </div>
                  <div>
                    <span>Crop periods</span>
                    <strong>{reportTotals.farmers}</strong>
                  </div>
                </div>

                {summary.harvestProjection.length === 0 ? (
                  <p className="section-empty-state">No upcoming harvests available for projection reporting.</p>
                ) : (
                  <div className="projection-chart" aria-label="Upcoming harvest projection chart">
                    {summary.harvestProjection.map((item) => (
                      <article className="projection-row" key={`${item.harvest_month}-${item.crop_name}-${item.unit}`}>
                        <div>
                          <strong>{item.harvest_month}</strong>
                          <span>{item.crop_name}</span>
                        </div>
                        <div className="projection-bar">
                          <i style={{ width: `${(item.projected_quantity / maxProjectionValue) * 100}%` }} />
                        </div>
                        <small>
                          {formatQuantity(item.projected_quantity, item.unit)} · {item.farmer_count} farmer
                          {item.farmer_count === 1 ? "" : "s"}
                        </small>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
