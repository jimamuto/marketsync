"use client"
import {useState,useEffect} from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../../components/PageHeader";
import DashboardSidebar from "../../../components/DashboardSidebar";
import ModerationStatus, { type ModerationStatus as ModerationStatusValue } from "../../../components/ModerationStatus";

type Demand = {
  id: number;
  crop_name: string;
  quantity: number;
  unit: string;
  location: string;
  required_date: string;
  status: string;
  notes: string | null;
  moderation_status: ModerationStatusValue;
  moderation_note: string | null;
}

export default function BuyerDemandsPage() {

  const searchParams = useSearchParams();
  const submitted = searchParams.get("submitted") === "1";
  const [demands,setDemands] = useState<Demand[]>([]); //initial state of empty array
  const [isLoading,setIsLoading]= useState(true);
  const [error,setError] = useState("");
//load the demands when the component is rendered
  //
 useEffect(()=>{
    async function loadDemands(){
      try {
        const response = await fetch("/api/demands");
        const data = await response.json();

        if(!response.ok){
          setError(data.message || "Failed to load demands");
          return;
        }
        setDemands(data.demands || []);
      } catch{
      setError("something went wrong while loading demands");
      }finally{
      setIsLoading(false);
      }
    }
    loadDemands();
  },[]); 

  return (
    <main className="dashboard-shell">
      <DashboardSidebar role="buyer" />

      <section className="dashboard-main">
      <PageHeader
        eyebrow="Buyer demands"
        title="My demand requests"
        description="Manage the produce your institution needs from farmers"
      />



      <section className="buyer-info-section" aria-labelledby="demand-records-heading">
        <div className="buyer-section-heading">
          <h2 id="demand-records-heading">Demand records</h2>
          <p>Scan request status and continue into details or matching.</p>
        </div>

        {isLoading && <p className="section-empty-state">Loading demand requests...</p>}
        {submitted && (
          <p className="success-message form-success-message">
            Demand request submitted for administrator review. Matching becomes available after approval.
          </p>
        )}
        {error && <p className="error-text">{error}</p>}
        {!isLoading && !error && demands.length === 0 && (
             <p className="section-empty-state">No demand requests yet. Create your first demand request.</p>
           )}

        {!isLoading && !error && demands.length>0 && 
        <div className="buyer-info-list">
          {demands.map((demand) => (
            <article key={demand.id} className="buyer-info-row">
              <div className="buyer-info-primary">
                <strong>{demand.crop_name}</strong>
                <p>Quantity: {demand.quantity} {demand.unit}</p>
                <p>Delivery location: {demand.location}</p>
              </div>

              <div className="buyer-info-side">
                <dl className="buyer-info-details">
                  <div>
                    <dt>Business status</dt>
                    <dd>{demand.status}</dd>
                  </div>
                  <div>
                    <dt>Required</dt>
                    <dd>{demand.required_date}</dd>
                  </div>
                </dl>
                <ModerationStatus
                  status={demand.moderation_status}
                  note={demand.moderation_note}
                />
                <div className="buyer-action-row">
                  <Link href={`/buyer/demands/${demand.id}`} className="secondary-button">View</Link>
                  <Link href={`/buyer/demands/${demand.id}/matches`} className="secondary-button">Find Matches</Link>
                </div>
              </div>
            </article>
          ))}
        </div>}
      </section>
          </section>
    </main>
  );
}
