
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect("/login");

  const claims = data.claims as {
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

  return supabase;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function refreshPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/stores");
  revalidatePath("/admin/permissions");
  revalidatePath("/admin/audit");
}

export async function createStore(formData: FormData) {
  const supabase = await requireAdmin();

  const name = value(formData, "name");
  if (!name) throw new Error("店舗名を入力してください。");

  const { error } = await supabase.from("stores").insert({
    name,
    category: value(formData, "category") || null,
    address: value(formData, "address") || null,
    phone: value(formData, "phone") || null,
    website_url: value(formData, "website_url") || null,
    description: value(formData, "description") || null,
    is_published: false,
    is_active: true,
    listing_status: "not_requested",
  });

  if (error) throw new Error(`店舗登録に失敗しました：${error.message}`);

  refreshPages();
}

export async function updateStore(formData: FormData) {
  const supabase = await requireAdmin();

  const id = value(formData, "id");
  const name = value(formData, "name");

  if (!id || !name) {
    throw new Error("店舗IDと店舗名は必須です。");
  }

  const { error } = await supabase
    .from("stores")
    .update({
      name,
      category: value(formData, "category") || null,
      address: value(formData, "address") || null,
      phone: value(formData, "phone") || null,
      website_url: value(formData, "website_url") || null,
      description: value(formData, "description") || null,
    })
    .eq("id", id);

  if (error) throw new Error(`店舗更新に失敗しました：${error.message}`);

  refreshPages();
}

export async function toggleStoreActive(formData: FormData) {
  const supabase = await requireAdmin();

  const id = value(formData, "id");
  const nextActive = value(formData, "next_active") === "true";

  if (!id) throw new Error("店舗IDがありません。");

  const { error } = await supabase
    .from("stores")
    .update({ is_active: nextActive })
    .eq("id", id);

  if (error) throw new Error(`店舗状態の変更に失敗しました：${error.message}`);

  refreshPages();
}

export async function toggleStorePublication(formData: FormData) {
  const supabase = await requireAdmin();

  const id = value(formData, "id");
  const nextPublished = value(formData, "next_published") === "true";

  if (!id) throw new Error("店舗IDがありません。");

  // 公開する場合は、承認済みかつ有効な店舗であることを再確認
  if (nextPublished) {
    const { data: store, error: readError } = await supabase
      .from("stores")
      .select("listing_status, is_active")
      .eq("id", id)
      .single();

    if (readError || !store) {
      throw new Error("店舗情報を確認できませんでした。");
    }

    if (store.listing_status !== "approved") {
      throw new Error("承認済みの店舗だけ公開できます。");
    }

    if (!store.is_active) {
      throw new Error("無効状態の店舗は公開できません。");
    }
  }

  const { error } = await supabase
    .from("stores")
    .update({ is_published: nextPublished })
    .eq("id", id);

  if (error) throw new Error(`公開状態の変更に失敗しました：${error.message}`);

  refreshPages();
}
