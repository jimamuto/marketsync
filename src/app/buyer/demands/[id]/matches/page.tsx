"use client";
//shows matching farmer supplies from one demand
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; //reads route parameters from the url
import Link from "next/link";
import DashboardCard from "../../../../../components/DashboardCard";
import PageHeader from "../../../../../components/PageHeader";

type Demand = {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  location: string;
  required_date: string;
};

type Match = {
  id: number;
  crop_name: string;
  crop_variety: string | null;
  quantity: number;
  unit: string;
  location: string;
  expected_harvest_date: string;
  status: string;
  match_score: number;
  match_reasons: string[];
  harvest_gap_days: number;
};

export default function BuyerDemandMatchesPage() {
  const params = useParams<{ id: string }>();
  const [demand, setDemand] = useState<Demand | null>(null);//state for demand details but is null because api isnt loaded yet
  const [matches, setMatches] = useState<Match[]>([]); //set empty array for matches
  const [isLoading, setIsLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null); //tracks which match is creating a booking
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  //loads matches when the component is rendered
  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch(`/api/demands/${params.id}/matches`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load matches");
        }

        setDemand(data.demand);
        setMatches(data.matches || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load matches");
      } finally {
        setIsLoading(false);
      }
    }

    loadMatches();
  }, [params.id]); //runs effect when params.id changes to load new matches

  async function createBooking(match: Match) {
    if (!demand) {
      return;
    }

    setBookingId(match.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplyId: match.id,
          demandRequestId: demand.id,
          quantity: Math.min(Number(match.quantity), Number(demand.quantity)),
          unit: demand.unit,
          message: "Buyer requested booking from matched supply.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      setMessage("Booking created successfully. Check your bookings page.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setBookingId(null);
    }
  }

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Demand matches"
        title={demand ? `Matches for ${demand.crop_name}` : "Demand matches"}
        description="View farmer supplies that may satisfy this demand request"
      />

      <DashboardCard title="Matched farmer supplies">
        {isLoading && <p>Loading matches...</p>}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        {!isLoading && !error && matches.length === 0 && <p>No matches found for this demand yet.</p>}

        {!isLoading && !error && matches.length > 0 && (
          <div className="booking-list">
            {matches.map((match) => (
              <article key={match.id} className="booking-card">
                <div>
                  <strong>{match.crop_name}</strong>
                  <p>
                    Available quantity: {match.quantity} {match.unit}
                  </p>
                  <p>Location: {match.location}</p>
                  <p>Status: {match.status}</p>
                </div>

                <div className="booking-meta">
                  <p>Harvest: {match.expected_harvest_date}</p>
                  <p>Match score: {match.match_score}</p>
                  <p>Harvest gap: {match.harvest_gap_days} days</p>
                  <p>Reason: {match.match_reasons.join(", ")}</p>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => createBooking(match)}
                    disabled={bookingId === match.id}
                  >
                    {bookingId === match.id ? "Creating..." : "Create booking"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </DashboardCard>

      <Link href={`/buyer/demands/${params.id}`} className="secondary-button">
        Back to demand
      </Link>
    </main>
  );
}
