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

export async function updateStore(formData: FormData) {
  const supabase = await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("店舗IDがありません。");

  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("店舗名を入力してください。");

  const { error } = await supabase
    .from("stores")
    .update({
      name,
      category: String(formData.get("category") || "").trim() || null,
      address: String(formData.get("address") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
      website_url: String(formData.get("website_url") || "").trim() || null,
      description: String(formData.get("description") || "").trim() || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/stores");
  revalidatePath("/admin/permissions");
}
