"use client";
//shows buyers booking history

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import DashboardSidebar from "../../components/DashboardSidebar";

type Demand = {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  location: string;
  required_date: string;
  status: string;
};

type Booking = {
  id: number;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
  crop_name: string;
  demand_location: string;
};

export default function BuyerPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardData() {
    setIsLoading(true);
    setError("");

    try {
      const [demandsResponse, bookingsResponse] = await Promise.all([
        fetch("/api/demands"), //get buyers demand requests
        fetch("/api/bookings"), //get buyers bookings
      ]);

      const demandsData = await demandsResponse.json();
      const bookingsData = await bookingsResponse.json();

      if (!demandsResponse.ok) {
        throw new Error(demandsData.message || "Failed to load demands");
      }

      if (!bookingsResponse.ok) {
        throw new Error(bookingsData.message || "Failed to load bookings");
      }

//add fetched demands and bookings into the arrays
      setDemands(demandsData.demands || []);
      setBookings(bookingsData.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }
//load dashboard data when component is rendered only once
  useEffect(() => {
    loadDashboardData();
  }, []);
  const openDemands = demands.filter((demand) => demand.status === "open");
  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="buyer" />

      <section className="dashboard-main">
      <PageHeader
        eyebrow="Institutional Buyer"
        title="Procurement Demand Dashboard"
        description="Review procurement status, delivery activity, and workspace shortcuts."
      />

      {error && <p className="error-message">{error}</p>}

      <section className="dashboard-overview" aria-label="Buyer dashboard summary">
        {isLoading ? (
          <p>Loading procurement summary...</p>
        ) : (
          <>
            <div>
              <span>Total demands</span>
              <strong>{demands.length}</strong>
            </div>
            <div>
              <span>Open demands</span>
              <strong>{openDemands.length}</strong>
            </div>
            <div>
              <span>Active bookings</span>
              <strong>{activeBookings.length}</strong>
            </div>
          </>
        )}
      </section>

      <section className="buyer-info-section" aria-labelledby="buyer-actions-heading">
        <div className="buyer-section-heading">
          <h2 id="buyer-actions-heading">Workspace actions</h2>
          <p>Use the sidebar for full navigation, or jump directly into the core procurement tasks.</p>
        </div>

        <div className="buyer-action-row">
          <Link href="/buyer/demands/new" className="primary-button">
            Create demand
          </Link>
          <Link href="/buyer/demands" className="secondary-button">
            View demands
          </Link>
          <Link href="/buyer/bookings" className="secondary-button">
            View bookings
          </Link>
        </div>
      </section>

      <section className="buyer-info-section" aria-labelledby="procurement-history-heading">
        <div className="buyer-section-heading">
          <h2 id="procurement-history-heading">Procurement history & delivery schedule</h2>
          <p>Track booking status, crop volume, and delivery destination.</p>
        </div>

        {isLoading && <p className="section-empty-state">Loading procurement history...</p>}
        {!isLoading && bookings.length === 0 && <p className="section-empty-state">No bookings yet.</p>}

        {!isLoading && bookings.length > 0 && (
          <div className="buyer-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.crop_name}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>
                      <span className="status-pill">{item.status}</span>
                    </td>
                    <td>{item.demand_location}</td>
                    <td>{item.created_at}</td>
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
