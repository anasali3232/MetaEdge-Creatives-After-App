import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { setupChatWebSocket } from "./chat-ws";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

if (process.env.NODE_ENV === "production") {
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

registerObjectStorageRoutes(app);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (process.env.NODE_ENV !== "production" && capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse).slice(0, 200)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Auto-migrate: create missing tables and add missing columns before Drizzle queries run
  try {
    const mysql = await import("mysql2/promise");
    const migrationPool = mysql.createPool(process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL!);
    const dbName = (process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL || "").match(/\/([^/?]+)(\?|$)/)?.[1] || "metaedge";

    // Create tables that may not exist yet
    const createTables = [
      `CREATE TABLE IF NOT EXISTS activity_heartbeats (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        last_active TIMESTAMP NOT NULL,
        app_name VARCHAR(255),
        window_title TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS screenshots (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        image_data LONGTEXT NOT NULL,
        app_name VARCHAR(255),
        window_title TEXT,
        captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS weekly_reports (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        team_id VARCHAR(36) NOT NULL,
        week_start VARCHAR(10) NOT NULL,
        week_end VARCHAR(10) NOT NULL,
        accomplishments TEXT NOT NULL,
        challenges TEXT,
        next_week_plan TEXT,
        hours_worked INT,
        pdf_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS monthly_reports (
        id VARCHAR(36) PRIMARY KEY,
        employee_id VARCHAR(36) NOT NULL,
        team_id VARCHAR(36) NOT NULL,
        month VARCHAR(7) NOT NULL,
        summary TEXT,
        achievements TEXT,
        challenges TEXT,
        goals_next_month TEXT,
        total_hours INT,
        tasks_completed INT,
        pdf_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
    ];

    for (const sql of createTables) {
      try {
        await migrationPool.query(sql);
      } catch (e: any) {
        console.log("Table creation notice:", e.message);
      }
    }
    log("Database tables verified", "migration");

    // Add any missing columns to existing tables
    const columnChecks = [
      { table: "employees", column: "description", sql: "ALTER TABLE employees ADD COLUMN description TEXT" },
      { table: "monthly_reports", column: "pdf_url", sql: "ALTER TABLE monthly_reports ADD COLUMN pdf_url TEXT" },
      { table: "weekly_reports", column: "pdf_url", sql: "ALTER TABLE weekly_reports ADD COLUMN pdf_url TEXT" },
      { table: "weekly_reports", column: "updated_at", sql: "ALTER TABLE weekly_reports ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL" },
      { table: "monthly_reports", column: "updated_at", sql: "ALTER TABLE monthly_reports ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL" },
    ];

    for (const check of columnChecks) {
      try {
        const [rows]: any = await migrationPool.query(
          "SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
          [dbName, check.table, check.column]
        );
        if (rows[0]?.cnt === 0) {
          await migrationPool.query(check.sql);
          log(`Added column ${check.column} to ${check.table}`, "migration");
        }
      } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.log(`Migration notice (${check.table}.${check.column}):`, e.message);
        }
      }
    }

    await migrationPool.end();
    log("Database columns verified", "migration");
  } catch (e: any) {
    console.log("Migration check skipped:", e.message);
  }

  await storage.seedSuperAdmin();
  await storage.seedDefaultPages();
  await registerRoutes(httpServer, app);
  setupChatWebSocket(httpServer);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
