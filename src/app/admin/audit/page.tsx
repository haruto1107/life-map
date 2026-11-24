import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const actionLabels: Record<string, string> = {
  "store.created": "店舗登録",
  "store.updated": "店舗情報更新",
  "store.deleted": "店舗削除",
  "store.listing_status_changed": "掲載状態変更",
  "store.publication_changed": "公開状態変更",
};

export default async function AuditPage() {
  const { supabase } = await requirePlatformAdmin();

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(
      "id,actor_user_id,action,resource_type,resource_id,outcome,metadata,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AdminShell active="/admin/audit">
      <div className="page-heading">
        <div>
          <span className="eyebrow">AUDIT LOG</span>
          <h1>操作履歴</h1>
          <p>運営システム内で実行された操作を確認する</p>
        </div>
        <span className="date-label">最新200件</span>
      </div>

      {error && (
        <div className="notice notice-warning">
          履歴の取得に失敗したよ：{error.message}
        </div>
      )}

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ACTIVITY</span>
            <h2>管理操作一覧</h2>
          </div>
          <span className="status-pill">{logs?.length ?? 0}件</span>
        </div>

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>日時</th>
                <th>操作</th>
                <th>対象</th>
                <th>実行者</th>
                <th>結果</th>
                <th>詳細</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.created_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>
                  <td>{actionLabels[log.action] ?? log.action}</td>
                  <td>
                    {log.resource_type}
                    <small>{log.resource_id ?? "—"}</small>
                  </td>
                  <td>{log.actor_user_id ?? "システム"}</td>
                  <td>
                    <span
                      className={
                        log.outcome === "success"
                          ? "badge-success"
                          : "badge-danger"
                      }
                    >
                      {log.outcome}
                    </span>
                  </td>
                  <td>
                    <details>
                      <summary>詳細</summary>
                      <pre className="audit-json">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs?.length === 0 && (
          <div className="empty-state">操作履歴はまだないよ。</div>
        )}
      </section>
    </AdminShell>
  );
}
