import { ReactNode } from "react";
import RequireRole from "../../components/RequireRole";

type BuyerLayoutProps = {
  children: ReactNode;
};

export default function BuyerLayout({ children }: BuyerLayoutProps) {
  return <RequireRole role="buyer">{children}</RequireRole>;
}
