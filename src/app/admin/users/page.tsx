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
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
      <PageHeader eyebrow="Admin" title="Users" description="View registered farmers, buyers, and admins" />

      <section className="admin-info-section" aria-labelledby="admin-users-heading">

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
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Email Verified</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>{user.location || "N/A"}</td>
                    <td>{user.email_verified_at ? "Yes" : "No"}</td>
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
