"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import DashboardCard from "../../../../components/DashboardCard";
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

        <DashboardCard title="Crop details">
        <form className="auth-form" onSubmit={handleSubmit}>
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

          {error ? <p>{error}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save crop supply"}
          </button>
        </form>
        </DashboardCard>

        <Link href="/farmer/supplies" className="secondary-button">
          Back to supplies
        </Link>
      </section>
    </main>
  );
}
