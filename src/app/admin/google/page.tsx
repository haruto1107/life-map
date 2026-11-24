import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const providerLabel: Record<string, string> = {
  google_places: "Google",
  gmail: "Gmail",
  stores_pos: "POS共通",
  smaregi: "スマレジ",
  airregi: "Airレジ",
  square: "Square",
};

const statusLabel: Record<string, string> = {
  not_connected: "未接続",
  pending: "接続待ち",
  connected: "接続済み",
  error: "エラー",
  revoked: "解除済み",
};

export default async function GooglePage() {
  const { supabase } = await requirePlatformAdmin();

  const [connections, jobs] = await Promise.all([
    supabase
      .from("integration_connections")
      .select("id,provider,connection_status,external_account_ref,last_synced_at,last_error_code,updated_at")
      .eq("provider", "google_places")
      .order("updated_at", { ascending: false }),
    supabase
      .from("sync_jobs")
      .select("id,provider,job_type,status,started_at,finished_at,error_code,created_at")
      .eq("provider", "google_places")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  return (
    <AdminShell active="/admin/google">
      <div className="page-heading">
        <div>
          <span className="eyebrow">GOOGLE INTEGRATION</span>
          <h1>Google連携</h1>
          <p>Google関連の接続状況と同期履歴を確認する</p>
        </div>
      </div>

      <div className="notice notice-warning">
        現在、Google OAuth・Places APIの同期処理は未接続。
        この画面はDBに保存された接続情報と同期履歴を表示するよ。
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CONNECTIONS</span>
            <h2>Google接続情報</h2>
          </div>
          <span className="status-pill">
            {connections.data?.length ?? 0}件
          </span>
        </div>

        {connections.error && (
          <p className="notice notice-warning">{connections.error.message}</p>
        )}

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>接続先</th>
                <th>状態</th>
                <th>外部アカウント</th>
                <th>最終同期</th>
                <th>エラー</th>
              </tr>
            </thead>
            <tbody>
              {connections.data?.map((item) => (
                <tr key={item.id}>
                  <td>{providerLabel[item.provider] ?? item.provider}</td>
                  <td>
                    <span className="status-pill">
                      {statusLabel[item.connection_status] ?? item.connection_status}
                    </span>
                  </td>
                  <td>{item.external_account_ref ?? "—"}</td>
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

        {connections.data?.length === 0 && (
          <div className="empty-state">Google接続情報はまだないよ。</div>
        )}
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SYNC HISTORY</span>
            <h2>同期履歴</h2>
          </div>
        </div>

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>日時</th>
                <th>処理</th>
                <th>状態</th>
                <th>開始</th>
                <th>終了</th>
                <th>エラー</th>
              </tr>
            </thead>
            <tbody>
              {jobs.data?.map((job) => (
                <tr key={job.id}>
                  <td>{new Date(job.created_at).toLocaleString("ja-JP")}</td>
                  <td>{job.job_type}</td>
                  <td>{job.status}</td>
                  <td>{job.started_at ?? "—"}</td>
                  <td>{job.finished_at ?? "—"}</td>
                  <td>{job.error_code ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {jobs.data?.length === 0 && (
          <div className="empty-state">同期履歴はまだないよ。</div>
        )}
      </section>
    </AdminShell>
  );
}
