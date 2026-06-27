//booking page
"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type Booking = {
  id: number;
  supply_id: number;
  demand_request_id: number;
  quantity: number;
  unit: string;
  status: string;
  message: string | null;
  created_at: string;
  crop_name: string;
  supply_location: string;
  demand_location: string;
};

export default function BuyerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  //load bookings when page component is rendered once
  useEffect(() => {
    async function loadBookings() {
      try {
        const response = await fetch("/api/bookings");
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

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="buyer" />

      <section className="dashboard-main">
      <PageHeader
        eyebrow="Buyer bookings"
        title="My booking history"
        description="Track the produce bookings made with farmers"
      />

      <section className="buyer-info-section" aria-labelledby="bookings-heading">
        <div className="buyer-section-heading">
          <h2 id="bookings-heading">Bookings</h2>
          <p>Review every booking made from matched farmer supply.</p>
        </div>

        {isLoading && <p className="section-empty-state">Loading bookings...</p>}
        {error && <p className="error-message">{error}</p>}
        {/*if there is no loading no error and the bookings array is empty show the message*/}
        {!isLoading && !error && bookings.length === 0 && (
          <p className="section-empty-state">No bookings yet. Create one from a matched demand.</p>
        )}

        {!isLoading && !error && bookings.length > 0 && (
          <div className="buyer-info-list">
            {bookings.map((booking) => (
              <article key={booking.id} className="buyer-info-row">
                <div className="buyer-info-primary">
                  <strong>Booking #{booking.id}</strong>
                  <p>Crop: {booking.crop_name}</p>
                  <p>
                    Quantity: {booking.quantity} {booking.unit}
                  </p>
                  <p>Supply location: {booking.supply_location}</p>
                  <p>Demand location: {booking.demand_location}</p>
                </div>

                <div className="buyer-info-side">
                  <dl className="buyer-info-details">
                    <div>
                      <dt>Status</dt>
                      <dd>{booking.status}</dd>
                    </div>
                    <div>
                      <dt>Created</dt>
                      <dd>{booking.created_at}</dd>
                    </div>
                  </dl>
                  <p className="buyer-info-note">Message: {booking.message || "No message"}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
          </section>
    </main>
  );
}

