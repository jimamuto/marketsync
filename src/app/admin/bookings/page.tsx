"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type Booking = {
  id: number;
  buyer_name: string;
  farmer_name: string;
  crop_name: string;
  quantity: number;
  unit: string;
  supply_location: string;
  demand_location: string;
  status: string;
  created_at: string;
};

const statusActions: Record<string, Array<{ label: string; status: string; className?: string }>> = {
  pending: [
    { label: "Accept", status: "accepted", className: "table-button--positive" },
    { label: "Reject", status: "rejected", className: "table-button--danger" },
  ],
  accepted: [
    { label: "Complete", status: "completed", className: "table-button--positive" },
    { label: "Cancel", status: "cancelled", className: "table-button--danger" },
  ],
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch("/api/admin/bookings");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load bookings");
        }

        setBookings(data.bookings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookings");
      } finally {
        setIsLoading(false);
      }
    }

    loadBookings();
  }, []);

  async function updateBookingStatus(bookingId: number, status: string) {
    setUpdatingId(bookingId);
    setError("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId ? { ...booking, status: data.booking.status } : booking,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin Operations"
          title="Booking operations"
          description="Resolve pending buyer and farmer transactions, then keep fulfillment status accurate."
        />

        {isLoading && <p className="section-empty-state">Loading bookings...</p>}
        {error && <p className="error-message">{error}</p>}
        {!isLoading && !error && bookings.length === 0 && <p className="section-empty-state">No bookings found.</p>}

        {!isLoading && bookings.length > 0 && (
          <section className="admin-info-section" aria-labelledby="admin-bookings-heading">
            <div className="admin-section-heading">
              <h2 id="admin-bookings-heading">All booking activity</h2>
              <p>Admin decisions are sent to both parties and recorded in the audit log.</p>
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Buyer</th>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Admin action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.buyer_name}</td>
                      <td>{booking.farmer_name}</td>
                      <td>{booking.crop_name}</td>
                      <td>{booking.quantity} {booking.unit}</td>
                      <td><span className={`status-pill status-pill--${booking.status}`}>{booking.status}</span></td>
                      <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="admin-table-actions">
                          {(statusActions[booking.status] || []).map((action) => (
                            <button
                              key={action.status}
                              type="button"
                              className={`table-button ${action.className || ""}`}
                              disabled={updatingId === booking.id}
                              onClick={() => updateBookingStatus(booking.id, action.status)}
                            >
                              {updatingId === booking.id ? "Saving..." : action.label}
                            </button>
                          ))}
                          {!statusActions[booking.status] && <span className="table-muted">No action</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
