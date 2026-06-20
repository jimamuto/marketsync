"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginForm = {
  email: string;
  password: string;
};

const roleRoutes = {
  farmer: "/farmer",
  buyer: "/buyer",
  admin: "/admin",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof LoginForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to log in.");
        return;
      }

      setMessage("Logged in successfully.");
      setForm({
        email: "",
        password: "",
      });
      //redirect to the respective role dashboards but fallbacks to home
      router.push(roleRoutes[data.user.role as keyof typeof roleRoutes] ?? "/");
      router.refresh(); //so as to save the session of the user

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Login to your account</h1>
          <p>Enter your email below to login to your account.</p>
        </div>

        <form className="login-card-form" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <p className="form-message form-error">{error}</p>}
          {message && <p className="form-message form-success">{message}</p>}

          <button type="submit" className="login-primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="login-card-footer">
          <Link href="/forgot-password">Forgot password?</Link>
        </p>

        <p className="login-card-footer">
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </p>
      </section>
    </main>
  );
}
