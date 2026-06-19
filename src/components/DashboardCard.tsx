import {  ReactNode } from "react";

type DashboardProps={
  title? : string //optional property with ?
  children :ReactNode; //required 
  className?: string;
};

export default function DashboardCard({title,children,className = ""}:DashboardProps) {
  return(
  <section>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  )
  
}
