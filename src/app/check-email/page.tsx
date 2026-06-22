"use client";
import Link from "next/link";
import {useSearchParams} from "/next/navigation";
import {useState} from "react";

export default function CheckEmailPage(){
  
  const searchParams= useSearchParams();
  const email = searchParams.get("email") || "";
  const [message,setMessage]= useState("");
  const [isSubmitting,setIsSubmitting] = useState(false);

  async function handleResendVerification(){
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch ("/api/auth/resend-verification",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({email}),
      });

      const data = await response.json();
      setMessage(data.message || "If this account exists, we sent a new verification email.");
    } catch (error) {
      setMessage("something went wrong please try again");
    }finally{
      setIsSubmitting(false);
    }
  }

}
  return (
    <main className="login-card-page">
      <section className="login-card-shell">
        <div className="login-card-header">
          <h1>Check your email</h1>

          {email ? (
            <p>
              We sent a verification link to <strong>{email}</strong>. Click the
              link in that email to verify your account and log in automatically.
            </p>
          ) : (
            <p>
              We sent a verification link to your inbox. Click the link in that
              email to verify your account and log in automatically.
            </p>
          )}
        </div>
      {message && <p className="form-message form-succes">{message}</p>}
          <button
             type="button"
             className="login-secondary-button"
             onClick={handleResendVerification}
             disabled={isSubmitting || !email}
           >
             {isSubmitting ? "Sending..." : "Resend verification email"}
           </button>

        <Link href="/login" className="login-primary-button check-email-login-button">
          Back to login
        </Link>

        <p className="login-card-footer">
          Already verified? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
