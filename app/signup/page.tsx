import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppNav from "@/components/AppNav";
import SignupForm from "@/components/SignupForm";

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <>
      <AppNav />
      <section className="sec auth-sec">
        <div className="wrap auth-wrap">
          <SignupForm />
        </div>
      </section>
    </>
  );
}
