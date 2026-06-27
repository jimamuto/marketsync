"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import DashboardSidebar from "../../../../components/DashboardSidebar";
import PageHeader from "../../../../components/PageHeader";

type FormState = {
  crop_name: string;
  crop_variety: string;
  quantity: string;
  unit: string;
  planting_date: string;
  expected_harvest_date: string;
  location: string;
  status: string;
};

const initialState: FormState = {
  crop_name: "",
  crop_variety: "",
  quantity: "",
  unit: "",
  planting_date: "",
  expected_harvest_date: "",
  location: "",
  status: "planned",
};

export default function NewFarmerSupplyPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/supplies", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create crop supply");
      }

      const supplyId = data.supply?.id;
      setForm(initialState);
      router.push(supplyId ? `/farmer/supplies/${supplyId}` : "/farmer/supplies");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create crop supply");
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="New crop supply"
          title="Log a new crop"
          description="Add crop details and save them to the supply table."
        />

        <section className="farmer-form-board" aria-labelledby="crop-details-heading">
          <div className="farmer-form-board-header">
            <div className="farmer-section-heading">
              <p className="wireframe-label">CROP SUPPLY RECORD</p>
              <h2 id="crop-details-heading">Crop details</h2>
              <p>Keep the record specific enough for matching, harvest planning, and buyer confidence.</p>
            </div>

            <div className="form-planning-note" aria-label="Calendar connection note">
              <span>Calendar linked</span>
              <p>Planting and harvest dates appear automatically on the crop planning calendar.</p>
            </div>
          </div>

          <form className="auth-form farmer-form structured-farmer-form" onSubmit={handleSubmit}>
            <fieldset>
              <legend>Crop identity</legend>
              <div className="form-grid-two">
                <label>
                  Crop name
                  <input
                    name="crop_name"
                    type="text"
                    value={form.crop_name}
                    onChange={(event) => updateField("crop_name", event.target.value)}
                    placeholder="e.g. Tomatoes"
                    required
                  />
                </label>

                <label>
                  Crop variety
                  <input
                    name="crop_variety"
                    type="text"
                    value={form.crop_variety}
                    onChange={(event) => updateField("crop_variety", event.target.value)}
                    placeholder="e.g. Roma"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Quantity and location</legend>
              <div className="form-grid-two">
                <label>
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) => updateField("quantity", event.target.value)}
                    placeholder="e.g. 200"
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
                    <option value="kg">Kilograms</option>
                    <option value="bags">Bags</option>
                    <option value="crates">Crates</option>
                    <option value="tonnes">Tonnes</option>
                  </select>
                </label>
              </div>

              <label>
                Location
                <input
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Nairobi"
                  required
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Calendar schedule</legend>
              <div className="form-grid-two">
                <label>
                  Planting date
                  <input
                    type="date"
                    name="planting_date"
                    value={form.planting_date}
                    onChange={(event) => updateField("planting_date", event.target.value)}
                    required
                  />
                </label>

                <label>
                  Expected harvest date
                  <input
                    type="date"
                    name="expected_harvest_date"
                    value={form.expected_harvest_date}
                    onChange={(event) => updateField("expected_harvest_date", event.target.value)}
                    required
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Supply status</legend>
              <label>
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  <option value="planned">Planned</option>
                  <option value="growing">Growing</option>
                  <option value="ready">Ready</option>
                  <option value="booked">Booked</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </fieldset>

            {error ? <p className="form-error-message">{error}</p> : null}

            <div className="form-action-box">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save crop supply"}
              </button>
              <Link href="/farmer/supplies" className="calendar-log-button form-back-button">
                Back to supplies
              </Link>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
