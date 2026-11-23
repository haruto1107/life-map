import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateStore } from "./actions";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
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
    return <main className="p-8">店舗情報の取得に失敗したよ：{error.message}</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm text-blue-600">← 管理画面へ戻る</a>

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-slate-900">店舗管理</h1>
          <p className="mt-2 text-slate-500">
            登録された店舗の情報を確認・編集できるよ。
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">登録店舗数</p>
          <p className="mt-1 text-3xl font-bold">{stores?.length ?? 0}</p>
        </div>

        <div className="space-y-6">
          {stores?.map((store) => (
            <section key={store.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{store.name}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    ID: {store.id}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                  {store.listing_status}
                </span>
              </div>

              <div className="mb-5 flex flex-wrap gap-2 text-sm">
                <span className={`rounded-full px-3 py-1 ${store.is_published ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {store.is_published ? "公開中" : "非公開"}
                </span>
                <span className={`rounded-full px-3 py-1 ${store.is_active ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}>
                  {store.is_active ? "有効" : "無効"}
                </span>
              </div>

              <form action={updateStore} className="grid gap-4 md:grid-cols-2">
                <input type="hidden" name="id" value={store.id} />

                <label className="text-sm font-medium">
                  店舗名
                  <input name="name" required defaultValue={store.name} className="mt-1 w-full rounded-lg border p-3" />
                </label>

                <label className="text-sm font-medium">
                  カテゴリー
                  <input name="category" defaultValue={store.category ?? ""} className="mt-1 w-full rounded-lg border p-3" />
                </label>

                <label className="text-sm font-medium md:col-span-2">
                  住所
                  <input name="address" defaultValue={store.address ?? ""} className="mt-1 w-full rounded-lg border p-3" />
                </label>

                <label className="text-sm font-medium">
                  電話番号
                  <input name="phone" defaultValue={store.phone ?? ""} className="mt-1 w-full rounded-lg border p-3" />
                </label>

                <label className="text-sm font-medium">
                  Webサイト
                  <input name="website_url" type="url" defaultValue={store.website_url ?? ""} className="mt-1 w-full rounded-lg border p-3" />
                </label>

                <label className="text-sm font-medium md:col-span-2">
                  店舗説明
                  <textarea name="description" rows={3} defaultValue={store.description ?? ""} className="mt-1 w-full rounded-lg border p-3" />
                </label>

                <div className="md:col-span-2">
                  <button type="submit" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                    変更を保存
                  </button>
                </div>
              </form>
            </section>
          ))}

          {stores?.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
              まだ店舗が登録されていないよ。
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
