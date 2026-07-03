// Central, single-source-of-truth for platform financial policy so rules
// are transparent and easy to adjust in one place rather than scattered
// across pages.

export const WITHDRAWAL_RULES = {
  minAmount: 50,
  maxAmount: 50000,
};

export const INVESTMENT_RULES = {
  // Foundation is a one-time onboarding cycle: it never auto-rolls over and
  // never auto-releases. Once it matures, the investor is prompted to
  // choose their next plan (a fresh investment through the normal
  // approval flow).
  //
  // All other plans (Growth, Accelerator, Legacy) auto-rollover by default:
  // once a cycle matures and finishes accruing daily profit, the original
  // principal automatically renews into a new cycle of the same plan
  // (see src/lib/roiAccrual.js). Principal is never released to the wallet
  // automatically — only the daily profit portion is credited to
  // wallet_balance, and that profit is withdrawable immediately once
  // credited.
  //
  // Investors may opt out of auto-rollover on any non-Foundation
  // investment. Opting out does not release principal immediately — it
  // requests a Principal Release, which an admin must review and approve
  // before the capital is credited to the wallet.
  principalPolicy: "foundation_one_time_then_auto_rollover_with_opt_out",
};
