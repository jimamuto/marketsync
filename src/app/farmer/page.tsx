"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardCard from "../../components/DashboardCard";
import PageHeader from "../../components/PageHeader";

type SupplySummary = {
  id: number;
  crop_name: string;
  crop_variety: string | null;
  quantity: number;
  unit: string;
  planting_date: string;
  expected_harvest_date: string;
  location: string;
  status: string;
};

type BookingSummary = {
  id: number;
  buyer_id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  status: string;
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

export default function FarmerPage() {
  const [supplies, setSupplies] = useState<SupplySummary[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [suppliesResponse, bookingsResponse] = await Promise.all([
          fetch("/api/supplies", { credentials: "include" }),
          fetch("/api/bookings", { credentials: "include" }),
        ]);

        const suppliesData = await suppliesResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (!suppliesResponse.ok) {
          throw new Error(suppliesData.message || "Failed to load supplies");
        }

        if (!bookingsResponse.ok) {
          throw new Error(bookingsData.message || "Failed to load bookings");
        }

        if (!active) {
          return;
        }

        setSupplies(suppliesData.supplies ?? []);
        setBookings(bookingsData.bookings ?? []);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const readySupplies = supplies.filter((supply) => supply.status === "ready");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const upcomingHarvests = [...supplies]
    .sort((left, right) => left.expected_harvest_date.localeCompare(right.expected_harvest_date))
    .slice(0, 3);

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Farmer dashboard"
        title="Crop planning dashboard"
        description="Track planting cycles, upcoming harvests, and active buyer bookings."
      />

      <section className="dashboard-grid">
        <DashboardCard title="Quick actions">
          <div className="booking-meta">
            <Link href="/farmer/supplies/new" className="primary-button">
              Log new crop
            </Link>
            <Link href="/farmer/supplies" className="secondary-button">
              View supplies
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard title="Supply summary">
          {loading ? (
            <p>Loading supply data...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              <p>Total supplies: {supplies.length}</p>
              <p>Ready for market: {readySupplies.length}</p>
              <p>Upcoming harvests: {upcomingHarvests.length}</p>
            </>
          )}
        </DashboardCard>

        <DashboardCard title="Booking summary">
          {loading ? (
            <p>Loading booking data...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              <p>Total bookings: {bookings.length}</p>
              <p>Pending requests: {pendingBookings.length}</p>
              <Link href="/farmer/bookings" className="secondary-button">
                Manage bookings
              </Link>
            </>
          )}
        </DashboardCard>
      </section>

      <DashboardCard title="Upcoming harvests">
        {loading ? (
          <p>Loading harvest timeline...</p>
        ) : upcomingHarvests.length === 0 ? (
          <p>No crop supplies yet. Add your first crop to start tracking harvests.</p>
        ) : (
          <div className="booking-list">
            {upcomingHarvests.map((supply) => (
              <article key={supply.id} className="booking-card">
                <div>
                  <strong>{supply.crop_name}</strong>
                  <p>
                    {supply.crop_variety ? `${supply.crop_variety} - ` : ""}
                    {supply.quantity} {supply.unit}
                  </p>
                  <p>Location: {supply.location}</p>
                </div>

                <div className="booking-meta">
                  <p>Planting: {formatDate(supply.planting_date)}</p>
                  <p>Harvest: {formatDate(supply.expected_harvest_date)}</p>
                  <p>Status: {supply.status}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title="Recent buyer bookings">
        {loading ? (
          <p>Loading recent bookings...</p>
        ) : bookings.length === 0 ? (
          <p>No bookings yet. Buyers will appear here once they reserve your supply.</p>
        ) : (
          <div className="booking-list">
            {bookings.slice(0, 3).map((booking) => (
              <article key={booking.id} className="booking-card">
                <div>
                  <strong>Booking #{booking.id}</strong>
                  <p>Buyer ID: {booking.buyer_id}</p>
                  <p>Crop: {booking.crop_name}</p>
                  <p>
                    Quantity: {booking.quantity} {booking.unit}
                  </p>
                </div>

                <div className="booking-meta">
                  <p>Status: {booking.status}</p>
                  <p>Supply location: {booking.supply_location}</p>
                  <p>Demand location: {booking.demand_location}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardCard>
    </main>
  );
}
