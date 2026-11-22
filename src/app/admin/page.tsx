import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
const menu = [
  "ダッシュボード",
  "店舗管理",
  "掲載許可管理",
  "Google連携",
  "メール営業",
  "メールテンプレート",
  "メール履歴",
  "POS連携",
  "アカウント管理",
  "操作履歴",
  "システム設定",
];

export default function AdminPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#f5f7fb",
      color: "#172033",
      fontFamily: "Arial, sans-serif",
      padding: "28px"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px"
      }}>
        <div>
          <h1 style={{ margin: 0 }}>LIFE MAP</h1>
          <p style={{ color: "#64748b" }}>
            Administration Console
          </p>
        </div>
        <span style={{
          background: "#e8efff",
          color: "#315fa8",
          padding: "8px 12px",
          borderRadius: "8px"
        }}>
          ADMIN
        </span>
      </header>

      <section style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <h2>ダッシュボード</h2>
        <p style={{ color: "#64748b" }}>
          LIFE MAP 運営管理センター
        </p>
        <p>サービス全体の状況を管理する画面です。</p>
      </section>

      <section>
        <h2>管理メニュー</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "14px"
        }}>
          {menu.map((item) => (
            <div key={item} style={{
              background: "white",
              padding: "22px",
              borderRadius: "12px",
              border: "1px solid #e5eaf2",
              fontWeight: 600
            }}>
              {item}
              <p style={{
                color: "#94a3b8",
                fontSize: "12px",
                marginBottom: 0
              }}>
                管理機能
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{
        marginTop: "60px",
        color: "#94a3b8",
        fontSize: "12px"
      }}>
        LIFE MAP Administration Console
        © 2026
      </footer>
    </main>
  );
}
