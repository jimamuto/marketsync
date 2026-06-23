"use client";
//shows buyers booking history

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";

type Demand = {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  location: string;
  required_date: string;
  status: string;
};

type Booking = {
  id: number;
  quantity: number;
  unit: string;
  status: string;
  created_at: string;
  crop_name: string;
  demand_location: string;
};

export default function BuyerPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    unit: "kgs",
    location: "",
    requiredDate: "",
    notes: "",
  });

  async function loadDashboardData() {
    setIsLoading(true);
    setError("");

    try {
      const [demandsResponse, bookingsResponse] = await Promise.all([
        fetch("/api/demands"), //get buyers demand requests
        fetch("/api/bookings"), //get buyers bookings
      ]);

      const demandsData = await demandsResponse.json();
      const bookingsData = await bookingsResponse.json();

      if (!demandsResponse.ok) {
        throw new Error(demandsData.message || "Failed to load demands");
      }

      if (!bookingsResponse.ok) {
        throw new Error(bookingsData.message || "Failed to load bookings");
      }

//add fetched demands and bookings into the arrays
      setDemands(demandsData.demands || []);
      setBookings(bookingsData.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }
//load dashboard data when component is rendered only once
  useEffect(() => {
    loadDashboardData();
  }, []);
//updates one field in the form and keeps the rest of the fields using ...current
  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitDemand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); //prevent browser refresh when form is submitted
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: form.cropName,
          quantity: Number(form.quantity),
          unit: form.unit,
          location: form.location,
          requiredDate: form.requiredDate,
          notes: form.notes,
          status: "open",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit demand");
      }

      setMessage("Demand submitted successfully.");
      setForm({
        cropName: "",
        quantity: "",
        unit: "kgs",
        location: "",
        requiredDate: "",
        notes: "",
      });

      await loadDashboardData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit demand");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Institutional Buyer"
        title="Procurement Demand Dashboard"
        description="Submit demand, review matched harvest listings, and track procurement history"
      />

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <section className="buyer-layout">
        <DashboardCard title="Submit procurement demand">
          <form className="demand-form" onSubmit={submitDemand}>
            <label>
              Crop Required
              <input
                type="text"
                placeholder="Irish potatoes"
                value={form.cropName}
                onChange={(event) => updateField("cropName", event.target.value)}
                required
              />
            </label>

            <label>
              Demand Quantity
              <input
                type="number"
                placeholder="1200"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                required
              />
            </label>

            <label>
              Unit
              <select value={form.unit} onChange={(event) => updateField("unit", event.target.value)}>
                <option value="kgs">KGS</option>
                <option value="bags">Bags</option>
                <option value="crates">Crates</option>
                <option value="tons">Tons</option>
              </select>
            </label>

            <label>
              Delivery Location
              <input
                type="text"
                placeholder="Nairobi"
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                required
              />
            </label>

            <label>
              Target Delivery Window
              <input
                type="date"
                value={form.requiredDate}
                onChange={(event) => updateField("requiredDate", event.target.value)}
                required
              />
            </label>

            <label>
              Special Delivery Instructions
              <textarea
                placeholder="Must be packaged in 50kg bags"
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>

            <button className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Requirements"}
            </button>
          </form>
        </DashboardCard>

        <DashboardCard title="Recent Demand Requests">
          {isLoading && <p>Loading demands...</p>}
          {!isLoading && demands.length === 0 && <p>No demand requests yet.</p>}

          {!isLoading && demands.length > 0 && (
            <div className="match-grid">
              {demands.slice(0, 3).map((demand) => (
                <article key={demand.id} className="match-card">
                  <div className="match-card-content">
                    <p>
                      <strong>Crop:</strong> {demand.crop_name}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {demand.quantity} {demand.unit}
                    </p>
                    <p>
                      <strong>Location:</strong> {demand.location}
                    </p>
                    <p>
                      <strong>Status:</strong> {demand.status}
                    </p>
                  </div>

                  <Link href={`/buyer/demands/${demand.id}/matches`} className="secondary-button">
                    View Matches
                  </Link>
                </article>
              ))}
            </div>
          )}
        </DashboardCard>
      </section>

      <DashboardCard title="Procurement History & Delivery Schedule">
        {isLoading && <p>Loading procurement history...</p>}
        {!isLoading && bookings.length === 0 && <p>No bookings yet.</p>}

        {!isLoading && bookings.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((item) => (
                  <tr key={item.id}>
                    <td>#{item.id}</td>
                    <td>{item.crop_name}</td>
                    <td>
                      {item.quantity} {item.unit}
                    </td>
                    <td>
                      <span className="status-pill">{item.status}</span>
                    </td>
                    <td>{item.demand_location}</td>
                    <td>{item.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </main>
  );
}
