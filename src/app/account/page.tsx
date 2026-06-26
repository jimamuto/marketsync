import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardCard from "../../components/DashboardCard";
import PageHeader from "../../components/PageHeader";
import { getDb } from "../../lib/database";

type AccountUser = {
  name: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) {
    redirect("/login");
  }

  const result = await getDb().query<AccountUser>(
    `select name, email, role, phone, location
     from users
     where id = $1
     limit 1`,
    [Number(userId)],
  );

  const user = result.rows[0];

  if (!user) {
    redirect("/login");
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="account-page">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Review your MarketSync profile details and manage your account settings."
      />

      <section className="account-layout">
        <DashboardCard className="account-profile-card">
          <div className="account-profile-heading">
            <div className="account-avatar-large" aria-hidden="true">
              {initials || "U"}
            </div>
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className="status-pill">{user.role}</span>
            </div>
          </div>

          <dl className="account-details">
            <div>
              <dt>Phone</dt>
              <dd>{user.phone || "Not added yet"}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{user.location || "Not added yet"}</dd>
            </div>
          </dl>
        </DashboardCard>

        <DashboardCard title="Account actions">
          <div className="account-action-list">
            <Link href="/account/settings" className="primary-button account-action-link">
              Edit profile settings
            </Link>
            <Link href="/" className="secondary-button account-action-link">
              Back to home
            </Link>
          </div>
        </DashboardCard>
      </section>
    </main>
  );
}
