"use client";

import { useEffect, useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
import DashboardSidebar from "../../../components/DashboardSidebar";
import PageHeader from "../../../components/PageHeader";

type Supply = {
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FarmerCalendarPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSupplies() {
      try {
        const response = await fetch("/api/supplies", {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load calendar data");
        }

        if (active) {
          setSupplies(data.supplies ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load calendar data");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSupplies();

    return () => {
      active = false;
    };
  }, []);

  const timeline = [...supplies].sort((left, right) =>
    left.expected_harvest_date.localeCompare(right.expected_harvest_date),
  );

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Crop calendar"
          title="Harvest timeline"
          description="Track planting and harvest dates for your crop supplies."
        />

        <DashboardCard title="Upcoming crop activities">
        {loading ? (
          <p>Loading crop timeline...</p>
        ) : error ? (
          <p>{error}</p>
        ) : timeline.length === 0 ? (
          <p>No crop supplies yet. Create a supply record to see the calendar timeline.</p>
        ) : (
          <div className="booking-list">
            {timeline.map((item) => (
              <article key={item.id} className="booking-card">
                <div>
                  <strong>{item.crop_name}</strong>
                  <p>
                    {item.crop_variety ? `${item.crop_variety} - ` : ""}
                    {item.quantity} {item.unit}
                  </p>
                  <p>Location: {item.location}</p>
                </div>

                <div className="booking-meta">
                  <p>Planting: {formatDate(item.planting_date)}</p>
                  <p>Harvest: {formatDate(item.expected_harvest_date)}</p>
                  <p>Status: {item.status}</p>
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
