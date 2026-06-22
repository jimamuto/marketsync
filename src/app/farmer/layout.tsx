import { ReactNode } from "react";
import RequireRole from "../../components/RequireRole";

type FarmerLayoutProps = {
  children: ReactNode;
};

export default function FarmerLayout({ children }: FarmerLayoutProps) {
  return <RequireRole role="farmer">{children}</RequireRole>;
}
