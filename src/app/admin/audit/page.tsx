"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";

type AuditLog = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: Record<string, unknown>;
  created_at: string;
  admin_name: string;
};

function formatAction(action: string) {
  return action.replaceAll("_", " ");
}

export default function AdminAuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const response = await fetch("/api/admin/audit");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load audit logs");
        }

        setAuditLogs(data.auditLogs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setIsLoading(false);
      }
    }

    loadAuditLogs();
  }, []);

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin Accountability"
          title="Audit log"
          description="A traceable record of decisions made by administrators across the marketplace."
        />

        <section className="admin-info-section" aria-labelledby="admin-audit-heading">
          <div className="admin-section-heading">
            <h2 id="admin-audit-heading">Recent administrative activity</h2>
            <p>Every moderation, account, and booking decision is recorded with its actor and target.</p>
          </div>

          {isLoading && <p className="section-empty-state">Loading audit log...</p>}
          {error && <p className="error-message">{error}</p>}
          {!isLoading && !error && auditLogs.length === 0 && <p className="section-empty-state">No administrative actions recorded yet.</p>}

          {!isLoading && !error && auditLogs.length > 0 && (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Admin</th>
                    <th>Details</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td><strong>{formatAction(log.action)}</strong></td>
                      <td>{log.entity_type} {log.entity_id ? `#${log.entity_id}` : ""}</td>
                      <td>{log.admin_name}</td>
                      <td>{typeof log.details?.status === "string" ? `Status: ${log.details.status}` : "Recorded decision"}</td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
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
