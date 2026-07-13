"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardSidebar from "../../../components/DashboardSidebar";
import PageHeader from "../../../components/PageHeader";
import ModerationStatus, { type ModerationStatus as ModerationStatusValue } from "../../../components/ModerationStatus";

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
  moderation_status: ModerationStatusValue;
  moderation_note: string | null;
}

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

        <section className="farmer-info-section" aria-label="Supply records">
          {loading ? (
            <p className="section-empty-state">Loading supplies...</p>
          ) : error ? (
            <p className="section-empty-state">{error}</p>
          ) : supplies.length === 0 ? (
            <p className="section-empty-state">No crop supplies yet. Add your first supply to start matching buyers.</p>
          ) : (
            <div className="farmer-info-list">
              {supplies.map((supply) => (
                <article key={supply.id} className="farmer-info-row">
                  <div className="farmer-info-primary">
                    <strong>{supply.crop_name}</strong>
                    <p>
                      Quantity: {supply.quantity} {supply.unit}
                    </p>
                    <p>Location: {supply.location}</p>
                    <p>Business status: {supply.status}</p>
                    <ModerationStatus
                      status={supply.moderation_status}
                      note={supply.moderation_note}
                    />
                  </div>

                  <div className="farmer-info-side">
                    <dl className="farmer-info-details">
                      <div>
                        <dt>Variety</dt>
                        <dd>{supply.crop_variety || "Not set"}</dd>
                      </div>
                      <div>
                        <dt>Planting</dt>
                        <dd>{formatDate(supply.planting_date)}</dd>
                      </div>
                      <div>
                        <dt>Harvest</dt>
                        <dd>{formatDate(supply.expected_harvest_date)}</dd>
                      </div>
                    </dl>
                    <div className="farmer-action-row">
                      <Link href={`/farmer/supplies/${supply.id}`} className="secondary-button">
                        View / Edit
                      </Link>
                    </div>
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
