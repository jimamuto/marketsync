"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  location: string | null;
  email_verified_at: string | null;
  account_status: "active" | "suspended";
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch("/api/admin/users");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load users");
        }

        setUsers(data.users || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function updateAccountStatus(userId: number, accountStatus: "active" | "suspended") {
    setUpdatingId(userId);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_status: accountStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user account");
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, account_status: data.user.account_status } : user,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user account");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin Trust and Safety"
          title="Users"
          description="Verify marketplace accounts and keep access limited to active, trusted participants."
        />

        <section className="admin-info-section" aria-labelledby="admin-users-heading">
          <div className="admin-section-heading">
            <h2 id="admin-users-heading">Account directory</h2>
            <p>Suspending an account prevents future login and notifies the affected user.</p>
          </div>

          {isLoading && <p className="section-empty-state">Loading users...</p>}
          {error && <p className="error-message">{error}</p>}
          {!isLoading && !error && users.length === 0 && <p className="section-empty-state">No users found.</p>}

          {!isLoading && !error && users.length > 0 && (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Verification</th>
                    <th>Account</th>
                    <th>Admin action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.location || "N/A"}</td>
                      <td>
                        <span className={`status-pill ${user.email_verified_at ? "status-pill--approved" : "status-pill--pending"}`}>
                          {user.email_verified_at ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td><span className={`status-pill status-pill--${user.account_status}`}>{user.account_status}</span></td>
                      <td>
                        {user.role === "admin" ? (
                          <span className="table-muted">Protected</span>
                        ) : (
                          <button
                            type="button"
                            className={`table-button ${user.account_status === "active" ? "table-button--danger" : "table-button--positive"}`}
                            disabled={updatingId === user.id}
                            onClick={() => updateAccountStatus(user.id, user.account_status === "active" ? "suspended" : "active")}
                          >
                            {updatingId === user.id
                              ? "Saving..."
                              : user.account_status === "active" ? "Suspend" : "Reactivate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
