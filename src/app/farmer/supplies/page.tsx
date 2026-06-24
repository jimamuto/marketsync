"use client";

import Link from "next/link";
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

export default function FarmerSuppliesPage() {
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
          throw new Error(data.message || "Failed to load supplies");
        }

        if (active) {
          setSupplies(data.supplies ?? []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load supplies");
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

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Farmer supplies"
          title="My crop supplies"
          description="Manage crops you have planted, harvested, or made available to buyers."
        />

        <div>
          <Link href="/farmer/supplies/new" className="primary-button">
            Add new supply
          </Link>
        </div>

        <DashboardCard title="Supply records">
        {loading ? (
          <p>Loading supplies...</p>
        ) : error ? (
          <p>{error}</p>
        ) : supplies.length === 0 ? (
          <p>No crop supplies yet. Add your first supply to start matching buyers.</p>
        ) : (
          <div className="booking-list">
            {supplies.map((supply) => (
              <article key={supply.id} className="booking-card">
                <div>
                  <strong>{supply.crop_name}</strong>
                  <p>
                    Quantity: {supply.quantity} {supply.unit}
                  </p>
                  <p>Location: {supply.location}</p>
                  <p>Status: {supply.status}</p>
                </div>

                <div className="booking-meta">
                  <p>Variety: {supply.crop_variety || "Not set"}</p>
                  <p>Planting: {formatDate(supply.planting_date)}</p>
                  <p>Harvest: {formatDate(supply.expected_harvest_date)}</p>
                  <Link href={`/farmer/supplies/${supply.id}`} className="secondary-button">
                    View / Edit
                  </Link>
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
