"use client";

import { useEffect, useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
import DashboardSidebar from "../../../components/DashboardSidebar";
import PageHeader from "../../../components/PageHeader";

type Booking = {
  id: number;
  buyer_id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  status: string;
  message: string | null;
  created_at: string;
  supply_location: string;
  demand_location: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FarmerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [busyBookingId, setBusyBookingId] = useState<number | null>(null);

  async function loadBookings() {
    const response = await fetch("/api/bookings", {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load bookings");
    }

    setBookings(data.bookings ?? []);
  }

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        await loadBookings();
      } catch (loadError) {
        if (active) {
          setActionError(loadError instanceof Error ? loadError.message : "Failed to load bookings");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      active = false;
    };
  }, []);

  async function updateBookingStatus(bookingId: number, status: "accepted" | "rejected") {
    setBusyBookingId(bookingId);
    setActionError("");

    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update booking");
      }

      await loadBookings();
    } catch (updateError) {
      setActionError(updateError instanceof Error ? updateError.message : "Failed to update booking");
    } finally {
      setBusyBookingId(null);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Farmer bookings"
          title="Buyer booking requests"
          description="Review buyer requests for your crop supplies."
        />

        <DashboardCard title="Booking requests">
        {loading ? (
          <p>Loading bookings...</p>
        ) : actionError ? (
          <p>{actionError}</p>
        ) : bookings.length === 0 ? (
          <p>No booking requests yet. Buyers will appear here once they place a booking.</p>
        ) : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article key={booking.id} className="booking-card">
                <div>
                  <strong>Booking #{booking.id}</strong>
                  <p>Buyer ID: {booking.buyer_id}</p>
                  <p>Crop: {booking.crop_name}</p>
                  <p>
                    Quantity: {booking.quantity} {booking.unit}
                  </p>
                  <p>Status: {booking.status}</p>
                </div>

                <div className="booking-meta">
                  <p>Created: {formatDate(booking.created_at)}</p>
                  <p>Supply location: {booking.supply_location}</p>
                  <p>Demand location: {booking.demand_location}</p>
                  {booking.message ? <p>Message: {booking.message}</p> : null}

                  {booking.status === "pending" ? (
                    <>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "accepted")}
                        disabled={busyBookingId === booking.id}
                      >
                        Accept
                      </button>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => updateBookingStatus(booking.id, "rejected")}
                        disabled={busyBookingId === booking.id}
                      >
                        Reject
                      </button>
                    </>
                  ) : null}
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
