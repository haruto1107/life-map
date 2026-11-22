
import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params.error === "login";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f5f7fb",
        color: "#172033",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "36px",
          background: "#fff",
          borderRadius: "20px",
          border: "1px solid #e5eaf2",
        }}
      >
        <h1 style={{ fontSize: "30px", margin: 0 }}>LIFE MAP</h1>
        <p style={{ color: "#64748b", marginTop: "8px" }}>
          運営管理システム
        </p>

        <h2 style={{ fontSize: "21px", marginTop: "32px" }}>
          管理者ログイン
        </h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          登録済みの管理者アカウントでログインしてね。
        </p>

        {hasError && (
          <p
            role="alert"
            style={{
              padding: "12px",
              background: "#fff1f0",
              color: "#b42318",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            ログインできなかったよ。入力内容を確認してね。
          </p>
        )}

        <form action={login}>
          <label
            htmlFor="email"
            style={{ display: "block", marginTop: "24px", fontSize: "14px" }}
          >
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            style={{
              width: "100%",
              padding: "13px",
              marginTop: "8px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
            }}
          />

          <label
            htmlFor="password"
            style={{ display: "block", marginTop: "20px", fontSize: "14px" }}
          >
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              padding: "13px",
              marginTop: "8px",
              border: "1px solid #cbd5e1",
              borderRadius: "9px",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: "28px",
              padding: "14px",
              border: "none",
              borderRadius: "9px",
              background: "#809CCF",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ログイン
          </button>
        </form>

        <p
          style={{
            marginTop: "28px",
            textAlign: "center",
            fontSize: "12px",
            color: "#94a3b8",
          }}
        >
          LIFE MAP Administration System
        </p>
      </section>
    </main>
  );
}
