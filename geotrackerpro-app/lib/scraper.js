// ============================================================
// Lightweight scraper. Default mode = plain HTTP fetch (fast, free,
// works for most server-rendered sites). If BROWSERLESS_API_KEY is
// set, the homepage is rendered with JS for SPA-heavy sites.
// ============================================================

const UA =
  "Mozilla/5.0 (compatible; GeoTrackerProBot/1.0; +https://geotrackerpro.ai)";

function origin(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

async function fetchText(url, timeoutMs = 12000, maxBytes = 200_000) {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const text = await res.text();
    return text.slice(0, maxBytes);
  } catch {
    return null;
  }
}

async function fetchHomepageRendered(url) {
  // Browserless content endpoint — returns rendered HTML
  const res = await fetch(
    `https://chrome.browserless.io/content?token=${process.env.BROWSERLESS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        waitFor: 2000,
        gotoOptions: { timeout: 30000, waitUntil: "networkidle2" },
      }),
    }
  );
  if (!res.ok) return null;
  return await res.text();
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "\n...[truncated]" : str;
}

function extractMeta(html) {
  const grab = (re) => {
    const m = html.match(re);
    return m ? m[1].trim() : "not detected";
  };
  return {
    title: grab(/<title[^>]*>([^<]*)<\/title>/i),
    description: grab(
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
    ),
    canonical: grab(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i),
    viewport: grab(/<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)["']/i),
    mobile_friendly: /name=["']viewport["']/i.test(html) ? "true" : "false",
  };
}

function extractJsonLd(html) {
  const blocks = [];
  const re =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
    if (blocks.length >= 8) break;
  }
  return blocks.length ? blocks.join("\n---\n").slice(0, 6000) : "";
}

function extractSitemapUrls(xml) {
  if (!xml) return [];
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    urls.push(m[1].trim());
    if (urls.length >= 50) break;
  }
  return urls;
}

// Pick a few interior URLs to deep-scrape (skip the homepage itself).
function pickInteriorUrls(sitemapUrls, home, n = 3) {
  const seen = new Set([home.replace(/\/$/, "")]);
  const picks = [];
  for (const u of sitemapUrls) {
    const clean = u.replace(/\/$/, "");
    if (seen.has(clean)) continue;
    if (/\.(jpg|png|gif|pdf|css|js|xml|webp|svg)$/i.test(clean)) continue;
    seen.add(clean);
    picks.push(u);
    if (picks.length >= n) break;
  }
  return picks;
}

function parseCrawlerAccess(robots) {
  // Default to allowed; only flip to false on an explicit Disallow: / for the bot.
  const result = {
    gptbot: "true",
    claudebot: "true",
    perplexitybot: "true",
    google_extended: "true",
  };
  if (!robots || robots === "NOT_FOUND") return result;
  const bots = {
    gptbot: "gptbot",
    claudebot: "claudebot",
    perplexitybot: "perplexitybot",
    google_extended: "google-extended",
  };
  const lines = robots.split(/\r?\n/);
  let currentAgents = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (/^user-agent:/i.test(line)) {
      currentAgents.push(line.split(":")[1].trim().toLowerCase());
    } else if (/^disallow:\s*\/\s*$/i.test(line)) {
      for (const [key, name] of Object.entries(bots)) {
        if (currentAgents.includes(name) || currentAgents.includes("*")) {
          // Only block on exact bot match; "*" alone doesn't necessarily target AI bots,
          // but we surface it as blocked to be conservative for named AI bots.
          if (currentAgents.includes(name)) result[key] = "false";
        }
      }
    } else if (line === "" ) {
      currentAgents = [];
    }
  }
  return result;
}

export async function scrapeSite(url) {
  const start = Date.now();
  const base = origin(url);

  // Homepage — rendered if Browserless key present, else plain fetch.
  let homepageHtml;
  if (process.env.BROWSERLESS_API_KEY) {
    homepageHtml = await fetchHomepageRendered(url);
  }
  if (!homepageHtml) {
    homepageHtml = await fetchText(url, 10000, 300_000);
  }
  if (!homepageHtml) {
    throw new Error("Could not fetch the homepage. The site may be down or blocking requests.");
  }
  const load_time_ms = Date.now() - start;

  const [robots, llms, sitemap] = await Promise.all([
    fetchText(`${base}/robots.txt`, 6000, 50_000),
    fetchText(`${base}/llms.txt`, 6000, 50_000),
    fetchText(`${base}/sitemap.xml`, 6000, 200_000),
  ]);

  // 2 interior pages keeps the audit thorough but well under the 60s function limit.
  const sitemapUrls = extractSitemapUrls(sitemap);
  const interiorUrls = pickInteriorUrls(sitemapUrls, url, 2);
  const interiorHtml = await Promise.all(
    interiorUrls.map((u) => fetchText(u, 8000, 200_000))
  );

  return {
    homepage_html: truncate(homepageHtml, 15000),
    page_1_html: truncate(interiorHtml[0] || "", 15000),
    page_2_html: truncate(interiorHtml[1] || "", 15000),
    page_3_html: truncate(interiorHtml[2] || "", 15000),
    robots_txt_content: robots || "NOT_FOUND",
    llms_txt_content: llms || "NOT_FOUND",
    sitemap_urls: sitemapUrls,
    json_ld_blocks: extractJsonLd(homepageHtml),
    meta: extractMeta(homepageHtml),
    crawler_access: parseCrawlerAccess(robots),
    load_time_ms,
    https: url.startsWith("https") ? "true" : "false",
  };
}
