"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {useRouter} from "next/navigation";

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
  const router= useRouter();
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
      const registeredEmail = form.email;

      setMessage(
           data.message ||
             "Account created. Please check your email to verify your account.",
         );


      setForm({
        name: "",
        email: "",
        password: "",
        role: "farmer",
        phone: "",
        location: "",
      });
    router.push(`/check-email?email=${encodeURIComponent(registeredEmail)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // returning the html file and on submit triggers a function
  return (
    <main className="login-card-page">
      <section className="login-card-shell register-card-shell">
        <div className="login-card-header">
          <h1>Create your account</h1>
          <p>Register as a farmer or buyer to start using MarketSync.</p>
        </div>

        <form className="login-card-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ama Farmer"
              required
            />
          </label>

          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="ama@example.com"
              required
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </label>

          <label className="login-field">
            <span>Role</span>
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              required
            >
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </label>

          <label className="login-field">
            <span>Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="0736872381"
            />
          </label>

          <label className="login-field">
            <span>Location</span>
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Nairobi"
            />
          </label>

          {error && <p className="form-message form-error">{error}</p>}
          {message && <p className="form-message form-success">{message}</p>}

          <button type="submit" className="login-primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="login-card-footer">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
