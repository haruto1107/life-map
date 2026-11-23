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

export async function changeListingStatus(formData: FormData) {
  const supabase = await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const note = String(formData.get("note") || "").trim();

  const allowedStatuses = [
    "approved",
    "rejected",
    "suspended",
    "inquiry_pending",
  ];

  if (!id || !allowedStatuses.includes(status)) {
    throw new Error("入力内容が正しくありません。");
  }

  const { error } = await supabase
    .from("stores")
    .update({
      listing_status: status,
      listing_status_note: note || null,
      is_published: false,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/permissions");
  revalidatePath("/admin/stores");
  revalidatePath("/admin");
}
