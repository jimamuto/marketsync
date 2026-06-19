import Link from "next/link";

export default function Navbar (){
  return(
  <header className="navbar">
      <Link href="/" className="navbar-logo">
           MarketSync
         </Link>

         <nav className="navbar-links" aria-label="Main navigation">
           <Link href="/">Home</Link>
           <Link href="/register">Register</Link>
           <Link href="/login">Login</Link>
           <Link href="/farmer">Farmer</Link>
           <Link href="/buyer">Buyer</Link>
           <Link href="/admin">Admin</Link>
         </nav>

    </header>

  );
}
