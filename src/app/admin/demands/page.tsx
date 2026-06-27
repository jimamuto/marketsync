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
};

export default function AdminDemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
      <PageHeader eyebrow="Admin" title="Demand requests" description="View all buyer demand requests" />

      <section className="admin-info-section" aria-labelledby="admin-demands-heading">
        <div className="admin-section-heading">
          <h2 id="admin-demands-heading">Demands</h2>
          <p>Review buyer requests by crop, volume, delivery location, required date, and status.</p>
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
                  <th>Status</th>
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
