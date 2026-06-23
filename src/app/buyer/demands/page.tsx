"use client"
import {useState,useEffect} from "react";
import Link from "next/link";
import DashboardCard from "../../../components/DashboardCard";
import PageHeader from "../../../components/PageHeader";

type Demand ={
  id:number;
  crop_name:string;
  quantity:number;
  location:string;
  required_date:string;
  status:string;
  notes:string | null;
}

export default function BuyerDemandsPage() {

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
    <main className="dashboard-page">
      <PageHeader
        eyebrow="Buyer demands"
        title="My demand requests"
        description="Manage the produce your institution needs from farmers"
      />

      <div>
        <Link href="/buyer/demands/new" className="primary-button">New Demand</Link>
      </div>


      <DashboardCard title="Demand records">

        {isLoading && <p>Loading demand requests...</p>}
        {error && <p className="error-text">{error}</p>}
        {!isLoading && !error && demands.length === 0 && (
             <p>No demand requests yet. Create your first demand request.</p>
           )}

        {!isLoading && !error && demands.length>0 && 
        <div className="booking-list">
          {demands.map((demand) => (
            <article key={demand.id} className="booking-card">
              <div>
                <strong>{demand.crop}</strong>
                <p>Quantity: {demand.quantity}</p>
                <p>Delivery location: {demand.location}</p>
                <p>Status: {demand.status}</p>
              </div>

              <div className="booking-meta">
                <p>Required: {demand.requiredDate}</p>
                <Link href={`/buyer/demands/${demand.id}`} className="secondary-button">View</Link>
                <Link href={`/buyer/demands/${demand.id}/matches`} className="secondary-button">Find Matches</Link>
              </div>
            </article>
          ))}
        </div>}
      </DashboardCard>
    </main>
  );
}
