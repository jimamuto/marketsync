import { ReactNode } from "react";
import RequireRole from "../../components/RequireRole";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <RequireRole role="admin">{children}</RequireRole>;
}
