import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const actionLabels: Record<string, string> = {
  "store.created": "店舗登録",
  "store.updated": "店舗情報更新",
  "store.deleted": "店舗削除",
  "store.listing_status_changed": "掲載状態変更",
  "store.publication_changed": "公開状態変更",
};

export default async function AuditPage() {
  const supabase = await createClient();

  const { data: auth, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !auth?.claims) redirect("/login");

  const claims = auth.claims as {
    app_metadata?: {
      role?: string;
      platform_role?: string;
    };
  };

  if (
    claims.app_metadata?.role !== "admin" ||
    claims.app_metadata?.platform_role !== "admin"
  ) {
    redirect("/");
  }

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select(
      "id, actor_user_id, action, resource_type, resource_id, outcome, metadata, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <main className="p-8">操作履歴の取得に失敗したよ：{error.message}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm text-blue-600">← 管理画面へ戻る</a>

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold">操作履歴</h1>
          <p className="mt-2 text-slate-500">
            管理システムで記録された最新100件の操作を確認できるよ。
          </p>
        </div>

        <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">表示中の履歴</p>
          <p className="mt-1 text-3xl font-bold">{logs?.length ?? 0}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-4">日時</th>
                <th className="p-4">操作</th>
                <th className="p-4">対象</th>
                <th className="p-4">実行者ID</th>
                <th className="p-4">結果</th>
                <th className="p-4">詳細</th>
              </tr>
            </thead>

            <tbody>
              {logs?.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="whitespace-nowrap p-4">
                    {new Date(log.created_at).toLocaleString("ja-JP", {
                      timeZone: "Asia/Tokyo",
                    })}
                  </td>

                  <td className="p-4 font-medium">
                    {actionLabels[log.action] ?? log.action}
                  </td>

                  <td className="p-4">
                    {log.resource_type}
                    <div className="max-w-40 truncate text-xs text-slate-400">
                      {log.resource_id ?? "—"}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="text-xs text-slate-500">
                      {log.actor_user_id ?? "不明"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      log.outcome === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {log.outcome}
                    </span>
                  </td>

                  <td className="p-4">
                    <details>
                      <summary className="cursor-pointer text-blue-600">
                        詳細を見る
                      </summary>
                      <pre className="mt-2 max-w-xs overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs?.length === 0 && (
            <p className="p-10 text-center text-slate-500">
              まだ操作履歴はないよ。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
