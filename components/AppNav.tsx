import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions";
import Logo from "@/components/Logo";

export default async function AppNav() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href={user ? "/dashboard" : "/"} className="logo">
          <Logo size={34} />
          <span className="logo-word">
            Fantasy<b>Kings88</b>
          </span>
        </Link>

        <input type="checkbox" id="navToggle" className="nav-toggle" aria-hidden="true" />

        <div className="nav-menu">
          {user && (
            <nav className="navlinks">
              <Link className="link" href="/dashboard">
                Dashboard
              </Link>
              <Link className="link" href="/leagues">
                Leagues
              </Link>
              <Link className="link" href="/account">
                Wallet
              </Link>
              {user.role === "ADMIN" && (
                <Link className="link" href="/admin">
                  Admin
                </Link>
              )}
            </nav>
          )}

          <div className="nav-actions">
            {user ? (
              <>
                <span className="nav-username">Hi, {user.name?.split(" ")[0]}</span>
                <form action={logoutAction}>
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>

        <label htmlFor="navToggle" className="burger" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </label>
      </div>
    </header>
  );
}
