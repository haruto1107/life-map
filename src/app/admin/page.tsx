
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error: authError } = await supabase.auth.getClaims();

  if (authError || !data?.claims) redirect("/login");

  const claims = data.claims as Record<string, any>;
  const metadata = claims.app_metadata;

  if (
    metadata?.role !== "admin" ||
    metadata?.platform_role !== "admin"
  ) {
    redirect("/");
  }

  const [
    stores,
    pending,
    approved,
    suspended,
    published,
    googleConnected,
    googleErrors,
    crowd,
    inventory,
    logs,
  ] = await Promise.all([
    supabase.from("stores").select("id", { count: "exact", head: true }),
    supabase.from("stores").select("id", { count: "exact", head: true }).eq("listing_status", "inquiry_pending"),
    supabase.from("stores").select("id", { count: "exact", head: true }).eq("listing_status", "approved"),
    supabase.from("stores").select("id", { count: "exact", head: true }).eq("listing_status", "suspended"),
    supabase.from("stores").select("id", { count: "exact", head: true }).eq("listing_status", "approved").eq("is_published", true).eq("is_active", true),
    supabase.from("integration_connections").select("id", { count: "exact", head: true }).eq("provider", "google_places").eq("connection_status", "connected"),
    supabase.from("sync_jobs").select("id", { count: "exact", head: true }).eq("provider", "google_places").eq("status", "failed"),
    supabase.from("store_status").select("store_id", { count: "exact", head: true }),
    supabase.from("product_inventory").select("product_id", { count: "exact", head: true }),
    supabase.from("audit_logs").select("id, action, resource_type, outcome, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const metrics = [
    { label: "登録店舗数", value: stores.count, error: stores.error, note: "登録されている全店舗", href: "/admin/stores" },
    { label: "掲載申請中", value: pending.count, error: pending.error, note: "確認・承認待ち", href: "/admin/permissions" },
    { label: "掲載承認済み", value: approved.count, error: approved.error, note: "掲載許可を取得済み", href: "/admin/permissions" },
    { label: "公開中の店舗", value: published.count, error: published.error, note: "一般公開されている店舗", href: "/admin/stores" },
    { label: "掲載停止", value: suspended.count, error: suspended.error, note: "掲載を停止している店舗", href: "/admin/permissions" },
    { label: "Google接続数", value: googleConnected.count, error: googleConnected.error, note: "Google連携済み接続", href: "/admin/google" },
    { label: "Google同期エラー", value: googleErrors.count, error: googleErrors.error, note: "失敗した同期ジョブ", href: "/admin/google" },
    { label: "混雑情報登録数", value: crowd.count, error: crowd.error, note: "混雑状況の登録件数", href: "/admin/stores" },
    { label: "在庫情報登録数", value: inventory.count, error: inventory.error, note: "商品在庫の登録件数", href: "/admin/stores" },
  ];

  const hasError = metrics.some((item) => item.error) || logs.error;
  const recentLogs = logs.data ?? [];

  return (
    <AdminShell active="/admin">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>ダッシュボード</h1>
          <p>LIFE MAPの運営状況をまとめて確認できるよ。</p>
        </div>
        <span className="date-label">
          <span className="admin-status-dot" /> 管理者モード
        </span>
      </div>

      {hasError && (
        <div className="notice notice-warning" role="alert">
          一部のデータを取得できなかったよ。Supabaseの権限や接続設定を確認してね。
        </div>
      )}

      <section className="metric-grid">
        {metrics.map((item) => (
          <Link href={item.href} className="metric-card" key={item.label}>
            <span className="metric-label">{item.label}</span>
            <strong className="metric-value">
              {item.error ? "—" : item.value ?? 0}
            </strong>
            <span className="metric-note">{item.note}</span>
          </Link>
        ))}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ACTIVITY</span>
            <h2>最近の操作履歴</h2>
          </div>
          <Link href="/admin/audit" className="text-link">すべて見る →</Link>
        </div>

        {logs.error ? (
          <p className="empty-state">操作履歴を取得できなかったよ。</p>
        ) : recentLogs.length === 0 ? (
          <p className="empty-state">まだ操作履歴はないよ。</p>
        ) : (
          <div className="table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>操作</th>
                  <th>対象</th>
                  <th>結果</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</td>
                    <td>{log.action}</td>
                    <td>{log.resource_type}</td>
                    <td><span className="status-pill">{log.outcome}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="quick-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">QUICK ACCESS</span>
            <h2>よく使う管理機能</h2>
          </div>
        </div>
        <div className="quick-grid">
          <Link href="/admin/stores" className="quick-card">
            <span className="quick-icon">▦</span>
            <strong>店舗管理</strong>
            <small>店舗の登録・編集・公開設定</small>
            <span className="quick-arrow">→</span>
          </Link>
          <Link href="/admin/permissions" className="quick-card">
            <span className="quick-icon">✓</span>
            <strong>掲載許可管理</strong>
            <small>掲載申請の確認と承認</small>
            <span className="quick-arrow">→</span>
          </Link>
          <Link href="/admin/audit" className="quick-card">
            <span className="quick-icon">≡</span>
            <strong>操作履歴</strong>
            <small>運営操作の記録を確認</small>
            <span className="quick-arrow">→</span>
          </Link>
        </div>
      </section>
    </AdminShell>
  );
}
