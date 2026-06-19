type PageHeaderprops ={
  eyebrow : string;
  title: string;
  description : string;
};

export default function PageHeader({eyebrow,title,description}:PageHeaderprops) {
  return(
  <section className="dashboard-header">
    <p className="eyebrow">{eyebrow}</p>
    <h1>
      {title}
      </h1>
      <p className="dashboard-intro">{description}</p>
    </section>
  );
  
}
