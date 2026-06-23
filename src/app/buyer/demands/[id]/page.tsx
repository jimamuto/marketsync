"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DashboardCard from "../../../../components/DashboardCard";
import PageHeader from "../../../../components/PageHeader";

type Demand = {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  location: string;
  required_date: string;
  status: string;
  notes: string | null;
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
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Demand details"
        title={demand ? demand.crop_name : "Demand request"}
        description="View demand request details from the backend API"
      />

      <DashboardCard title="Demand information">
        {isLoading && <p>Loading demand details...</p>}
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        {!isLoading && !error && !demand && <p>Demand request not found.</p>}

        {!isLoading && !error && demand && (
          <div className="booking-list">
            <article className="booking-card">
              <div>
                <strong>{demand.crop_name}</strong>
                <p>
                  Quantity: {demand.quantity} {demand.unit}
                </p>
                <p>Delivery location: {demand.location}</p>
                <p>Status: {demand.status}</p>
              </div>

              <div className="booking-meta">
                <p>Required: {demand.required_date}</p>
                <p>Notes: {demand.notes || "No notes added"}</p>
              </div>
            </article>
          </div>
        )}
      </DashboardCard>

      {demand && (
        <div>
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
          <Link href="/buyer/demands" className="secondary-button">
            Back to demands
          </Link>
        </div>
      )}
    </main>
  );
}
