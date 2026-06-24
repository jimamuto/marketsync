"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
      <PageHeader eyebrow="Admin" title="Bookings" description="View all buyer and farmer booking activity" />

      <DashboardCard title="Bookings">
        {isLoading && <p>Loading bookings...</p>}
        {error && <p className="error-message">{error}</p>}
        {!isLoading && !error && bookings.length === 0 && <p>No bookings found.</p>}

        {!isLoading && !error && bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.buyer_name}</td>
                    <td>{booking.farmer_name}</td>
                    <td>{booking.crop_name}</td>
                    <td>{booking.quantity} {booking.unit}</td>
                    <td>{booking.status}</td>
                    <td>{booking.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

          </section>
    </main>
  );
}
