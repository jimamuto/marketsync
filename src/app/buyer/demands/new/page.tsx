"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../../../components/PageHeader";
import DashboardSidebar from "../../../../components/DashboardSidebar";

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

      setMessage("Demand request submitted for administrator review.");
      router.push("/buyer/demands?submitted=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create demand request");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="buyer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="New demand"
          title="Create demand request"
          description="Add what produce your institution needs."
        />

        <section className="buyer-demand-board" aria-labelledby="demand-details-heading">
          <div className="buyer-demand-board-header">
            <div className="buyer-section-heading">
              <p className="wireframe-label">PROCUREMENT DEMAND</p>
              <h2 id="demand-details-heading">Demand details</h2>
              <p>Define exactly what your institution needs so farmer matches stay useful.</p>
            </div>

            <div className="form-planning-note" aria-label="Matching connection note">
              <span>Matching linked</span>
              <p>Crop, quantity, location, and delivery date power farmer match recommendations.</p>
            </div>
          </div>

          <form className="auth-form buyer-form structured-buyer-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Crop requirement</legend>
              <label>
                Crop name
                <input
                  name="cropName"
                  type="text"
                  placeholder="e.g. tomatoes"
                  value={form.cropName}
                  onChange={(event) => updateField("cropName", event.target.value)}
                  required
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Quantity and delivery</legend>
              <div className="form-grid-two">
                <label>
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    placeholder="e.g. 300"
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
              </div>

              <div className="form-grid-two">
                <label>
                  Delivery location
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
                  Required date
                  <input
                    type="date"
                    name="requiredDate"
                    value={form.requiredDate}
                    onChange={(event) => updateField("requiredDate", event.target.value)}
                    required
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Instructions and status</legend>
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
            </fieldset>

            <p className="form-review-note">
              New demand requests are submitted for administrator review before they can be matched or booked.
            </p>

            {message && <p className="success-message form-success-message">{message}</p>}
            {error && <p className="error-message form-error-message">{error}</p>}

            <div className="form-action-box">
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save demand request"}
              </button>
              <Link href="/buyer/demands" className="calendar-log-button form-back-button">
                Back to demands
              </Link>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
