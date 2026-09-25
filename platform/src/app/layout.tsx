import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Inter, ui-sans-serif, system-ui", background: "#f4f6f8", color: "#12202f" }}>
        {children}
      </body>
    </html>
  );
}
