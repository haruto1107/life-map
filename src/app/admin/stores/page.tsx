
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createStore,
  updateStore,
  toggleStoreActive,
  toggleStorePublication,
} from "./actions";

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

  const { data: auth, error: authError } =
    await supabase.auth.getClaims();

  if (authError || !auth?.claims) redirect("/login");

  const claims = auth.claims as {
    app_metadata?: {
      role?: string;
      platform_role?: string;
    };
  };

  if (
    claims.app_metadata?.role !== "admin" ||
    claims.app_metadata?.platform_role !== "admin"
  ) {
    redirect("/");
  }

  const { data: stores, error } = await supabase
    .from("stores")
    .select(
      "id, name, category, address, phone, website_url, description, is_published, is_active, listing_status, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8 text-red-600">
        店舗情報の取得に失敗しました：{error.message}
      </main>
    );
  }

  const allStores = stores ?? [];

  const filteredStores = allStores.filter((store) => {
    const matchesQuery =
      !query ||
      [
        store.name,
        store.category,
        store.address,
        store.phone,
      ]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(query));

    const matchesStatus =
      !selectedStatus || store.listing_status === selectedStatus;

    return matchesQuery && matchesStatus;
  });

  const publishedCount = allStores.filter(
    (store) => store.is_published && store.is_active
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm text-blue-600">
          ← 管理画面へ戻る
        </a>

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-slate-900">
            店舗管理
          </h1>
          <p className="mt-2 text-slate-500">
            店舗の登録・編集・公開状態を管理するページ。
          </p>
        </div>

        {/* 集計 */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">登録店舗数</p>
            <p className="mt-1 text-3xl font-bold">
              {allStores.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">公開中</p>
            <p className="mt-1 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">検索結果</p>
            <p className="mt-1 text-3xl font-bold">
              {filteredStores.length}
            </p>
          </div>
        </div>

        {/* 新規登録 */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            ＋ 新しい店舗を登録
          </h2>

          <form action={createStore} className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium">
              店舗名 *
              <input
                name="name"
                required
                maxLength={200}
                placeholder="例：LIFE MAP カフェ"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm font-medium">
              カテゴリー
              <input
                name="category"
                maxLength={100}
                placeholder="例：カフェ"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm font-medium md:col-span-2">
              住所
              <input
                name="address"
                maxLength={500}
                placeholder="店舗の住所"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm font-medium">
              電話番号
              <input
                name="phone"
                maxLength={50}
                placeholder="電話番号"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm font-medium">
              Webサイト
              <input
                name="website_url"
                type="url"
                maxLength={1000}
                placeholder="https://example.com"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <label className="text-sm font-medium md:col-span-2">
              店舗説明
              <textarea
                name="description"
                maxLength={5000}
                rows={3}
                placeholder="店舗の特徴やサービスなど"
                className="mt-1 w-full rounded-lg border p-3"
              />
            </label>

            <div className="md:col-span-2">
              <p className="mb-3 text-xs text-slate-500">
                登録直後は「未申請・非公開」で登録されるよ。
              </p>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                店舗を登録する
              </button>
            </div>
          </form>
        </section>

        {/* 検索・絞り込み */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">店舗を検索</h2>

          <form method="GET" className="flex flex-col gap-3 md:flex-row">
            <input
              name="q"
              defaultValue={params?.q ?? ""}
              placeholder="店舗名・住所・カテゴリー・電話番号"
              className="min-w-0 flex-1 rounded-lg border p-3"
            />

            <select
              name="status"
              defaultValue={selectedStatus}
              className="rounded-lg border p-3"
            >
              <option value="">すべての掲載状態</option>
              <option value="not_requested">未申請</option>
              <option value="inquiry_pending">確認待ち</option>
              <option value="approved">承認済み</option>
              <option value="rejected">却下</option>
              <option value="suspended">掲載停止</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white"
            >
              検索
            </button>

            <a
              href="/admin/stores"
              className="rounded-lg border px-5 py-3 text-center"
            >
              リセット
            </a>
          </form>
        </section>

        {/* 店舗一覧 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">登録店舗一覧</h2>
          <span className="text-sm text-slate-500">
            {filteredStores.length}件
          </span>
        </div>

        <div className="space-y-6">
          {filteredStores.map((store) => (
            <section
              key={store.id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">{store.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {store.category || "カテゴリー未設定"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    ID：{store.id}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                  {statusLabels[store.listing_status] ??
                    store.listing_status}
                </span>
              </div>

              <div className="mb-5 flex flex-wrap gap-2 text-sm">
                <span
                  className={`rounded-full px-3 py-1 ${
                    store.is_published
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {store.is_published ? "公開中" : "非公開"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 ${
                    store.is_active
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {store.is_active ? "有効" : "無効"}
                </span>
              </div>

              {/* 店舗情報編集 */}
              <details className="mb-5">
                <summary className="cursor-pointer font-semibold text-blue-600">
                  店舗情報を編集
                </summary>

                <form
                  action={updateStore}
                  className="mt-4 grid gap-4 md:grid-cols-2"
                >
                  <input type="hidden" name="id" value={store.id} />

                  <label className="text-sm font-medium">
                    店舗名 *
                    <input
                      name="name"
                      required
                      defaultValue={store.name}
                      className="mt-1 w-full rounded-lg border p-3"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    カテゴリー
                    <input
                      name="category"
                      defaultValue={store.category ?? ""}
                      className="mt-1 w-full rounded-lg border p-3"
                    />
                  </label>

                  <label className="text-sm font-medium md:col-span-2">
                    住所
                    <input
                      name="address"
                      defaultValue={store.address ?? ""}
                      className="mt-1 w-full rounded-lg border p-3"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    電話番号
                    <input
                      name="phone"
                      defaultValue={store.phone ?? ""}
                      className="mt-1 w-full rounded-lg border p-3"
                    />
                  </label>

                  <label className="text-sm font-medium">
                    Webサイト
                    <input
                      name="website_url"
                      type="url"
                      defaultValue={store.website_url ?? ""}
                      className="mt-1 w-full rounded-lg border p-3"
                    />
                  </label>

                  <label className="text-sm font-medium md:col-span-2">
                    店舗説明
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={store.description ?? ""}
                      className="mt-1 w-full rounded-lg border p-3"
                    />
                  </label>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
                    >
                      変更を保存
                    </button>
                  </div>
                </form>
              </details>

              {/* 有効・無効 */}
              <div className="mb-4 border-t pt-4">
                <p className="mb-2 text-sm font-semibold">
                  店舗の利用状態
                </p>

                <form action={toggleStoreActive}>
                  <input type="hidden" name="id" value={store.id} />
                  <input
                    type="hidden"
                    name="next_active"
                    value={String(!store.is_active)}
                  />

                  <button
                    type="submit"
                    className="rounded-lg border px-4 py-2 text-sm font-medium"
                  >
                    {store.is_active ? "この店舗を無効にする" : "この店舗を有効にする"}
                  </button>
                </form>
              </div>

              {/* 公開・非公開 */}
              <div className="border-t pt-4">
                <p className="mb-2 text-sm font-semibold">
                  一般公開の状態
                </p>

                {store.listing_status !== "approved" && (
                  <p className="mb-2 text-sm text-orange-600">
                    承認済みになるまで公開できないよ。
                  </p>
                )}

                <form action={toggleStorePublication}>
                  <input type="hidden" name="id" value={store.id} />
                  <input
                    type="hidden"
                    name="next_published"
                    value={String(!store.is_published)}
                  />

                  <button
                    type="submit"
                    disabled={
                      !store.is_published &&
                      (store.listing_status !== "approved" ||
                        !store.is_active)
                    }
                    className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {store.is_published ? "非公開にする" : "一般公開する"}
                  </button>
                </form>
              </div>
            </section>
          ))}

          {filteredStores.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">
              該当する店舗はないよ。
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
