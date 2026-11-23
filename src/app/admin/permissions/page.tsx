import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { changeListingStatus } from "./actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  not_requested: "未申請",
  inquiry_pending: "確認待ち",
  approved: "承認済み",
  rejected: "却下",
  suspended: "掲載停止",
};

export default async function PermissionsPage() {
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
      "id, name, category, address, listing_status, listing_status_note, is_published, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="p-8">掲載情報の取得に失敗したよ：{error.message}</main>;
  }

  const pendingCount =
    stores?.filter((s) => s.listing_status === "inquiry_pending").length ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <a href="/admin" className="text-sm text-blue-600">← 管理画面へ戻る</a>

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold">掲載許可管理</h1>
          <p className="mt-2 text-slate-500">
            店舗の掲載申請を確認し、掲載状態を管理するページ。
          </p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">登録店舗数</p>
            <p className="mt-1 text-3xl font-bold">{stores?.length ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">確認待ち</p>
            <p className="mt-1 text-3xl font-bold text-orange-600">{pendingCount}</p>
          </div>
        </div>

        <div className="space-y-5">
          {stores?.map((store) => (
            <section key={store.id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{store.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {store.category || "カテゴリー未設定"}
                    {store.address ? ` ・ ${store.address}` : ""}
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                  {statusLabels[store.listing_status] ?? store.listing_status}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                公開状態：{store.is_published ? "公開中" : "非公開"}
              </p>

              {store.listing_status_note && (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                  現在のメモ：{store.listing_status_note}
                </p>
              )}

              <form action={changeListingStatus} className="mt-5 space-y-3">
                <input type="hidden" name="id" value={store.id} />

                <label className="block text-sm font-medium">
                  管理メモ
                  <textarea
                    name="note"
                    defaultValue={store.listing_status_note ?? ""}
                    rows={2}
                    placeholder="承認理由・却下理由など"
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    name="status"
                    value="approved"
                    type="submit"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    承認
                  </button>

                  <button
                    name="status"
                    value="rejected"
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    却下
                  </button>

                  <button
                    name="status"
                    value="suspended"
                    type="submit"
                    className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    掲載停止
                  </button>

                  <button
                    name="status"
                    value="inquiry_pending"
                    type="submit"
                    className="rounded-lg border px-4 py-2 text-sm font-semibold"
                  >
                    確認待ちに戻す
                  </button>
                </div>
              </form>
            </section>
          ))}

          {stores?.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500">
              まだ掲載申請はないよ。
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
