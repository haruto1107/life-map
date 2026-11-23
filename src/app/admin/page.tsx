import { logout } from "./actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const menuItems = [
  ["ダッシュボード", "全体の状況を確認"],
  ["店舗管理", "掲載店舗の確認・編集"],
  ["掲載許可管理", "店舗からの掲載許可を管理"],
  ["Google連携", "Google店舗情報との連携"],
  ["メール営業", "店舗への問い合わせメール"],
  ["メールテンプレート", "メール本文の作成・編集"],
  ["メール履歴", "送受信したメールの確認"],
  ["POS連携", "POSシステムとの連携"],
  ["アカウント管理", "運営アカウントの管理"],
  ["操作履歴", "管理画面の操作履歴"],
  ["システム設定", "サービス全体の設定"],
];

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const appMetadata = data.claims.app_metadata as
    | { role?: string }
    | undefined;

  if (appMetadata?.role !== "admin") {
    redirect("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "32px 20px",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "30px", margin: 0 }}>LIFE MAP</h1>
            <p style={{ color: "#64748b", marginTop: "6px" }}>
              運営管理画面
            </p>
          </div>

          <span
            style={{
              background: "#e6edfa",
              color: "#45689f",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "13px",
            }}
          >
            ADMIN
            <form action={logout}>
  <button
    type="submit"
    style={{
      padding: "9px 16px",
      border: "1px solid #d5dce8",
      borderRadius: "9px",
      background: "#ffffff",
      color: "#334155",
      cursor: "pointer",
    }}
  >
    ログアウト
  </button>
</form>
          </span>
        </header>

        <section
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>ダッシュボード</h2>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            LIFE MAPの運営状況を管理する画面です。
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
            管理メニュー
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "14px",
            }}
          >
            {menuItems.map(([title, description]) => (
              <div
                key={title}
                style={{
                  background: "#ffffff",
                  padding: "22px",
                  borderRadius: "14px",
                  border: "1px solid #e5eaf2",
                }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: "16px" }}>
                  {title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer
          style={{
            marginTop: "40px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          LIFE MAP Administration System
          <br />
          Copyright © 2026 LUMINO. All Rights Reserved.
        </footer>
      </div>
    </main>
  );
}
