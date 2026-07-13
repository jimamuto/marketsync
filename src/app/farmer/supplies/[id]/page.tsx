"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import DashboardSidebar from "../../../../components/DashboardSidebar";
import PageHeader from "../../../../components/PageHeader";
import ModerationStatus, { type ModerationStatus as ModerationStatusValue } from "../../../../components/ModerationStatus";

type Supply = {
  id: number;
  farmer_id: number;
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
};

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

const emptyForm: FormState = {
  crop_name: "",
  crop_variety: "",
  quantity: "",
  unit: "",
  planting_date: "",
  expected_harvest_date: "",
  location: "",
  status: "planned",
};

function toInputDate(value: string | null | undefined) {
  return value ? String(value).slice(0, 10) : "";
}

export default function FarmerSupplyDetailsPage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const submitted = searchParams.get("submitted") === "1";
  const supplyId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [supply, setSupply] = useState<Supply | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSupply() {
      if (!supplyId) {
        setError("Invalid supply id");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/supplies/${supplyId}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load crop supply");
        }

        if (!active) {
          return;
        }

        setSupply(data.supply);
        setForm({
          crop_name: data.supply.crop_name ?? "",
          crop_variety: data.supply.crop_variety ?? "",
          quantity: String(data.supply.quantity ?? ""),
          unit: data.supply.unit ?? "",
          planting_date: toInputDate(data.supply.planting_date),
          expected_harvest_date: toInputDate(data.supply.expected_harvest_date),
          location: data.supply.location ?? "",
          status: data.supply.status ?? "planned",
        });
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load crop supply");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSupply();

    return () => {
      active = false;
    };
  }, [supplyId]);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supplyId) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/supplies/${supplyId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          crop_name: form.crop_name,
          crop_variety: form.crop_variety || null,
          quantity: Number(form.quantity),
          unit: form.unit,
          planting_date: form.planting_date,
          expected_harvest_date: form.expected_harvest_date,
          location: form.location,
          status: form.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update crop supply");
      }

      setSupply(data.supply);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update crop supply");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!supplyId) {
      return;
    }

    const confirmed = window.confirm("Delete this crop supply?");
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/supplies/${supplyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete crop supply");
      }

      router.push("/farmer/supplies");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete crop supply");
      setSaving(false);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="farmer" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Supply details"
          title={supply ? supply.crop_name : "Crop supply"}
          description="View, edit, or delete a crop supply from the backend."
        />

        <section className="farmer-form-section" aria-labelledby="crop-information-heading">
          <div className="farmer-section-heading">
            <h2 id="crop-information-heading">Crop information</h2>
            <p>Update the supply record buyers and planning tools rely on.</p>
          </div>

          {loading ? (
            <p className="section-empty-state">Loading crop supply...</p>
          ) : error && !supply ? (
            <p className="section-empty-state">{error}</p>
          ) : supply ? (
            <form className="auth-form farmer-form" onSubmit={handleSubmit}>
            <label>
              Crop name
              <input
                value={form.crop_name}
                onChange={(event) => updateField("crop_name", event.target.value)}
                required
              />
            </label>

            <label>
              Crop variety
              <input
                value={form.crop_variety}
                onChange={(event) => updateField("crop_variety", event.target.value)}
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                required
              />
            </label>

            <label>
              Unit
              <input
                value={form.unit}
                onChange={(event) => updateField("unit", event.target.value)}
                required
              />
            </label>

            <label>
              Planting date
              <input
                type="date"
                value={form.planting_date}
                onChange={(event) => updateField("planting_date", event.target.value)}
                required
              />
            </label>

            <label>
              Expected harvest date
              <input
                type="date"
                value={form.expected_harvest_date}
                onChange={(event) => updateField("expected_harvest_date", event.target.value)}
                required
              />
            </label>

            <label>
              Location
              <input
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
                required
              />
            </label>

            <label>
              Status
              <select
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

            <ModerationStatus
              status={supply.moderation_status}
              note={supply.moderation_note}
            />

            <dl className="farmer-record-meta">
              <div>
                <dt>Supply ID</dt>
                <dd>{supply.id}</dd>
              </div>
              <div>
                <dt>Farmer ID</dt>
                <dd>{supply.farmer_id}</dd>
              </div>
            </dl>

            {submitted ? (
              <p className="success-message form-success-message">
                Supply submitted for administrator review. Buyers can match it after approval.
              </p>
            ) : null}
            {error ? <p>{error}</p> : null}

            <div className="farmer-action-row">
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" className="secondary-button" onClick={handleDelete} disabled={saving}>
                Delete supply
              </button>
            </div>
          </form>
        ) : (
            <p className="section-empty-state">Crop supply not found.</p>
          )}
        </section>

        <div>
          <Link href="/farmer/supplies" className="secondary-button">
            Back to supplies
          </Link>
        </div>
      </section>
    </main>
  );
}
