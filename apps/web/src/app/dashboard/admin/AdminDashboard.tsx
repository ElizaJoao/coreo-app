"use client";

import { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";

type PaymentLog = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  event_type: string;
  status: "success" | "error" | "warning" | "info";
  plan: string | null;
  amount_cents: number | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type RecentUser = {
  id: string;
  email: string;
  name: string;
  plan: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type Summary = {
  totalUsers: number;
  planCounts: Record<string, number>;
  mrr: number;
  newThisWeek: number;
  totalChoreos: number;
  choreosThisWeek: number;
};

type MetricsData = {
  summary: Summary;
  recentUsers: RecentUser[];
  paymentLogs: PaymentLog[];
};

const STATUS_COLORS: Record<string, string> = {
  success: styles.statusSuccess,
  error: styles.statusError,
  warning: styles.statusWarning,
  info: styles.statusInfo,
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function fmtMoney(cents: number | null) {
  if (cents == null) return "—";
  return `€${(cents / 100).toFixed(2)}`;
}

export function AdminDashboard() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<"all" | "error" | "warning">("all");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d as MetricsData);
      })
      .catch(() => setError("Failed to load metrics"));
  }, []);

  if (error) return <div className={styles.errorState}>Error: {error}</div>;
  if (!data) return <div className={styles.loading}>Loading…</div>;

  const { summary, recentUsers, paymentLogs } = data;

  const filteredLogs = logFilter === "all"
    ? paymentLogs
    : paymentLogs.filter((l) => l.status === logFilter);

  const errorCount = paymentLogs.filter((l) => l.status === "error").length;
  const warnCount = paymentLogs.filter((l) => l.status === "warning").length;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Admin</h1>
        <span className={styles.pageTag}>⚡ Internal</span>
      </div>

      {/* Summary cards */}
      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{summary.totalUsers}</div>
          <div className={styles.statLabel}>Total users</div>
          <div className={styles.statSub}>+{summary.newThisWeek} this week</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>${summary.mrr}</div>
          <div className={styles.statLabel}>Est. MRR</div>
          <div className={styles.statSub}>
            {summary.planCounts.pro ?? 0} Pro · {summary.planCounts.max ?? 0} Max
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{summary.planCounts.free ?? 0}</div>
          <div className={styles.statLabel}>Free users</div>
          <div className={styles.statSub}>
            {summary.totalUsers > 0
              ? Math.round(((summary.planCounts.free ?? 0) / summary.totalUsers) * 100)
              : 0}% of total
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{summary.totalChoreos}</div>
          <div className={styles.statLabel}>Choreographies</div>
          <div className={styles.statSub}>+{summary.choreosThisWeek} this week</div>
        </div>
        {errorCount > 0 && (
          <div className={`${styles.statCard} ${styles.statCardError}`}>
            <div className={styles.statValue}>{errorCount}</div>
            <div className={styles.statLabel}>Payment errors</div>
            <div className={styles.statSub}>In last 100 events</div>
          </div>
        )}
      </div>

      {/* Plan breakdown */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Plan breakdown</h2>
        </div>
        <div className={styles.planBreakdown}>
          {(["free", "pro", "max"] as const).map((plan) => {
            const count = summary.planCounts[plan] ?? 0;
            const pct = summary.totalUsers > 0 ? (count / summary.totalUsers) * 100 : 0;
            return (
              <div key={plan} className={styles.planRow}>
                <span className={`${styles.planChip} ${styles[`plan_${plan}`]}`}>{plan}</span>
                <div className={styles.planBar}>
                  <div className={styles.planBarFill} style={{ width: `${pct}%`, opacity: plan === "free" ? 0.4 : plan === "pro" ? 0.7 : 1 }} />
                </div>
                <span className={styles.planCount}>{count} users</span>
                <span className={styles.planPct}>{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent users */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent users</h2>
          <span className={styles.sectionCount}>{recentUsers.length} shown</span>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Plan</th>
                <th>Signed up</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td className={styles.cellEmail}>{u.email}</td>
                  <td>{u.name || "—"}</td>
                  <td>
                    <span className={`${styles.planChip} ${styles[`plan_${u.plan}`]}`}>{u.plan}</span>
                  </td>
                  <td className={styles.cellMuted}>{fmt(u.created_at)}</td>
                  <td className={styles.cellMuted}>{u.last_sign_in_at ? fmt(u.last_sign_in_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment logs */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Payment logs</h2>
          <div className={styles.logFilters}>
            {(["all", "error", "warning"] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={logFilter === f ? styles.filterActive : styles.filter}
                onClick={() => setLogFilter(f)}
              >
                {f === "all" ? `All (${paymentLogs.length})` : f === "error" ? `Errors (${errorCount})` : `Warnings (${warnCount})`}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Event</th>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Error</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={7} className={styles.emptyCell}>No logs yet.</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={log.status === "error" ? styles.rowError : undefined}>
                    <td>
                      <span className={`${styles.statusDot} ${STATUS_COLORS[log.status] ?? ""}`} />
                      <span className={styles.statusLabel}>{log.status}</span>
                    </td>
                    <td className={styles.cellMono}>{log.event_type}</td>
                    <td className={styles.cellEmail}>{log.user_email ?? log.user_id?.slice(0, 8) ?? "—"}</td>
                    <td>{log.plan ? <span className={`${styles.planChip} ${styles[`plan_${log.plan}`]}`}>{log.plan}</span> : "—"}</td>
                    <td>{fmtMoney(log.amount_cents)}</td>
                    <td className={styles.cellError} title={log.error_message ?? ""}>{log.error_message ? log.error_message.slice(0, 60) : "—"}</td>
                    <td className={styles.cellMuted}>{fmt(log.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
