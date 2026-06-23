"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardCard from "../../../../components/DashboardCard";
import PageHeader from "../../../../components/PageHeader";

export default function NewBuyerDemandPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    cropName: "",
    quantity: "",
    unit: "",
    location: "",
    requiredDate: "",
    notes: "",
    status: "open",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create demand request");
      }

      setMessage("Demand request created successfully.");
      router.push("/buyer/demands");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create demand request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dashboard-page">
      <PageHeader
        eyebrow="New demand"
        title="Create demand request"
        description="Add what produce your institution needs"
      />

      <DashboardCard title="Demand details">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Crop Name
            <input
              name="cropName"
              type="text"
              placeholder="e.g tomatoes"
              value={form.cropName}
              onChange={(event) => updateField("cropName", event.target.value)}
              required
            />
          </label>

          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              placeholder="e.g 300"
              value={form.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              required
            />
          </label>

          <label>
            Unit
            <select
              name="unit"
              value={form.unit}
              onChange={(event) => updateField("unit", event.target.value)}
              required
            >
              <option value="">Select unit</option>
              <option value="kgs">KGS</option>
              <option value="bags">Bags</option>
              <option value="crates">Crates</option>
              <option value="tons">Tons</option>
            </select>
          </label>

          <label>
            Delivery Location
            <input
              name="location"
              type="text"
              placeholder="Nairobi"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              required
            />
          </label>

          <label>
            Required Date
            <input
              type="date"
              name="requiredDate"
              value={form.requiredDate}
              onChange={(event) => updateField("requiredDate", event.target.value)}
              required
            />
          </label>

          <label>
            Notes
            <input
              name="notes"
              type="text"
              placeholder="Any delivery instructions"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
            >
              <option value="open">Open</option>
              <option value="matched">Matched</option>
              <option value="booked">Booked</option>
              <option value="cancelled">Cancelled</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </label>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save demand request"}
          </button>
        </form>
      </DashboardCard>

      <Link href="/buyer/demands" className="secondary-button">
        Back to demands
      </Link>
    </main>
  );
}
