import { PORTALS } from "@/lib/portals";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: 0, fontWeight: 700, color: "#997228" }}>SAVRDH FINANCIAL SERVICES</p>
        <h1 style={{ fontSize: 42, margin: "8px 0 12px" }}>Savrdh Credit Platform</h1>
        <p style={{ maxWidth: 760, color: "#596674", lineHeight: 1.6 }}>
          Modular financial CRM and digital credit marketplace. Portal access is role controlled and financial completion remains Finance verified.
        </p>
      </div>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
        {Object.values(PORTALS).map((portal) => (
          <article key={portal.role} style={{ background: "white", border: "1px solid #dde3e8", borderRadius: 16, padding: 20 }}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>{portal.label}</h2>
            <p style={{ color: "#6a7682", minHeight: 48 }}>{portal.modules.slice(0, 4).join(" • ")}</p>
            <code style={{ fontSize: 12 }}>{portal.path}</code>
          </article>
        ))}
      </section>
    </main>
  );
}
