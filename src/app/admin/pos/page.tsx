import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const providers = [
  { id: "smaregi", name: "スマレジ" },
  { id: "airregi", name: "Airレジ" },
  { id: "square", name: "Square" },
  { id: "stores_pos", name: "その他のPOS" },
];

const labels: Record<string, string> = {
  not_connected: "未接続",
  pending: "接続待ち",
  connected: "接続済み",
  error: "エラー",
  revoked: "解除済み",
};

export default async function PosPage() {
  const { supabase } = await requirePlatformAdmin();

  const { data, error } = await supabase
    .from("integration_connections")
    .select("id,store_id,provider,connection_status,external_account_ref,last_synced_at,last_error_code,updated_at")
    .in("provider", providers.map((p) => p.id))
    .order("updated_at", { ascending: false });

  return (
    <AdminShell active="/admin/pos">
      <div className="page-heading">
        <div>
          <span className="eyebrow">POS INTEGRATION</span>
          <h1>POS連携</h1>
          <p>店舗ごとのPOS接続状況を管理する</p>
        </div>
      </div>

      <div className="notice notice-warning">
        POS各社のAPI認証・在庫同期処理はまだ接続されていないよ。
        現在は接続情報の管理画面。
      </div>

      <section className="metric-grid">
        {providers.map((provider) => {
          const count =
            data?.filter(
              (item) =>
                item.provider === provider.id &&
                item.connection_status === "connected"
            ).length ?? 0;

          return (
            <div className="metric-card" key={provider.id}>
              <span className="metric-label">{provider.name}</span>
              <strong className="metric-value">{count}</strong>
              <span className="metric-note">接続済み店舗数</span>
            </div>
          );
        })}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONNECTION LIST</span>
            <h2>接続一覧</h2>
          </div>
        </div>

        {error && (
          <div className="notice notice-warning">{error.message}</div>
        )}

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>サービス</th>
                <th>店舗ID</th>
                <th>状態</th>
                <th>最終同期</th>
                <th>エラー</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.id}>
                  <td>
                    {providers.find((p) => p.id === item.provider)?.name ??
                      item.provider}
                  </td>
                  <td>{item.store_id ?? "共通接続"}</td>
                  <td>{labels[item.connection_status] ?? item.connection_status}</td>
                  <td>
                    {item.last_synced_at
                      ? new Date(item.last_synced_at).toLocaleString("ja-JP")
                      : "未同期"}
                  </td>
                  <td>{item.last_error_code ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.length === 0 && (
          <div className="empty-state">POS接続情報はまだないよ。</div>
        )}
      </section>
    </AdminShell>
  );
}
