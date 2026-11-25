"use server";

import { revalidatePath } from "next/cache";
import { requirePlatformAdmin } from "@/lib/admin";

function field(data: FormData, key: string) {
  return String(data.get(key) ?? "").trim();
}

export async function createEmailTemplate(data: FormData) {
  const { supabase } = await requirePlatformAdmin();

  const name = field(data, "name");
  const subject = field(data, "subject_template");
  const body = field(data, "body_template");

  if (!name || !subject || !body) {
    throw new Error("テンプレート名・件名・本文を入力してね。");
  }

  const { error } = await supabase.from("email_templates").insert({
    name,
    subject_template: subject,
    body_template: body,
    is_active: true,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/email");
}

export async function createEmailDraft(data: FormData) {
  const { supabase } = await requirePlatformAdmin();

  const recipient = field(data, "recipient_email");
  const subject = field(data, "subject");
  const body = field(data, "body_text");
  const storeId = field(data, "store_id");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error("メールアドレスを確認してね。");
  }

  if (!subject || !body) {
    throw new Error("件名と本文を入力してね。");
  }

  const { data: thread, error: threadError } = await supabase
    .from("email_threads")
    .insert({
      store_id: storeId || null,
      recipient_email: recipient,
      subject,
      status: "open",
    })
    .select("id")
    .single();

  if (threadError || !thread) {
    throw new Error(threadError?.message ?? "メールスレッドを作成できなかったよ。");
  }

  const { error: messageError } = await supabase
    .from("email_messages")
    .insert({
      thread_id: thread.id,
      direction: "outbound",
      body_text: body,
      delivery_status: "draft",
    });

  if (messageError) {
    throw new Error(
      `下書き本文の保存に失敗したよ。スレッドID：${thread.id} / ${messageError.message}`
    );
  }

  revalidatePath("/admin/email");
}
