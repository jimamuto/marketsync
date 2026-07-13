"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import DashboardSidebar from "../../components/DashboardSidebar";

type Counts = {
  pending_bookings: number;
  pending_supplies: number;
  pending_demands: number;
  unverified_users: number;
  unmatched_demands: number;
  overdue_supplies: number;
};

type ActionCenter = {
  counts: Counts;
  pendingBookings: Array<{
    id: number;
    crop_name: string;
    quantity: number;
    unit: string;
    buyer_name: string;
    farmer_name: string;
  }>;
  pendingSupplies: Array<{
    id: number;
    crop_name: string;
    quantity: number;
    unit: string;
    farmer_name: string;
  }>;
  pendingDemands: Array<{
    id: number;
    crop_name: string;
    quantity: number;
    unit: string;
    buyer_name: string;
  }>;
  unverifiedUsers: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
  unmatchedDemands: Array<{
    id: number;
    crop_name: string;
    quantity: number;
    unit: string;
    location: string;
    buyer_name: string;
  }>;
  recentActivity: Array<{
    id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    created_at: string;
    admin_name: string;
  }>;
};

function formatQuantity(quantity: number, unit: string) {
  return `${Number(quantity).toLocaleString()} ${unit}`;
}

function formatAction(action: string) {
  return action.replaceAll("_", " ");
}

