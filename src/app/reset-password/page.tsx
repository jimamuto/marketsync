"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {useRouter} from "next/navigation";

export default function ResetPasswordPage() {

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setMessage("Your password has been reset. You can now log in.");

    router.push("/login");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Reset password</h1>
          <p>Create a new password for your MarketSync account.</p>
        </div>

        <form className="login-card-form" onSubmit={handleSubmit}>
          <label className="login-field">
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              required
            />
          </label>

          <label className="login-field">
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <button type="submit" className="login-primary-button">
            Reset password
          </button>
        </form>

        <p className="login-card-footer">
          Back to <Link href="/login">login</Link>
        </p>
      </section>
    </main>
  );
}
