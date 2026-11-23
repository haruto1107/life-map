import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

const menus = [
  ["🏪", "店舗管理", "店舗の検索・詳細・編集", "/admin/stores"],
  ["📋", "掲載許可管理", "掲載許可の確認・管理", "/admin/permissions"],
  ["🌐", "Google連携", "Google店舗情報の管理", "/admin/google"],
  ["✉️", "メール営業", "店舗への問い合わせ", "/admin/email"],
  ["📝", "メールテンプレート", "メール文章の管理", "/admin/email/templates"],
  ["📨", "メール履歴", "送受信メールの確認", "/admin/email/history"],
  ["💳", "POS連携", "POSシステムの接続管理", "/admin/pos"],
  ["👤", "アカウント管理", "運営アカウントの管理", "/admin/accounts"],
  ["📊", "操作履歴", "管理者の操作記録", "/admin/audit"],
  ["⚙️", "システム設定", "サービス全体の設定", "/admin/settings"],
];

const cardStyle = {
  background: "#fff",
  border: "1px solid #e5eaf2",
  borderRadius: "14px",
  padding: "20px",
};

export default async function AdminPage() {
  const supabase = await createClient();

  // 管理者認証
  const { data, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !data?.claims) {
    redirect("/login");
  }

  const claims = data.claims as Record<string, unknown>;
  const metadata = claims.app_metadata as
    | { role?: string; platform_role?: string }
    | undefined;

  if (
    metadata?.role !== "admin" ||
    metadata?.platform_role !== "admin"
  ) {
    redirect("/");
  }

  // ダッシュボード情報を取得
  const [
    stores,
    inquiryPending,
    approved,
    suspended,
    published,
    googleConnected,
    googleErrors,
    crowd,
    inventory,
    logs,
  ] = await Promise.all([
    supabase.from("stores").select("id", {
      count: "exact",
      head: true,
    }),

    supabase.from("stores").select("id", {
      count: "exact",
      head: true,
    }).eq("listing_status", "inquiry_pending"),

    supabase.from("stores").select("id", {
      count: "exact",
      head: true,
    }).eq("listing_status", "approved"),

    supabase.from("stores").select("id", {
      count: "exact",
      head: true,
    }).eq("listing_status", "suspended"),

    supabase.from("stores").select("id", {
      count: "exact",
      head: true,
    })
      .eq("listing_status", "approved")
      .eq("is_published", true)
      .eq("is_active", true),

    supabase.from("integration_connections").select("id", {
      count: "exact",
      head: true,
    })
      .eq("provider", "google_places")
      .eq("connection_status", "connected"),

    supabase.from("sync_jobs").select("id", {
      count: "exact",
      head: true,
    })
      .eq("provider", "google_places")
      .eq("status", "failed"),

    supabase.from("store_status").select("store_id", {
      count: "exact",
      head: true,
    }),

    supabase.from("product_inventory").select("product_id", {
      count: "exact",
      head: true,
    }),

    supabase.from("audit_logs")
      .select("id, action, resource_type, outcome, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const metrics = [
    {
      label: "登録店舗数",
      value: stores.count,
      error: stores.error,
      description: "データベース上の全店舗",
    },
    {
      label: "掲載申請中",
      value: inquiryPending.count,
      error: inquiryPending.error,
      description: "問い合わせ・承認待ち",
    },
    {
      label: "掲載承認済み",
      value: approved.count,
      error: approved.error,
      description: "掲載許可を取得した店舗",
    },
    {
      label: "公開中の店舗",
      value: published.count,
      error: published.error,
      description: "現在一般公開されている店舗",
    },
    {
      label: "掲載停止",
      value: suspended.count,
      error: suspended.error,
      description: "掲載を停止している店舗",
    },
    {
      label: "Google接続数",
      value: googleConnected.count,
      error: googleConnected.error,
      description: "Google連携済み接続",
    },
    {
      label: "Google同期エラー",
      value: googleErrors.count,
      error: googleErrors.error,
      description: "失敗した同期ジョブ",
    },
    {
      label: "混雑情報登録数",
      value: crowd.count,
      error: crowd.error,
      description: "混雑状況の登録件数",
    },
    {
      label: "在庫情報登録数",
      value: inventory.count,
      error: inventory.error,
      description: "商品在庫の登録件数",
    },
  ];

  const hasError =
    metrics.some((item) => item.error) ||
    logs.error;

  const recentLogs = logs.data ?? [];

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f7fb",
      color: "#172033",
    }}>
      <header style={{
        background: "#fff",
        borderBottom: "1px solid #e5eaf2",
        padding: "20px 5%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "26px" }}>
            LIFE MAP
          </h1>
          <p style={{
            margin: "5px 0 0",
            color: "#64748b",
          }}>
            運営管理システム
          </p>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <span style={{
            background: "#e6edfa",
            color: "#45689f",
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "bold",
          }}>
            ADMIN
          </span>

          <form action={logout}>
            <button type="submit" style={{
              padding: "9px 16px",
              border: "1px solid #d5dce8",
              borderRadius: "9px",
              background: "#fff",
              cursor: "pointer",
            }}>
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "36px 20px",
      }}>
        <h2 style={{
          fontSize: "24px",
          marginBottom: "8px",
        }}>
          ダッシュボード
        </h2>

        <p style={{
          color: "#64748b",
          marginBottom: "28px",
        }}>
          LIFE MAPの運営状況
        </p>

        {hasError && (
          <div role="alert" style={{
            background: "#fff4e5",
            color: "#8a4b08",
            padding: "14px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}>
            一部のデータを取得できなかったよ。
            Supabaseの権限や接続設定を確認してね。
          </div>
        )}

        <section style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "36px",
        }}>
          {metrics.map((item) => (
            <article key={item.label} style={cardStyle}>
              <p style={{
                color: "#64748b",
                fontSize: "14px",
                margin: 0,
              }}>
                {item.label}
              </p>

              <p style={{
                fontSize: "32px",
                fontWeight: "bold",
                margin: "12px 0",
              }}>
                {item.error
                  ? "取得失敗"
                  : item.value ?? 0}
              </p>

              <p style={{
                color: "#94a3b8",
                fontSize: "12px",
                margin: 0,
              }}>
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section style={{
          ...cardStyle,
          marginBottom: "36px",
        }}>
          <h3 style={{ marginTop: 0 }}>
            最近の操作履歴
          </h3>

          {logs.error ? (
            <p style={{ color: "#b42318" }}>
              操作履歴を取得できなかったよ。
            </p>
          ) : recentLogs.length === 0 ? (
            <p style={{ color: "#64748b" }}>
              まだ操作履歴はないよ。
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: "12px" }}>日時</th>
                    <th style={{ padding: "12px" }}>操作</th>
                    <th style={{ padding: "12px" }}>対象</th>
                    <th style={{ padding: "12px" }}>結果</th>
                  </tr>
                </thead>

                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{
                        padding: "12px",
                        borderTop: "1px solid #e5eaf2",
                        whiteSpace: "nowrap",
                      }}>
                        {new Date(log.created_at).toLocaleString(
                          "ja-JP",
                          { timeZone: "Asia/Tokyo" }
                        )}
                      </td>

                      <td style={{
                        padding: "12px",
                        borderTop: "1px solid #e5eaf2",
                      }}>
                        {log.action}
                      </td>

                      <td style={{
                        padding: "12px",
                        borderTop: "1px solid #e5eaf2",
                      }}>
                        {log.resource_type}
                      </td>

                      <td style={{
                        padding: "12px",
                        borderTop: "1px solid #e5eaf2",
                      }}>
                        {log.outcome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p style={{
            marginBottom: 0,
            marginTop: "18px",
            textAlign: "right",
          }}>
            <a href="/admin/audit" style={{
              color: "#45689f",
              fontSize: "13px",
              textDecoration: "none",
            }}>
              すべての操作履歴を見る →
            </a>
          </p>
        </section>

        <section>
          <h3 style={{ marginBottom: "18px" }}>
            管理メニュー
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "16px",
          }}>
            {menus.map(([icon, title, description, href]) => (
              <a
                key={href}
                href={href}
                style={{
                  display: "block",
                  background: "#fff",
                  border: "1px solid #e5eaf2",
                  borderRadius: "14px",
                  padding: "22px",
                  textDecoration: "none",
                  color: "#172033",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{
                  fontSize: "25px",
                  marginBottom: "12px",
                }}>
                  {icon}
                </div>

                <h4 style={{ margin: "0 0 8px" }}>
                  {title}
                </h4>

                <p style={{
                  color: "#64748b",
                  fontSize: "13px",
                  margin: 0,
                }}>
                  {description}
                </p>
              </a>
            ))}
          </div>
        </section>

        <footer style={{
          marginTop: "48px",
          paddingTop: "20px",
          borderTop: "1px solid #e5eaf2",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "12px",
        }}>
          LIFE MAP Administration System
          <br />
          Copyright © 2026 LUMINO. All Rights Reserved.
        </footer>
      </div>
    </main>
  );
}
