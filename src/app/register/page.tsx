"use client";

import { FormEvent, useState } from "react";

// creating template for Form with custom type RegisterForm
type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: "farmer" | "buyer" | "admin";
  phone: string;
  location: string;
};

// creation of page with states of the form
export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "farmer",
    phone: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof RegisterForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stops default behaviour of website refreshing to keep data

    setMessage("");
    setError("");
    setIsSubmitting(true);

    // extract data from the register api
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      // 200 = ok
      if (!response.ok) {
        setError(data.message || "Failed to register user.");
        return;
      }

      setMessage("Account created successfully. You can now log in.");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "farmer",
        phone: "",
        location: "",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // returning the html file and on submit triggers a function
  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Create account</p>
        <h1>Join MarketSync</h1>
        <p className="auth-intro">
          Register as a farmer, buyer, or admin to start using the marketplace.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ama Farmer"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="ama@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              required
            >
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="0240000000"
            />
          </label>

          <label>
            Location
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Kumasi"
            />
          </label>

          {error && <p className="form-message form-error">{error}</p>}
          {message && <p className="form-message form-success">{message}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
