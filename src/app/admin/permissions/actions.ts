"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/admin";

export async function changeListingStatus(formData: FormData) {
  const { supabase } = await requirePlatformAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  const allowed = [
    "approved",
    "rejected",
    "suspended",
    "inquiry_pending",
  ];

  if (!id || !allowed.includes(status)) {
    throw new Error("入力内容が正しくありません。");
  }

  const { error } = await supabase
    .from("stores")
    .update({
      listing_status: status,
      listing_status_note: note || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/admin/stores");
  revalidatePath("/admin/permissions");
  revalidatePath("/admin/audit");
}
