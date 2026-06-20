import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Access denied</h1>
          <p>
            You do not have permission to view this page. Please log in with the
            correct account type.
          </p>
        </div>

        <Link href="/login" className="login-primary-button">
          Go to login
        </Link>

        <p className="login-card-footer">
          Need a new account? <Link href="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
