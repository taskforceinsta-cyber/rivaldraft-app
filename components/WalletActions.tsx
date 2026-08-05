"use client";

import { useActionState } from "react";
import { requestDeposit, requestWithdrawal } from "@/lib/actions";

type ActionResult = { error?: string; ok?: boolean } | null;

export default function WalletActions() {
  const [depState, depositAction, depPending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => await requestDeposit(formData),
    null
  );
  const [wdState, withdrawAction, wdPending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => await requestWithdrawal(formData),
    null
  );

  return (
    <div className="wallet-actions">
      <div className="card wallet-action-card">
        <h3>Add test funds</h3>
        <p className="wallet-action-desc">Top up instantly — this is play money, not a real charge.</p>
        {depState?.error && <div className="form-error">{depState.error}</div>}
        {depState?.ok && <div className="form-success">Funds added.</div>}
        <form action={depositAction} className="wallet-form">
          <input type="number" name="amount" min="1" step="1" placeholder="Amount ($)" required />
          <button type="submit" className="btn btn-primary" disabled={depPending}>
            {depPending ? "Adding…" : "Add funds"}
          </button>
        </form>
      </div>

      <div className="card wallet-action-card">
        <h3>Request withdrawal</h3>
        <p className="wallet-action-desc">
          Withdrawal requests go to an admin for approval — nothing leaves automatically.
        </p>
        {wdState?.error && <div className="form-error">{wdState.error}</div>}
        {wdState?.ok && <div className="form-success">Withdrawal request submitted.</div>}
        <form action={withdrawAction} className="wallet-form">
          <input type="number" name="amount" min="1" step="1" placeholder="Amount ($)" required />
          <button type="submit" className="btn btn-ghost-light" disabled={wdPending}>
            {wdPending ? "Requesting…" : "Request withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
}
