import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Check your email</h1>
          <p>
            If the email address matches an account, we have sent the next steps
            to your inbox.
          </p>
        </div>

        <Link href="/login" className="login-primary-button">
          Back to login
        </Link>

        <p className="login-card-footer">
          Did not receive anything? <Link href="/forgot-password">Try again</Link>
        </p>
      </section>
    </main>
  );
}
