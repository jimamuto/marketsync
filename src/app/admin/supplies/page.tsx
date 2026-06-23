"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

type Supply = {
  id: number;
  farmer_name: string;
  farmer_email: string;
  crop_name: string;
  crop_variety: string | null;
  quantity: number;
  unit: string;
  location: string;
  expected_harvest_date: string;
  status: string;
};

export default function AdminSuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSupplies() {
      try {
        const response = await fetch("/api/admin/supplies");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load supplies");
        }

        setSupplies(data.supplies || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load supplies");
      } finally {
        setIsLoading(false);
      }
    }

    loadSupplies();
  }, []);

  return (
    <main className="dashboard-page">
      <PageHeader eyebrow="Admin" title="Crop supplies" description="View all farmer supply records" />

      <DashboardCard title="Supplies">
        {isLoading && <p>Loading supplies...</p>}
        {error && <p className="error-message">{error}</p>}
        {!isLoading && !error && supplies.length === 0 && <p>No supplies found.</p>}

        {!isLoading && !error && supplies.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Harvest Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {supplies.map((supply) => (
                  <tr key={supply.id}>
                    <td>{supply.farmer_name}</td>
                    <td>{supply.crop_name}</td>
                    <td>{supply.quantity} {supply.unit}</td>
                    <td>{supply.location}</td>
                    <td>{supply.expected_harvest_date}</td>
                    <td>{supply.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      <Link href="/admin" className="secondary-button">
        Back to admin
      </Link>
    </main>
  );
}
