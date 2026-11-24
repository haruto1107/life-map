
import Link from "next/link";
import { logout } from "./actions";

const menus = [
  { href: "/admin", icon: "⌂", title: "ダッシュボード", description: "運営状況の確認" },
  { href: "/admin/stores", icon: "▦", title: "店舗管理", description: "店舗の登録・編集" },
  { href: "/admin/permissions", icon: "✓", title: "掲載許可管理", description: "掲載申請の確認" },
  { href: "/admin/audit", icon: "≡", title: "操作履歴", description: "管理者の操作記録" },
  { href: "/admin/google", icon: "G", title: "Google連携", description: "店舗情報の同期" },
  { href: "/admin/email", icon: "✉", title: "メール営業", description: "店舗への問い合わせ" },
  { href: "/admin/accounts", icon: "♙", title: "アカウント管理", description: "運営アカウント" },
  { href: "/admin/settings", icon: "⚙", title: "システム設定", description: "サービス全体の設定" },
];

export default function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <span className="brand-mark">L</span>
          <span>
            <strong>LIFE MAP</strong>
            <small>ADMINISTRATION</small>
          </span>
        </Link>

        <div className="sidebar-label">MENU</div>

        <nav className="admin-nav">
          {menus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${active === item.href ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="admin-status-dot" />
          システム稼働中
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="topbar-caption">LIFE MAP / ADMIN</span>
            <strong>運営管理システム</strong>
          </div>
          <div className="topbar-actions">
            <span className="admin-role">ADMIN</span>
            <form action={logout}>
              <button className="logout-button" type="submit">
                ログアウト
              </button>
            </form>
          </div>
        </header>

        <main className="admin-content">{children}</main>

        <footer className="admin-footer">
          LIFE MAP Administration System · Copyright © 2026 LUMINO.
        </footer>
      </div>
    </div>
  );
}
