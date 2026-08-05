import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import AppNav from "@/components/AppNav";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const from = String(formData.get("from") || "/dashboard");

    try {
      await signIn("credentials", { email, password, redirectTo: from });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
      }
      throw err;
    }
  }

  return (
    <>
      <AppNav />
      <section className="sec auth-sec">
        <div className="wrap auth-wrap">
          <div className="card auth-card">
            <span className="eyebrow violet">Welcome back</span>
            <h1>Log in to RivalDraft</h1>
            <p className="lead auth-lead">Draft, track your leagues, and manage your wallet.</p>

            {params.error && (
              <div className="form-error">Incorrect email or password. Try again.</div>
            )}

            <form action={loginAction}>
              <input type="hidden" name="from" value={params.from || "/dashboard"} />
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" required autoComplete="current-password" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block">
                Log in
              </button>
            </form>

            <p className="auth-switch">
              New to RivalDraft? <Link href="/signup">Create an account</Link>
            </p>
            <p className="auth-demo">
              Test player: <b>testaccount@rivaldraft.test</b>
              <br />
              Test management: <b>testaccount-admin@rivaldraft.test</b>
              <br />
              Password (both): <b>TESTACCOUNT123!@#</b>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
