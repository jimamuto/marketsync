"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
};

export default function AccountSettingsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", location: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load account");
        }

        if (!active) {
          return;
        }

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          location: data.user.location || "",
        });
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load account");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, []);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update account");
      }

      setUser(data.user);
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        location: data.user.location || "",
      });
      setMessage("Account settings updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update account");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="account-page">
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Update your profile name, phone number, and location."
      />

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <section className="account-layout">
        <DashboardCard title="Profile details">
          {isLoading ? (
            <p>Loading account settings...</p>
          ) : (
            <form className="demand-form" onSubmit={submitSettings}>
              <label>
                Full name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </label>

              <label>
                Email
                <input type="email" value={user?.email || ""} disabled />
              </label>

              <label>
                Role
                <input type="text" value={user?.role || ""} disabled />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="0712 345 678"
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Nairobi, Kenya"
                />
              </label>

              <button className="primary-button" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save settings"}
              </button>
            </form>
          )}
        </DashboardCard>

        <DashboardCard title="Profile preview">
          <p>These details appear in your MarketSync account profile.</p>
          <div className="account-preview-card">
            <strong>{form.name || "Your name"}</strong>
            <span>{user?.email || "Email"}</span>
            <span>{form.phone || "Phone not added"}</span>
            <span>{form.location || "Location not added"}</span>
          </div>
          <Link href="/account" className="secondary-button account-action-link">
            View profile
          </Link>
        </DashboardCard>
      </section>
    </main>
  );
}
