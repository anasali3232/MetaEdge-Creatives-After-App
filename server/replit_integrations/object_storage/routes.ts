import type { Express, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function registerObjectStorageRoutes(app: Express): void {
  app.post("/api/uploads/request-url", (req: Request, res: Response) => {
    const uploadId = randomUUID();
    const ext = req.body?.name ? path.extname(req.body.name) : "";
    const filename = `${uploadId}${ext}`;
    const uploadPath = path.join(UPLOADS_DIR, filename);

    res.json({
      uploadURL: `/api/uploads/file/${filename}`,
      objectPath: `/objects/uploads/${filename}`,
      metadata: { name: req.body?.name, size: req.body?.size, contentType: req.body?.contentType },
    });
  });

  app.put("/api/uploads/file/:filename", (req: Request, res: Response) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on("finish", () => {
      const objectPath = `/objects/uploads/${filename}`;
      res.json({ objectPath, url: objectPath });
    });

    writeStream.on("error", (err) => {
      console.error("File upload error:", err);
      res.status(500).json({ error: "Failed to save file" });
    });
  });

  app.get("/objects/:dir/:id", (req: Request, res: Response) => {
    const filePath = path.join(UPLOADS_DIR, req.params.id);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Object not found" });
    }
    res.sendFile(filePath);
  });
}
