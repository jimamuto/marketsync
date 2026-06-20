"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(
      "If an account exists with this email, password reset instructions will be sent.",
    );
  }

  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Forgot password</h1>
          <p>Enter your email and we will send password reset instructions.</p>
        </div>

        <form className="login-card-form" onSubmit={handleSubmit}>
          <label className="login-field">
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          {message && <p className="form-success">{message}</p>}

          <button type="submit" className="login-primary-button">
            Send reset instructions
          </button>
        </form>

        <p className="login-card-footer">
          Remember your password? <Link href="/login">Back to login</Link>
        </p>
      </section>
    </main>
  );
}
