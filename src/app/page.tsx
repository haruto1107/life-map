
export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      padding: "48px 24px",
      maxWidth: "1100px",
      margin: "0 auto"
    }}>
      <header style={{ marginBottom: "64px" }}>
        <h1 style={{ fontSize: "32px", margin: 0 }}>
          LIFE MAP
        </h1>
        <p style={{ color: "#64748b" }}>
          お店の今が、行く前にわかる。
        </p>
      </header>

      <section>
        <h2 style={{ fontSize: "36px" }}>
          お店の今を、もっと身近に。
        </h2>
        <p style={{ color: "#64748b", lineHeight: 1.8 }}>
          混雑状況や商品の在庫状況を、来店前に確認できるプラットフォーム。
        </p>
        <div style={{ marginTop: "32px" }}>
          <a href="#search" style={{
            background: "#2563eb",
            color: "white",
            padding: "14px 24px",
            borderRadius: "10px",
            display: "inline-block"
          }}>
            お店を探す
          </a>
        </div>
      </section>

      <section id="search" style={{ marginTop: "100px" }}>
        <h2>お店を探す</h2>
        <p style={{ color: "#64748b" }}>
          現在、サービスを準備中です。
        </p>
      </section>

      <footer style={{
        marginTop: "120px",
        padding: "24px 0",
        borderTop: "1px solid #e2e8f0",
        color: "#94a3b8",
        fontSize: "13px"
      }}>
        © 2026 LIFE MAP
      </footer>
    </main>
  );
}
