"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type Supply = {
  id: number;
  farmer_name: string;
  farmer_email: string;
  crop_name: string;
  crop_variety: string | null;
  quantity: number;
  unit: string;
  location: string;
  expected_harvest_date: string;
  status: string;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_note: string | null;
};

export default function AdminSuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSupplies() {
      try {
        const response = await fetch("/api/admin/supplies");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load supplies");
        }

        setSupplies(data.supplies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load supplies");
      } finally {
        setIsLoading(false);
      }
    }

    loadSupplies();
  }, []);

  async function moderateSupply(supplyId: number, moderationStatus: "approved" | "rejected") {
    setUpdatingId(supplyId);
    setError("");

    try {
      const response = await fetch(`/api/admin/supplies/${supplyId}/moderation`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderation_status: moderationStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update supply review");
      }

      setSupplies((current) =>
        current.map((supply) =>
          supply.id === supplyId
            ? { ...supply, moderation_status: data.supply.moderation_status, moderation_note: data.supply.moderation_note }
            : supply,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update supply review");
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
          title="Crop supplies"
          description="Review farmer listings before they influence matching and marketplace planning."
        />

        <section className="admin-info-section" aria-labelledby="admin-supplies-heading">
          <div className="admin-section-heading">
            <h2 id="admin-supplies-heading">Supply review queue</h2>
            <p>Moderation status is separate from the crop&apos;s growing or booking status.</p>
          </div>

          {isLoading && <p className="section-empty-state">Loading supplies...</p>}
          {error && <p className="error-message">{error}</p>}
          {!isLoading && !error && supplies.length === 0 && <p className="section-empty-state">No supplies found.</p>}

          {!isLoading && !error && supplies.length > 0 && (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Harvest Date</th>
                    <th>Crop status</th>
                    <th>Review</th>
                    <th>Admin action</th>
                  </tr>
                </thead>
                <tbody>
                  {supplies.map((supply) => (
                    <tr key={supply.id}>
                      <td>{supply.farmer_name}</td>
                      <td>{supply.crop_name}{supply.crop_variety ? `, ${supply.crop_variety}` : ""}</td>
                      <td>{supply.quantity} {supply.unit}</td>
                      <td>{supply.location}</td>
                      <td>{supply.expected_harvest_date}</td>
                      <td>{supply.status}</td>
                      <td><span className={`status-pill status-pill--${supply.moderation_status}`}>{supply.moderation_status}</span></td>
                      <td>
                        <div className="admin-table-actions">
                          {supply.moderation_status !== "approved" && (
                            <button
                              type="button"
                              className="table-button table-button--positive"
                              disabled={updatingId === supply.id}
                              onClick={() => moderateSupply(supply.id, "approved")}
                            >
                              {updatingId === supply.id ? "Saving..." : "Approve"}
                            </button>
                          )}
                          {supply.moderation_status !== "rejected" && (
                            <button
                              type="button"
                              className="table-button table-button--danger"
                              disabled={updatingId === supply.id}
                              onClick={() => moderateSupply(supply.id, "rejected")}
                            >
                              {updatingId === supply.id ? "Saving..." : "Reject"}
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
