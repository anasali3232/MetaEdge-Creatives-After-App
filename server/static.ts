import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { storage } from "./storage";

let cachedScripts: { head: string; body: string } = { head: "", body: "" };
let lastFetch = 0;
const CACHE_TTL = 60000;

async function getTrackingScripts(): Promise<{ head: string; body: string }> {
  const now = Date.now();
  if (lastFetch > 0 && now - lastFetch < CACHE_TTL) {
    return cachedScripts;
  }
  try {
    const keys = ["gtm_head", "fb_pixel", "custom_head_scripts", "gtm_body"];
    const results = await Promise.all(keys.map((k) => storage.getSetting(k)));
    const gtmHead = results[0]?.value || "";
    const fbPixel = results[1]?.value || "";
    const customHead = results[2]?.value || "";
    const gtmBody = results[3]?.value || "";

    cachedScripts = {
      head: [gtmHead, fbPixel, customHead].filter(Boolean).join("\n"),
      body: gtmBody,
    };
    lastFetch = now;
  } catch {
    // ignore errors, serve without scripts
  }
  return cachedScripts;
}

export function clearTrackingCache() {
  lastFetch = 0;
  cachedScripts = { head: "", body: "" };
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const indexPath = path.resolve(distPath, "index.html");
  const baseHtml = fs.readFileSync(indexPath, "utf-8");

  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
    })
  );

  app.use(
    express.static(distPath, {
      maxAge: "1h",
      etag: true,
      lastModified: true,
      index: false,
    })
  );

  app.use("/{*path}", async (req, res, next) => {
    if (req.path === "/sitemap.xml" || req.path === "/robots.txt") {
      return next();
    }
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Content-Type", "text/html");

    const scripts = await getTrackingScripts();

    let html = baseHtml;
    if (scripts.head) {
      html = html.replace("</head>", `${scripts.head}\n</head>`);
    }
    if (scripts.body) {
      html = html.replace("<body>", `<body>\n${scripts.body}`);
    }

    res.send(html);
  });
}
