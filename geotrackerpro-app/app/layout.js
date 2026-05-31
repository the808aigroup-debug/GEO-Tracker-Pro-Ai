import "./globals.css";

export const metadata = {
  title: "GeoTrackerPro — Free AI Search (GEO) Audit",
  description:
    "Score any website on how well it's optimized to be cited and recommended by AI search engines like ChatGPT, Claude, Perplexity, and Gemini.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
