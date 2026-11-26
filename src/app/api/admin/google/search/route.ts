
import { createClient } from "@/lib/supabase/server";
import { searchGooglePlaces } from "@/lib/integrations/google/places";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 同一オリジンからのリクエストのみ許可
    const origin = request.headers.get("origin");
    const requestOrigin = new URL(request.url).origin;

    if (origin && origin !== requestOrigin) {
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 管理者認証
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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
      return Response.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 検索ワードの検証
    const body = await request.json() as {
      query?: unknown;
    };

    if (
      typeof body.query !== "string" ||
      body.query.trim().length < 2 ||
      body.query.trim().length > 100
    ) {
      return Response.json(
        { error: "検索ワードは2〜100文字で入力してください。" },
        { status: 400 }
      );
    }

    // Cloudflare WorkerのSecretを取得
    const { env } = getCloudflareContext();

    const apiKey = (
      env as { GOOGLE_MAPS_API_KEY?: string }
    ).GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Maps API key is missing.");
    }

    // Google Places APIで店舗検索
    const places = await searchGooglePlaces(
      body.query.trim(),
      apiKey
    );

    return Response.json({
      success: true,
      count: places.length,
      places,
    });

  } catch (error) {
    // エラーの詳細をサーバーログに記録
    console.error("[Google Places Search Error]", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error
        ? error.message
        : String(error),
    });

    return Response.json(
      { error: "店舗検索に失敗しました。" },
      { status: 500 }
    );
  }
}
