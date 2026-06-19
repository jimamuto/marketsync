type DashboardSidebarLink ={
  label:string;
  href?: string;
};

type DashboardSidebarProps ={
  title:string;
  links: DashboardSidebarLink[];
};

export default function DashboardSidebar({title,links}:DashboardSidebarProps) {
 return(
    <aside className="dashboard-sidebar">
      <strong>{title}</strong>
      {links.map((link) => (
        <a key={link.label} href={link.href ?? "#"}>
          {link.label}
        </a>
      ))}
    </aside>
 );
}
