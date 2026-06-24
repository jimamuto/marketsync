//booking page
"use client";

import { useEffect, useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
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

      <DashboardCard title="Bookings">
        {isLoading && <p>Loading bookings...</p>}
        {error && <p className="error-message">{error}</p>}
        {/*if there is no loading no error and the bookings array is empty show the message*/}
        {!isLoading && !error && bookings.length === 0 && (
          <p>No bookings yet. Create one from a matched demand.</p>
        )}

        {!isLoading && !error && bookings.length > 0 && (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <div>
                  <strong>Booking #{booking.id}</strong>
                  <p>Crop: {booking.crop_name}</p>
                  <p>
                    Quantity: {booking.quantity} {booking.unit}
                  </p>
                  <p>Supply location: {booking.supply_location}</p>
                  <p>Demand location: {booking.demand_location}</p>
                </div>

                <div className="booking-meta">
                  <p>Status: {booking.status}</p>
                  <p>Created: {booking.created_at}</p>
                  <p>Message: {booking.message || "No message"}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardCard>
          </section>
    </main>
  );
}

