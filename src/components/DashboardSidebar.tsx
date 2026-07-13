"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

type DashboardRole = "farmer" | "buyer" | "admin";

type DashboardSidebarLink = {
  label: string;
  href: string;
};

type DashboardSidebarProps =
  | {
      role: DashboardRole;
      title?: string;
      links?: never;
    }
  | {
      title: string;
      links: DashboardSidebarLink[];
      role?: never;
    };

const sidebarLinks: Record<DashboardRole, DashboardSidebarLink[]> = {
  farmer: [
    { label: "Overview", href: "/farmer" },
    { label: "Crop Calendar", href: "/farmer/calendar" },
    { label: "Crop Supplies", href: "/farmer/supplies" },
    { label: "Add New Crop", href: "/farmer/supplies/new" },
    { label: "Bookings", href: "/farmer/bookings" },
  ],
  buyer: [
    { label: "Overview", href: "/buyer" },
    { label: "Demands", href: "/buyer/demands" },
    { label: "New Demand", href: "/buyer/demands/new" },
    { label: "Bookings", href: "/buyer/bookings" },
  ],
  admin: [
    { label: "Action Center", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Supplies to Review", href: "/admin/supplies" },
    { label: "Demands to Review", href: "/admin/demands" },
    { label: "Booking Operations", href: "/admin/bookings" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Audit Log", href: "/admin/audit" },
  ],
};

const sidebarTitles: Record<DashboardRole, string> = {
  farmer: "Farmer Workspace",
  buyer: "Buyer Workspace",
  admin: "Admin Workspace",
};

export default function DashboardSidebar(props: DashboardSidebarProps) {
  const pathname = usePathname();
  const links = props.role ? sidebarLinks[props.role] : props.links;
  const title = props.role ? props.title ?? sidebarTitles[props.role] : props.title;
  const eyebrow = props.role ?? "Navigation";
  const exactActiveHref = links.find((link) => pathname === link.href)?.href;

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <p className="sidebar-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>

      <nav className="sidebar-nav" aria-label={`${title} navigation`}>
        {links.map((link) => {
          const isOverview = ["/farmer", "/buyer", "/admin"].includes(link.href);
          const isActive = exactActiveHref
            ? exactActiveHref === link.href
            : !isOverview && pathname.startsWith(`${link.href}/`);

          return (
            <Link key={link.href} href={link.href} aria-current={isActive ? "page" : undefined}>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <LogoutButton className="sidebar-logout-button" />
      </div>
    </aside>
  );
}
