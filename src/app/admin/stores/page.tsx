
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  createStore,
  updateStore,
  toggleStoreActive,
  toggleStorePublication,
} from "./actions";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  status?: string;
};

const statusLabels: Record<string, string> = {
  not_requested: "未申請",
  inquiry_pending: "確認待ち",
  approved: "承認済み",
  rejected: "却下",
  suspended: "掲載停止",
};

export default async function StoresPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams> | SearchParams;
}) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim().toLowerCase();
  const selectedStatus = params?.status ?? "";

  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();

  if (authError || !auth?.claims) redirect("/login");

  const claims = auth.claims as {
    app_metadata?: { role?: string; platform_role?: string };
  };

  if (
    claims.app_metadata?.role !== "admin" ||
    claims.app_metadata?.platform_role !== "admin"
  ) redirect("/");

  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name, category, address, phone, website_url, description, is_published, is_active, listing_status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <AdminShell active="/admin/stores">
        <div className="notice notice-warning">
          店舗情報の取得に失敗しました：{error.message}
        </div>
      </AdminShell>
    );
  }

  const allStores = stores ?? [];
  const filteredStores = allStores.filter((store) => {
    const matchesQuery = !query || [
      store.name, store.category, store.address, store.phone,
    ].filter(Boolean).some((item) => String(item).toLowerCase().includes(query));

    const matchesStatus = !selectedStatus || store.listing_status === selectedStatus;
    return matchesQuery && matchesStatus;
  });

  const publishedCount = allStores.filter((s) => s.is_published && s.is_active).length;
  const pendingCount = allStores.filter((s) => s.listing_status === "inquiry_pending").length;

  return (
    <AdminShell active="/admin/stores">
      <div className="page-heading">
        <div>
          <span className="eyebrow">STORE MANAGEMENT</span>
          <h1>店舗管理</h1>
          <p>店舗の登録から掲載状態まで、ここで管理できるよ。</p>
        </div>
        <a href="#new-store" className="primary-button">＋ 店舗を登録</a>
      </div>

      <section className="metric-grid metric-grid-small">
        <div className="metric-card">
          <span className="metric-label">登録店舗数</span>
          <strong className="metric-value">{allStores.length}</strong>
          <span className="metric-note">登録されている全店舗</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">公開中</span>
          <strong className="metric-value">{publishedCount}</strong>
          <span className="metric-note">一般公開中の店舗</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">確認待ち</span>
          <strong className="metric-value">{pendingCount}</strong>
          <span className="metric-note">掲載申請の確認待ち</span>
        </div>
      </section>

      <section className="panel" id="new-store">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NEW STORE</span>
            <h2>新しい店舗を登録</h2>
          </div>
          <span className="status-pill">登録後は非公開</span>
        </div>

        <form action={createStore} className="store-form">
          <label>
            店舗名 <span className="required-mark">必須</span>
            <input name="name" required maxLength={200} placeholder="例：LIFE MAP カフェ" />
          </label>
          <label>
            カテゴリー
            <input name="category" maxLength={100} placeholder="例：カフェ" />
          </label>
          <label className="full-field">
            住所
            <input name="address" maxLength={500} placeholder="店舗の住所" />
          </label>
          <label>
            電話番号
            <input name="phone" maxLength={50} placeholder="電話番号" />
          </label>
          <label>
            Webサイト
            <input name="website_url" type="url" maxLength={1000} placeholder="https://example.com" />
          </label>
          <label className="full-field">
            店舗説明
            <textarea name="description" maxLength={5000} rows={3} placeholder="店舗の特徴やサービスなど" />
          </label>
          <div className="full-field form-bottom">
            <p className="form-hint">登録直後は「未申請・非公開・有効」の状態になるよ。</p>
            <button type="submit" className="primary-button">店舗を登録する</button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">SEARCH</span>
            <h2>店舗を検索</h2>
          </div>
          <span className="status-pill">{filteredStores.length}件</span>
        </div>
        <form method="GET" className="search-form">
          <input name="q" defaultValue={params?.q ?? ""} placeholder="店舗名・住所・カテゴリー・電話番号" />
          <select name="status" defaultValue={selectedStatus}>
            <option value="">すべての掲載状態</option>
            <option value="not_requested">未申請</option>
            <option value="inquiry_pending">確認待ち</option>
            <option value="approved">承認済み</option>
            <option value="rejected">却下</option>
            <option value="suspended">掲載停止</option>
          </select>
          <button type="submit" className="secondary-button">検索</button>
          <Link href="/admin/stores" className="secondary-button">リセット</Link>
        </form>
      </section>

      <div className="section-heading list-heading">
        <div>
          <span className="eyebrow">STORE LIST</span>
          <h2>登録店舗一覧</h2>
        </div>
        <span className="status-pill">{filteredStores.length}件表示</span>
      </div>

      <div className="store-list">
        {filteredStores.map((store) => (
          <section className="panel store-card" key={store.id}>
            <div className="store-card-heading">
              <div>
                <h3>{store.name}</h3>
                <p>{store.category || "カテゴリー未設定"}</p>
                <small>登録日：{new Date(store.created_at).toLocaleDateString("ja-JP")}</small>
              </div>
              <span className={`status-pill status-${store.listing_status}`}>
                {statusLabels[store.listing_status] ?? store.listing_status}
              </span>
            </div>

            <div className="store-badges">
              <span className={store.is_published ? "badge-success" : "badge-muted"}>
                {store.is_published ? "● 公開中" : "○ 非公開"}
              </span>
              <span className={store.is_active ? "badge-info" : "badge-danger"}>
                {store.is_active ? "● 有効" : "● 無効"}
              </span>
            </div>

            <details className="edit-details">
              <summary>店舗情報を編集</summary>
              <form action={updateStore} className="store-form edit-form">
                <input type="hidden" name="id" value={store.id} />
                <label>
                  店舗名 *
                  <input name="name" required defaultValue={store.name} />
                </label>
                <label>
                  カテゴリー
                  <input name="category" defaultValue={store.category ?? ""} />
                </label>
                <label className="full-field">
                  住所
                  <input name="address" defaultValue={store.address ?? ""} />
                </label>
                <label>
                  電話番号
                  <input name="phone" defaultValue={store.phone ?? ""} />
                </label>
                <label>
                  Webサイト
                  <input name="website_url" type="url" defaultValue={store.website_url ?? ""} />
                </label>
                <label className="full-field">
                  店舗説明
                  <textarea name="description" rows={3} defaultValue={store.description ?? ""} />
                </label>
                <div className="full-field">
                  <button type="submit" className="primary-button">変更を保存</button>
                </div>
              </form>
            </details>

            <div className="store-controls">
              <div>
                <strong>店舗の利用状態</strong>
                <p>{store.is_active ? "この店舗は有効だよ。" : "この店舗は無効になっているよ。"}</p>
              </div>
              <form action={toggleStoreActive}>
                <input type="hidden" name="id" value={store.id} />
                <input type="hidden" name="next_active" value={String(!store.is_active)} />
                <button type="submit" className="secondary-button">
                  {store.is_active ? "無効にする" : "有効にする"}
                </button>
              </form>
            </div>

            <div className="store-controls">
              <div>
                <strong>一般公開の状態</strong>
                <p>
                  {store.listing_status !== "approved"
                    ? "掲載承認済みになるまで公開できないよ。"
                    : !store.is_active
                      ? "店舗が無効のため公開できないよ。"
                      : store.is_published
                        ? "現在、一般公開中だよ。"
                        : "公開する準備ができているよ。"}
                </p>
              </div>
              <form action={toggleStorePublication}>
                <input type="hidden" name="id" value={store.id} />
                <input type="hidden" name="next_published" value={String(!store.is_published)} />
                <button
                  type="submit"
                  className={store.is_published ? "secondary-button" : "primary-button"}
                  disabled={!store.is_published && (store.listing_status !== "approved" || !store.is_active)}
                >
                  {store.is_published ? "非公開にする" : "一般公開する"}
                </button>
              </form>
            </div>
          </section>
        ))}

        {filteredStores.length === 0 && (
          <div className="panel empty-state">
            該当する店舗はないよ。検索条件を変更してみてね。
          </div>
        )}
      </div>
    </AdminShell>
  );
}
