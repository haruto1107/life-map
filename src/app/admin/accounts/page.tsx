import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";
import { changeAccountRole, inviteAccount } from "./actions";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function AccountsPage() {
  await requirePlatformAdmin();

  const admin = getAdminClient();

  if (!admin) {
    return (
      <AdminShell active="/admin/accounts">
        <div className="page-heading">
          <div>
            <span className="eyebrow">ACCOUNT MANAGEMENT</span>
            <h1>アカウント管理</h1>
            <p>管理者・スタッフのアカウントを管理する</p>
          </div>
        </div>
        <div className="notice notice-warning">
          アカウント管理を有効にするには、Cloudflareに
          SUPABASE_SECRET_KEYをSecretとして登録してね。
        </div>
      </AdminShell>
    );
  }

  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });

  return (
    <AdminShell active="/admin/accounts">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>アカウント管理</h1>
          <p>運営アカウントの招待と権限管理</p>
        </div>
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">INVITE</span>
            <h2>スタッフを招待</h2>
          </div>
        </div>

        <form action={inviteAccount} className="search-form">
          <input
            name="email"
            type="email"
            required
            placeholder="招待するメールアドレス"
          />
          <button className="primary-button" type="submit">
            招待メールを送信
          </button>
        </form>
        <p className="form-hint">
          招待されたアカウントは初期状態でスタッフ権限になるよ。
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ACCOUNTS</span>
            <h2>登録アカウント</h2>
          </div>
          <span className="status-pill">{data.users.length}件</span>
        </div>

        {error && (
          <div className="notice notice-warning">{error.message}</div>
        )}

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>メールアドレス</th>
                <th>登録日</th>
                <th>最終ログイン</th>
                <th>権限</th>
                <th>変更</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => {
                const role =
                  user.app_metadata?.platform_role === "admin"
                    ? "admin"
                    : "staff";

                return (
                  <tr key={user.id}>
                    <td>{user.email ?? "メール未登録"}</td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td>
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleString("ja-JP")
                        : "未ログイン"}
                    </td>
                    <td>{role === "admin" ? "管理者" : "スタッフ"}</td>
                    <td>
                      <form action={changeAccountRole} className="inline-role-form">
                        <input type="hidden" name="user_id" value={user.id} />
                        <select name="role" defaultValue={role}>
                          <option value="staff">スタッフ</option>
                          <option value="admin">管理者</option>
                        </select>
                        <button className="secondary-button" type="submit">
                          変更
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