export default function AdminPage() {
  const [actionCenter, setActionCenter] = useState<ActionCenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadActionCenter() {
      try {
        const response = await fetch("/api/admin/action-center");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load admin action center");
        }

        setActionCenter(data.actionCenter);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin action center");
      } finally {
        setIsLoading(false);
      }
    }

    loadActionCenter();
  }, []);

  const counts = actionCenter?.counts;

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="admin" />

      <section className="dashboard-main">
        <PageHeader
          eyebrow="Admin Action Center"
          title="Keep the marketplace moving"
          description="Review exceptions, resolve transactions, and protect the quality of every listing."
        />

        {error && <p className="error-message">{error}</p>}

        <section className="admin-action-hero" aria-label="Admin operating priority">
          <div>
            <p className="section-kicker">Today&apos;s operating view</p>
            <h2>Move the work that needs a decision.</h2>
            <p>
              The queues below turn marketplace activity into clear administrative actions instead of passive reports.
            </p>
          </div>
          <Link href="/admin/bookings" className="primary-button">
            Open booking operations
          </Link>
        </section>

        <section className="admin-action-summary" aria-label="Action queue summary">
          {isLoading ? (
            <p className="section-empty-state">Loading action queues...</p>
          ) : (
            <>
              <Link href="/admin/bookings" className="admin-action-metric admin-action-metric--urgent">
                <span>Pending bookings</span>
                <strong>{counts?.pending_bookings ?? 0}</strong>
                <small>Need a decision</small>
              </Link>
              <Link href="/admin/supplies" className="admin-action-metric">
                <span>Supplies to review</span>
                <strong>{counts?.pending_supplies ?? 0}</strong>
                <small>Quality checks</small>
              </Link>
              <Link href="/admin/demands" className="admin-action-metric">
                <span>Demands to review</span>
                <strong>{counts?.pending_demands ?? 0}</strong>
                <small>Buyer requests</small>
              </Link>
              <Link href="/admin/users" className="admin-action-metric">
                <span>Unverified users</span>
                <strong>{counts?.unverified_users ?? 0}</strong>
                <small>Account follow-up</small>
              </Link>
              <Link href="/admin/demands" className="admin-action-metric">
                <span>Unmatched demands</span>
                <strong>{counts?.unmatched_demands ?? 0}</strong>
                <small>Supply opportunity</small>
              </Link>
              <Link href="/admin/supplies" className="admin-action-metric">
                <span>Overdue supplies</span>
                <strong>{counts?.overdue_supplies ?? 0}</strong>
                <small>Needs attention</small>
              </Link>
            </>
          )}
        </section>

        {actionCenter && (
          <section className="admin-action-grid" aria-label="Administrative work queues">
            <article className="admin-action-queue">
              <div className="admin-action-queue-heading">
                <div>
                  <p className="section-kicker">Operations</p>
                  <h2>Pending bookings</h2>
                </div>
                <Link href="/admin/bookings">View all</Link>
              </div>
              {actionCenter.pendingBookings.length === 0 ? (
                <p className="section-empty-state">No bookings are waiting for a decision.</p>
              ) : (
                <ul className="admin-action-list">
                  {actionCenter.pendingBookings.map((booking) => (
                    <li key={booking.id}>
                      <div>
                        <strong>{booking.crop_name}</strong>
                        <span>{formatQuantity(booking.quantity, booking.unit)}</span>
                        <small>{booking.buyer_name} to {booking.farmer_name}</small>
                      </div>
                      <Link href="/admin/bookings" className="table-button">Review</Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="admin-action-queue">
              <div className="admin-action-queue-heading">
                <div>
                  <p className="section-kicker">Marketplace quality</p>
                  <h2>Content awaiting review</h2>
                </div>
                <div className="admin-inline-links">
                  <Link href="/admin/supplies">Supplies</Link>
                  <Link href="/admin/demands">Demands</Link>
                </div>
              </div>
              {actionCenter.pendingSupplies.length === 0 && actionCenter.pendingDemands.length === 0 ? (
                <p className="section-empty-state">No listings are waiting for moderation.</p>
              ) : (
                <ul className="admin-action-list">
                  {actionCenter.pendingSupplies.slice(0, 3).map((supply) => (
                    <li key={`supply-${supply.id}`}>
                      <div>
                        <strong>{supply.crop_name} supply</strong>
                        <span>{formatQuantity(supply.quantity, supply.unit)}</span>
                        <small>Submitted by {supply.farmer_name}</small>
                      </div>
                      <Link href="/admin/supplies" className="table-button">Review</Link>
                    </li>
                  ))}
                  {actionCenter.pendingDemands.slice(0, 3).map((demand) => (
                    <li key={`demand-${demand.id}`}>
                      <div>
                        <strong>{demand.crop_name} demand</strong>
                        <span>{formatQuantity(demand.quantity, demand.unit)}</span>
                        <small>Requested by {demand.buyer_name}</small>
                      </div>
                      <Link href="/admin/demands" className="table-button">Review</Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="admin-action-queue">
              <div className="admin-action-queue-heading">
                <div>
                  <p className="section-kicker">Growth opportunity</p>
                  <h2>Unmatched demand</h2>
                </div>
                <Link href="/admin/reports">Open reports</Link>
              </div>
              {actionCenter.unmatchedDemands.length === 0 ? (
                <p className="section-empty-state">All open demands currently have potential supply.</p>
              ) : (
                <ul className="admin-action-list">
                  {actionCenter.unmatchedDemands.map((demand) => (
                    <li key={demand.id}>
                      <div>
                        <strong>{demand.crop_name}</strong>
                        <span>{formatQuantity(demand.quantity, demand.unit)} in {demand.location}</span>
                        <small>Buyer: {demand.buyer_name}</small>
                      </div>
                      <Link href="/admin/reports" className="table-button">Plan</Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="admin-action-queue">
              <div className="admin-action-queue-heading">
                <div>
                  <p className="section-kicker">Trust and safety</p>
                  <h2>Account follow-up</h2>
                </div>
                <Link href="/admin/users">Manage users</Link>
              </div>
              {actionCenter.unverifiedUsers.length === 0 ? (
                <p className="section-empty-state">All active marketplace users are verified.</p>
              ) : (
                <ul className="admin-action-list">
                  {actionCenter.unverifiedUsers.map((user) => (
                    <li key={user.id}>
                      <div>
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                        <small>{user.role} account awaiting verification</small>
                      </div>
                      <Link href="/admin/users" className="table-button">Manage</Link>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="admin-action-queue admin-action-queue--wide">
              <div className="admin-action-queue-heading">
                <div>
                  <p className="section-kicker">Accountability</p>
                  <h2>Recent admin activity</h2>
                </div>
                <Link href="/admin/audit">View audit log</Link>
              </div>
              {actionCenter.recentActivity.length === 0 ? (
                <p className="section-empty-state">Administrative actions will appear here.</p>
              ) : (
                <ul className="admin-activity-list">
                  {actionCenter.recentActivity.map((activity) => (
                    <li key={activity.id}>
                      <strong>{formatAction(activity.action)}</strong>
                      <span>{activity.entity_type} {activity.entity_id ? `#${activity.entity_id}` : ""}</span>
                      <small>{activity.admin_name} · {new Date(activity.created_at).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </section>
        )}
      </section>
    </main>
  );
}
