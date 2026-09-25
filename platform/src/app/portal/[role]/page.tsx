import { notFound } from "next/navigation";
import { PORTALS } from "@/lib/portals";
import { ROLES, type Role } from "@/lib/rbac";

export default async function PortalPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!ROLES.includes(role as Role)) notFound();

  const portal = PORTALS[role as Role];
  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "280px 1fr" }}>
      <aside style={{ background: "#081c2b", color: "white", padding: 24 }}>
        <div style={{ fontWeight: 800, marginBottom: 28 }}>Savrdh Credit</div>
        <div style={{ fontSize: 13, opacity: .65, marginBottom: 12 }}>{portal.label}</div>
        <nav style={{ display: "grid", gap: 8 }}>
          {portal.modules.map((module) => (
            <div key={module} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.06)" }}>{module}</div>
          ))}
        </nav>
      </aside>
      <section style={{ padding: 32 }}>
        <h1>{portal.label}</h1>
        <p>Role-scoped workspace scaffold. Live data views will bind to PostgreSQL repositories and server-side permission checks.</p>
      </section>
    </main>
  );
}
