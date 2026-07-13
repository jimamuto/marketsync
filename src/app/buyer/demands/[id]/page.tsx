"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../../../components/PageHeader";
import DashboardSidebar from "../../../../components/DashboardSidebar";
import ModerationStatus, { type ModerationStatus as ModerationStatusValue } from "../../../../components/ModerationStatus";

type Demand = {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  location: string;
  required_date: string;
  status: string;
  notes: string | null;
  moderation_status: ModerationStatusValue;
  moderation_note: string | null;
};

export default function BuyerDemandDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [demand, setDemand] = useState<Demand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDemand() {
      try {
        const response = await fetch(`/api/demands/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load demand");
        }

        setDemand(data.demand);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load demand");
      } finally {
        setIsLoading(false);
      }
    }

    loadDemand();
  }, [params.id]);

  async function deleteDemand() {
    const confirmed = window.confirm("Are you sure you want to delete this demand request?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/demands/${params.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete demand");
      }

      setMessage("Demand deleted successfully.");
      router.push("/buyer/demands");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete demand");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="buyer" />

      <section className="dashboard-main">
      <PageHeader
        eyebrow="Demand details"
        title={demand ? demand.crop_name : "Demand request"}
        description="View demand request details from the backend API"
      />

      <section className="buyer-info-section" aria-labelledby="demand-information-heading">
        <div className="buyer-section-heading">
          <h2 id="demand-information-heading">Demand information</h2>
          <p>Confirm request details before matching or deletion.</p>
        </div>

        {isLoading && <p className="section-empty-state">Loading demand details...</p>}
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        {!isLoading && !error && !demand && <p className="section-empty-state">Demand request not found.</p>}

        {!isLoading && !error && demand && (
          <div className="buyer-info-list">
            <article className="buyer-info-row">
              <div className="buyer-info-primary">
                <strong>{demand.crop_name}</strong>
                <p>
                  Quantity: {demand.quantity} {demand.unit}
                </p>
                <p>Delivery location: {demand.location}</p>
              </div>

              <div className="buyer-info-side">
                <dl className="buyer-info-details">
                  <div>
                    <dt>Business status</dt>
                    <dd>{demand.status}</dd>
                  </div>
                  <div>
                    <dt>Required</dt>
                    <dd>{demand.required_date}</dd>
                  </div>
                </dl>
                <ModerationStatus
                  status={demand.moderation_status}
                  note={demand.moderation_note}
                />
                <p className="buyer-info-note">Notes: {demand.notes || "No notes added"}</p>
              </div>
            </article>
          </div>
        )}
      </section>

      {demand && (
        <div className="buyer-action-row">
          <Link href={`/buyer/demands/${demand.id}/matches`} className="primary-button">
            Find Matches
          </Link>
          <button
            type="button"
            className="secondary-button"
            onClick={deleteDemand}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete demand"}
          </button>
        </div>
      )}
          </section>
    </main>
  );
}
