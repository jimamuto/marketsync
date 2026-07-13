"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type Demand = {
  id: number;
  buyer_name: string;
  buyer_email: string;
  crop_name: string;
  quantity: number;
  unit: string;
  required_date: string;
  location: string;
  status: string;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_note: string | null;
};

export default function AdminDemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDemands() {
      try {
        const response = await fetch("/api/admin/demands");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load demands");
        }

        setDemands(data.demands || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load demands");
      } finally {
        setIsLoading(false);
      }
    }

    loadDemands();
  }, []);

  async function moderateDemand(demandId: number, moderationStatus: "approved" | "rejected") {
    setUpdatingId(demandId);
    setError("");

    try {
      const response = await fetch(`/api/admin/demands/${demandId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderation_status: moderationStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update demand review");
      }

      setDemands((current) =>
        current.map((demand) =>
          demand.id === demandId
            ? { ...demand, moderation_status: data.demand.moderation_status, moderation_note: data.demand.moderation_note }
            : demand,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update demand review");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin Moderation"
          title="Demand requests"
          description="Review institutional buyer requests before they enter the matching workflow."
        />

        <section className="admin-info-section" aria-labelledby="admin-demands-heading">
          <div className="admin-section-heading">
            <h2 id="admin-demands-heading">Demand review queue</h2>
            <p>Approved requests become visible to the supply and demand planning workflow.</p>
          </div>

          {isLoading && <p className="section-empty-state">Loading demands...</p>}
          {error && <p className="error-message">{error}</p>}
          {!isLoading && !error && demands.length === 0 && <p className="section-empty-state">No demands found.</p>}

          {!isLoading && !error && demands.length > 0 && (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Required Date</th>
                    <th>Demand status</th>
                    <th>Review</th>
                    <th>Admin action</th>
                  </tr>
                </thead>
                <tbody>
                  {demands.map((demand) => (
                    <tr key={demand.id}>
                      <td>{demand.buyer_name}</td>
                      <td>{demand.crop_name}</td>
                      <td>{demand.quantity} {demand.unit}</td>
                      <td>{demand.location}</td>
                      <td>{demand.required_date}</td>
                      <td>{demand.status}</td>
                      <td><span className={`status-pill status-pill--${demand.moderation_status}`}>{demand.moderation_status}</span></td>
                      <td>
                        <div className="admin-table-actions">
                          {demand.moderation_status !== "approved" && (
                            <button
                              type="button"
                              className="table-button table-button--positive"
                              disabled={updatingId === demand.id}
                              onClick={() => moderateDemand(demand.id, "approved")}
                            >
                              {updatingId === demand.id ? "Saving..." : "Approve"}
                            </button>
                          )}
                          {demand.moderation_status !== "rejected" && (
                            <button
                              type="button"
                              className="table-button table-button--danger"
                              disabled={updatingId === demand.id}
                              onClick={() => moderateDemand(demand.id, "rejected")}
                            >
                              {updatingId === demand.id ? "Saving..." : "Reject"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
