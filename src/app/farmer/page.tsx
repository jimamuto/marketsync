"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardSidebar from "../../components/DashboardSidebar";
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
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Farmer dashboard"
          title="Crop planning dashboard"
          description="Track planting cycles, upcoming harvests, and active buyer bookings."
        />

        <section className="dashboard-overview" aria-label="Farmer dashboard summary">
          {loading ? (
            <p>Loading dashboard summary...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <>
              <div>
                <span>Total supplies</span>
                <strong>{supplies.length}</strong>
              </div>
              <div>
                <span>Ready for market</span>
                <strong>{readySupplies.length}</strong>
              </div>
              <div>
                <span>Pending bookings</span>
                <strong>{pendingBookings.length}</strong>
              </div>
            </>
          )}
        </section>

        <section className="section-title-row">
          <div>
            <h2>Upcoming harvests</h2>
            <p>Review the next crop supplies from your planting calendar.</p>
          </div>
          <Link href="/farmer/supplies/new" className="secondary-button">
            Log new crop
          </Link>
        </section>

        <section className="farmer-info-section" aria-label="Upcoming harvests list">
          {loading ? (
            <p className="section-empty-state">Loading harvest timeline...</p>
          ) : upcomingHarvests.length === 0 ? (
            <p className="section-empty-state">No crop supplies yet. Add your first crop to start tracking harvests.</p>
          ) : (
            <div className="farmer-info-list">
              {upcomingHarvests.map((supply) => (
                <article key={supply.id} className="farmer-info-row">
                  <div className="farmer-info-primary">
                    <strong>{supply.crop_name}</strong>
                    <p>
                      {supply.crop_variety ? `${supply.crop_variety} - ` : ""}
                      {supply.quantity} {supply.unit}
                    </p>
                    <p>Location: {supply.location}</p>
                  </div>

                  <dl className="farmer-info-details">
                    <div>
                      <dt>Planting</dt>
                      <dd>{formatDate(supply.planting_date)}</dd>
                    </div>
                    <div>
                      <dt>Harvest</dt>
                      <dd>{formatDate(supply.expected_harvest_date)}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{supply.status}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section-title-row">
          <div>
            <h2>Recent buyer bookings</h2>
            <p>Track buyer interest, request status, and delivery locations.</p>
          </div>
          <Link href="/farmer/bookings" className="secondary-button">
            Manage bookings
          </Link>
        </section>

        <section className="farmer-info-section" aria-label="Recent buyer bookings list">
          {loading ? (
            <p className="section-empty-state">Loading recent bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="section-empty-state">No bookings yet. Buyers will appear here once they reserve your supply.</p>
          ) : (
            <div className="farmer-info-list">
              {bookings.slice(0, 3).map((booking) => (
                <article key={booking.id} className="farmer-info-row">
                  <div className="farmer-info-primary">
                    <strong>Booking #{booking.id}</strong>
                    <p>Buyer ID: {booking.buyer_id}</p>
                    <p>Crop: {booking.crop_name}</p>
                    <p>
                      Quantity: {booking.quantity} {booking.unit}
                    </p>
                  </div>

                  <dl className="farmer-info-details">
                    <div>
                      <dt>Status</dt>
                      <dd>{booking.status}</dd>
                    </div>
                    <div>
                      <dt>Supply location</dt>
                      <dd>{booking.supply_location}</dd>
                    </div>
                    <div>
                      <dt>Demand location</dt>
                      <dd>{booking.demand_location}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
