import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";
import {
  createEmailDraft,
  createEmailTemplate,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function EmailPage() {
  const { supabase } = await requirePlatformAdmin();

  const [templates, threads, stores, gmail] = await Promise.all([
    supabase
      .from("email_templates")
      .select("id,name,subject_template,body_template,is_active,updated_at")
      .order("updated_at", { ascending: false }),
    supabase
      .from("email_threads")
      .select("id,store_id,recipient_email,subject,status,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase.from("stores").select("id,name").order("name"),
    supabase
      .from("integration_connections")
      .select("connection_status")
      .eq("provider", "gmail")
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <AdminShell active="/admin/email">
      <div className="page-heading">
        <div>
          <span className="eyebrow">EMAIL OUTREACH</span>
          <h1>メール営業</h1>
          <p>店舗への問い合わせ・テンプレート・メール履歴</p>
        </div>
      </div>

      <div className="notice notice-warning">
        Gmail APIはまだ接続されていないよ。ここで作成するメールは下書き保存のみ。
        実際の送信は行わない。
        接続状態：{gmail.data?.connection_status ?? "未登録"}
      </div>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NEW DRAFT</span>
            <h2>メール下書きを作成</h2>
          </div>
        </div>

        <form action={createEmailDraft} className="store-form">
          <label>
            宛先メールアドレス
            <input
              name="recipient_email"
              type="email"
              required
              placeholder="shop@example.com"
            />
          </label>

          <label>
            対象店舗
            <select name="store_id" defaultValue="">
              <option value="">店舗を指定しない</option>
              {stores.data?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>

          <label className="full-field">
            件名
            <input name="subject" required maxLength={200} />
          </label>

          <label className="full-field">
            本文
            <textarea name="body_text" rows={8} required />
          </label>

          <div className="full-field form-bottom">
            <span className="form-hint">送信せず、下書きとして保存する</span>
            <button className="primary-button" type="submit">
              下書きを保存
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">TEMPLATES</span>
            <h2>メールテンプレート</h2>
          </div>
        </div>

        <form action={createEmailTemplate} className="store-form">
          <label>
            テンプレート名
            <input name="name" required />
          </label>
          <label>
            件名
            <input name="subject_template" required />
          </label>
          <label className="full-field">
            本文
            <textarea name="body_template" rows={6} required />
          </label>
          <div className="full-field">
            <button className="primary-button" type="submit">
              テンプレートを登録
            </button>
          </div>
        </form>

        <div className="store-list list-heading">
          {templates.data?.map((template) => (
            <div className="panel" key={template.id}>
              <strong>{template.name}</strong>
              <p>{template.subject_template}</p>
              <pre className="template-preview">{template.body_template}</pre>
              <span className={template.is_active ? "badge-success" : "badge-muted"}>
                {template.is_active ? "有効" : "無効"}
              </span>
            </div>
          ))}
          {templates.data?.length === 0 && (
            <div className="empty-state">テンプレートはまだないよ。</div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EMAIL HISTORY</span>
            <h2>メール履歴</h2>
          </div>
          <span className="status-pill">{threads.data?.length ?? 0}件</span>
        </div>

        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>作成日</th>
                <th>宛先</th>
                <th>件名</th>
                <th>状態</th>
              </tr>
            </thead>
            <tbody>
              {threads.data?.map((thread) => (
                <tr key={thread.id}>
                  <td>{new Date(thread.created_at).toLocaleString("ja-JP")}</td>
                  <td>{thread.recipient_email}</td>
                  <td>{thread.subject}</td>
                  <td>{thread.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {threads.data?.length === 0 && (
          <div className="empty-state">メール履歴はまだないよ。</div>
        )}
      </section>
    </AdminShell>
  );
}
