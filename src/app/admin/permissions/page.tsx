import AdminShell from "../AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";
import { changeListingStatus } from "./actions";

export const dynamic = "force-dynamic";

const labels: Record<string, string> = {
  not_requested: "未申請",
  inquiry_pending: "確認待ち",
  approved: "承認済み",
  rejected: "却下",
  suspended: "掲載停止",
};

export default async function PermissionsPage() {
  const { supabase } = await requirePlatformAdmin();

  const { data: stores, error } = await supabase
    .from("stores")
    .select(
      "id,name,category,address,listing_status,listing_status_note,is_published,created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <AdminShell active="/admin/permissions">
        <div className="notice notice-warning">
          データ取得に失敗したよ：{error.message}
        </div>
      </AdminShell>
    );
  }

  const pending =
    stores?.filter((s) => s.listing_status === "inquiry_pending").length ?? 0;

  return (
    <AdminShell active="/admin/permissions">
      <div className="page-heading">
        <div>
          <span className="eyebrow">LISTING PERMISSIONS</span>
          <h1>掲載許可管理</h1>
          <p>店舗の掲載許可・公開状態を管理する</p>
        </div>
        <span className="date-label">{stores?.length ?? 0} 店舗</span>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">登録店舗</span>
          <strong className="metric-value">{stores?.length ?? 0}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">確認待ち</span>
          <strong className="metric-value">{pending}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">承認済み</span>
          <strong className="metric-value">
            {stores?.filter((s) => s.listing_status === "approved").length ?? 0}
          </strong>
        </div>
      </div>

      <div className="store-list">
        {stores?.map((store) => (
          <section className="panel store-card" key={store.id}>
            <div className="store-card-heading">
              <div>
                <h3>{store.name}</h3>
                <p>
                  {store.category ?? "カテゴリー未設定"}
                  {store.address ? ` · ${store.address}` : ""}
                </p>
                <small>
                  登録日：
                  {new Date(store.created_at).toLocaleDateString("ja-JP")}
                </small>
              </div>
              <span className={`status-pill status-${store.listing_status}`}>
                {labels[store.listing_status] ?? store.listing_status}
              </span>
            </div>

            <div className="store-badges">
              <span className={store.is_published ? "badge-success" : "badge-muted"}>
                {store.is_published ? "公開中" : "非公開"}
              </span>
            </div>

            <form action={changeListingStatus} className="store-form">
              <input type="hidden" name="id" value={store.id} />

              <label className="full-field">
                管理メモ
                <textarea
                  name="note"
                  rows={3}
                  defaultValue={store.listing_status_note ?? ""}
                  placeholder="問い合わせ状況・承認理由など"
                />
              </label>

              <div className="full-field">
                <div className="form-bottom">
                  <span className="form-hint">
                    承認後も公開操作は店舗管理から別途行う
                  </span>
                  <div className="topbar-actions">
                    <button className="primary-button" name="status" value="approved">
                      承認
                    </button>
                    <button className="secondary-button" name="status" value="inquiry_pending">
                      確認待ち
                    </button>
                    <button className="secondary-button" name="status" value="rejected">
                      却下
                    </button>
                    <button className="secondary-button" name="status" value="suspended">
                      停止
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>
        ))}

        {stores?.length === 0 && (
          <div className="panel empty-state">登録店舗はまだないよ。</div>
        )}
      </div>
    </AdminShell>
  );
}
