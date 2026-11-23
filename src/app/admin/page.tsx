
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const menus = [
  {
    title: "店舗管理",
    description: "掲載店舗の検索・詳細・編集",
    href: "/admin/stores",
    icon: "🏪",
  },
  {
    title: "掲載許可管理",
    description: "店舗の掲載許可申請・承認・却下",
    href: "/admin/permissions",
    icon: "📋",
  },
  {
    title: "Google連携",
    description: "Google店舗情報の取得・更新",
    href: "/admin/google",
    icon: "🌐",
  },
  {
    title: "メール営業",
    description: "店舗への問い合わせ・営業メール",
    href: "/admin/email",
    icon: "✉️",
  },
  {
    title: "メールテンプレート",
    description: "問い合わせメールの文章管理",
    href: "/admin/email/templates",
    icon: "📝",
  },
  {
    title: "メール履歴",
    description: "送受信したメールの確認",
    href: "/admin/email/history",
    icon: "📨",
  },
  {
    title: "POS連携",
    description: "各社POSシステムとの接続管理",
    href: "/admin/pos",
    icon: "💳",
  },
  {
    title: "アカウント管理",
    description: "運営アカウントと権限の管理",
    href: "/admin/accounts",
    icon: "👤",
  },
  {
    title: "操作履歴",
    description: "管理者による操作の記録",
    href: "/admin/audit",
    icon: "📊",
  },
  {
    title: "システム設定",
    description: "サービス全体の設定",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const claims = data.claims as Record<string, unknown>;
  const appMetadata = claims.app_metadata as
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
        color: "#172033",
      }}
    >
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5eaf2",
          padding: "20px 5%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "26px" }}>LIFE MAP</h1>
          <p style={{ margin: "5px 0 0", color: "#64748b" }}>
            運営管理システム
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              background: "#e6edfa",
              color: "#45689f",
              padding: "8px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ADMIN
          </span>

          <form action="/admin/logout" method="post">
            <button
              type="submit"
              style={{
                padding: "9px 16px",
                border: "1px solid #d5dce8",
                borderRadius: "9px",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              ログアウト
            </button>
          </form>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "36px 20px",
        }}
      >
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>
            ダッシュボード
          </h2>
          <p style={{ color: "#64748b", margin: 0 }}>
            LIFE MAPの運営状況を管理する画面です。
          </p>
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e5eaf2",
            borderRadius: "14px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>運営状況</h3>
          <p style={{ color: "#64748b", marginBottom: 0 }}>
            データベースとの接続後、店舗数・掲載許可待ち・混雑情報・
            在庫情報をここに表示します。
          </p>
          <span
            style={{
              display: "inline-block",
              marginTop: "16px",
              padding: "7px 12px",
              borderRadius: "7px",
              background: "#fff4db",
              color: "#946200",
              fontSize: "12px",
            }}
          >
            データ連携準備中
          </span>
        </section>

        <section>
          <h3 style={{ marginBottom: "18px" }}>管理メニュー</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "16px",
            }}
          >
            {menus.map((menu) => (
              <a
                key={menu.href}
                href={menu.href}
                style={{
                  display: "block",
                  background: "#fff",
                  border: "1px solid #e5eaf2",
                  borderRadius: "14px",
                  padding: "22px",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ fontSize: "26px", marginBottom: "12px" }}>
                  {menu.icon}
                </div>
                <h4 style={{ margin: "0 0 8px", fontSize: "16px" }}>
                  {menu.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  {menu.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        <footer
          style={{
            marginTop: "48px",
            paddingTop: "20px",
            borderTop: "1px solid #e5eaf2",
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
