import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePlatformAdmin();

  const settings = [
    {
      name: "Supabase URL",
      configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      description: "データベース接続先",
    },
    {
      name: "Supabase Publishable Key",
      configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      description: "公開用APIキー",
    },
    {
      name: "Supabase Secret Key",
      configured: Boolean(
        process.env.SUPABASE_SECRET_KEY ??
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      description: "サーバー専用の管理APIキー",
    },
    {
      name: "Google API",
      configured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      description: "Google Maps / Places連携用",
    },
    {
      name: "Gmail OAuth",
      configured: Boolean(
        process.env.GMAIL_CLIENT_ID &&
        process.env.GMAIL_CLIENT_SECRET
      ),
      description: "Gmail API連携用",
    },
  ];

  return (
    <AdminShell active="/admin/settings">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SYSTEM SETTINGS</span>
          <h1>システム設定</h1>
          <p>システムの構成と環境変数の設定状態を確認する</p>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ENVIRONMENT</span>
            <h2>環境変数</h2>
          </div>
        </div>

        <div className="settings-list">
          {settings.map((item) => (
            <div className="settings-row" key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
              </div>
              <span className={item.configured ? "badge-success" : "badge-muted"}>
                {item.configured ? "設定済み" : "未設定"}
              </span>
            </div>
          ))}
        </div>

        <p className="form-hint">
          値そのものは表示しない。設定状態だけを確認する画面だよ。
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SECURITY</span>
            <h2>セキュリティ</h2>
          </div>
        </div>

        <ul className="settings-notes">
          <li>公開用キーとSecret Keyを分離する</li>
          <li>Secret KeyはCloudflareのSecretとして管理する</li>
          <li>認証・権限確認はサーバー側で行う</li>
          <li>DBの全公開テーブルでRLSを有効にする</li>
          <li>管理者アカウントには多要素認証を設定する</li>
        </ul>
      </section>
    </AdminShell>
  );
}
