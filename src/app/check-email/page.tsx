import Link from "next/link";

type CheckEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function CheckEmailPage({ searchParams }: CheckEmailPageProps) {
  const params = await searchParams;
  const email = params.email;

  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Check your email</h1>

          {email ? (
            <p>
              We sent a verification link to <strong>{email}</strong>. Click the
              link in that email to verify your account and log in automatically.
            </p>
          ) : (
            <p>
              We sent a verification link to your inbox. Click the link in that
              email to verify your account and log in automatically.
            </p>
          )}
        </div>

        <Link href="/login" className="login-primary-button">
          Back to login
        </Link>

        <p className="login-card-footer">
          Already verified? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
