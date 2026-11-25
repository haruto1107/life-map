"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/admin";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("管理用Supabase Secret Keyが設定されていないよ。");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function inviteAccount(formData: FormData) {
  await requirePlatformAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("メールアドレスを確認してね。");
  }

  const admin = getAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);

  if (error || !data.user) {
    throw new Error(error?.message ?? "招待に失敗したよ。");
  }

  const { error: roleError } = await admin.auth.admin.updateUserById(
    data.user.id,
    {
      app_metadata: {
        ...data.user.app_metadata,
        role: "staff",
        platform_role: "staff",
      },
    }
  );

  if (roleError) throw new Error(roleError.message);

  revalidatePath("/admin/accounts");
}

export async function changeAccountRole(formData: FormData) {
  const { userId: actorId } = await requirePlatformAdmin();

  const targetId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "");

  if (!targetId || !["admin", "staff"].includes(role)) {
    throw new Error("入力内容が正しくないよ。");
  }

  if (targetId === actorId) {
    throw new Error("自分自身の権限はここから変更できないよ。");
  }

  const admin = getAdminClient();

  const { data: users, error: listError } =
    await admin.auth.admin.listUsers({ page: 1, perPage: 100 });

  if (listError) throw new Error(listError.message);

  const target = users.users.find((user) => user.id === targetId);

  if (!target) {
    throw new Error("対象アカウントが見つからないよ。");
  }

  const { error } = await admin.auth.admin.updateUserById(targetId, {
    app_metadata: {
      ...target.app_metadata,
      role,
      platform_role: role,
    },
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/accounts");
}
