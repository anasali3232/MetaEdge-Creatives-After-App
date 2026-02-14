import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertBlogPostSchema, insertCareerSchema, insertSiteSettingSchema, insertTeamMemberSchema, insertAdminUserSchema, updateAdminUserSchema, insertPageMetaSchema, insertNewsletterSubscriberSchema, clientSignupSchema, clientLoginSchema, clientProfileUpdateSchema, createTicketSchema, insertJobApplicationSchema, insertFaqSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { JWT_SECRET } from "./jwt-config";
import { sendNotificationEmail, sendEmailTo, type EmailSignatureType } from "./resend-email";
import { clearTrackingCache } from "./static";
import { registerTeamPortalRoutes } from "./team-portal-routes";

interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface ClientJwtPayload {
  clientId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: JwtPayload;
      clientUser?: ClientJwtPayload;
    }
  }
}

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.adminUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.adminUser.role === "super_admin") {
      return next();
    }
    const hasPermission = permissions.some(p => req.adminUser!.permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.adminUser || req.adminUser.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
}

async function sendAdminNotification_DEPRECATED(subject: string, htmlContent: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Admin notification (email not configured):", subject);
    return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `"MetaEdge Admin Portal" <${process.env.SMTP_USER}>`,
      to: "wmisaw99@gmail.com",
      subject,
      html: htmlContent,
    });
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}

function clientAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ClientJwtPayload;
    if (!decoded.clientId) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.clientUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await res.json() as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerObjectStorageRoutes(app);
  registerTeamPortalRoutes(app);

  app.post("/api/contact", async (req, res) => {
    try {
      const { turnstileToken } = req.body;
      if (!await verifyTurnstile(turnstileToken)) {
        return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      }
      const result = insertContactMessageSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid form data", 
          details: result.error.issues 
        });
      }

      const { name, email, phone, company, subject, message } = result.data;

      const savedMessage = await storage.saveContactMessage(result.data);

      sendNotificationEmail(
        subject || `New Contact Form Submission from ${name}`,
        `<h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Company:</strong> ${company || "Not provided"}</p>
        <p><strong>Subject:</strong> ${subject || "Not provided"}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, "<br>")}</p>`
      );

      res.json({ success: true, message: "Message received successfully. We'll get back to you soon!" });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to process your message. Please try again." });
    }
  });

  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.setHeader("Cache-Control", "public, max-age=300");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post || !post.published) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // ===== AUTH =====
  app.post("/api/admin/login", async (req, res) => {
    const { email, password, turnstileToken } = req.body;
    if (!await verifyTurnstile(turnstileToken)) {
      return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
    }
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    try {
      const user = await storage.getAdminUserByEmail(email);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions ?? [],
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/admin/me", adminAuth, async (req, res) => {
    try {
      const user = await storage.getAdminUserById(req.adminUser!.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ===== ADMIN USERS MANAGEMENT (super_admin only) =====
  app.get("/api/admin/users", adminAuth, requireSuperAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllAdminUsers();
      res.json(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        permissions: u.permissions,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin/users", adminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const result = insertAdminUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid user data", details: result.error.issues });
      }
      const existing = await storage.getAdminUserByEmail(result.data.email);
      if (existing) {
        return res.status(409).json({ error: "A user with this email already exists" });
      }
      const hash = await bcrypt.hash(result.data.password, 10);
      const user = await storage.createAdminUser(
        result.data.email,
        result.data.name,
        hash,
        result.data.role || "admin",
        result.data.permissions || []
      );
      sendNotificationEmail(
        "New Admin User Created",
        `<h2>New Admin User Created</h2>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Permissions:</strong> ${(user.permissions || []).join(", ") || "None"}</p>
        <p><strong>Created by:</strong> ${req.adminUser!.email}</p>`
      );
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Create admin user error:", error);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });

  app.patch("/api/admin/users/:id", adminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const result = updateAdminUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid update data", details: result.error.issues });
      }
      const targetUser = await storage.getAdminUserById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const updateData: Record<string, any> = {};
      if (result.data.name !== undefined) updateData.name = result.data.name;
      if (result.data.email !== undefined) updateData.email = result.data.email;
      if (result.data.role !== undefined) updateData.role = result.data.role;
      if (result.data.permissions !== undefined) updateData.permissions = result.data.permissions;
      if (result.data.isActive !== undefined) updateData.isActive = result.data.isActive;
      if (result.data.password) {
        updateData.passwordHash = await bcrypt.hash(result.data.password, 10);
      }

      const updated = await storage.updateAdminUser(req.params.id, updateData);
      if (!updated) {
        return res.status(404).json({ error: "User not found" });
      }

      const changes: string[] = [];
      if (result.data.name) changes.push(`Name: ${result.data.name}`);
      if (result.data.email) changes.push(`Email: ${result.data.email}`);
      if (result.data.role) changes.push(`Role: ${result.data.role}`);
      if (result.data.permissions) changes.push(`Permissions: ${result.data.permissions.join(", ")}`);
      if (result.data.isActive !== undefined) changes.push(`Active: ${result.data.isActive}`);
      if (result.data.password) changes.push("Password was changed");

      sendNotificationEmail(
        `Admin User Updated: ${targetUser.name}`,
        `<h2>Admin User Updated</h2>
        <p><strong>User:</strong> ${targetUser.name} (${targetUser.email})</p>
        <p><strong>Changes:</strong></p>
        <ul>${changes.map(c => `<li>${c}</li>`).join("")}</ul>
        <p><strong>Updated by:</strong> ${req.adminUser!.email}</p>`
      );

      res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        permissions: updated.permissions,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
      });
    } catch (error) {
      console.error("Update admin user error:", error);
      res.status(500).json({ error: "Failed to update admin user" });
    }
  });

  app.delete("/api/admin/users/:id", adminAuth, requireSuperAdmin, async (req, res) => {
    try {
      const targetUser = await storage.getAdminUserById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }
      if (targetUser.role === "super_admin") {
        return res.status(403).json({ error: "Cannot delete super admin account" });
      }
      const deleted = await storage.deleteAdminUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      sendNotificationEmail(
        `Admin User Deleted: ${targetUser.name}`,
        `<h2>Admin User Deleted</h2>
        <p><strong>User:</strong> ${targetUser.name} (${targetUser.email})</p>
        <p><strong>Deleted by:</strong> ${req.adminUser!.email}</p>`
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete admin user" });
    }
  });

  // ===== CONTACT MESSAGES =====
  app.get("/api/admin/contact-messages", adminAuth, requirePermission("messages"), async (_req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", adminAuth, requirePermission("messages"), async (req, res) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // ===== BLOG =====
  app.get("/api/admin/blog", adminAuth, requirePermission("blog"), async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog", adminAuth, requirePermission("blog"), async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid blog data", details: result.error.issues });
      }
      const post = await storage.createBlogPost(result.data);
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.patch("/api/admin/blog/:id", adminAuth, requirePermission("blog"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const partialSchema = insertBlogPostSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid update data", details: result.error.issues });
      }
      const post = await storage.updateBlogPost(id, result.data);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", adminAuth, requirePermission("blog"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteBlogPost(id);
      if (!deleted) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // ===== CAREERS =====
  app.get("/api/careers", async (_req, res) => {
    try {
      const jobs = await storage.getPublishedCareers();
      res.setHeader("Cache-Control", "public, max-age=300");
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch careers" });
    }
  });

  app.get("/api/careers/:slug", async (req, res) => {
    try {
      const job = await storage.getCareerBySlug(req.params.slug);
      if (!job || !job.published) {
        return res.status(404).json({ error: "Job listing not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job listing" });
    }
  });

  app.get("/api/admin/careers", adminAuth, requirePermission("careers"), async (_req, res) => {
    try {
      const jobs = await storage.getAllCareers();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch careers" });
    }
  });

  app.post("/api/admin/careers", adminAuth, requirePermission("careers"), async (req, res) => {
    try {
      const result = insertCareerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid career data", details: result.error.issues });
      }
      const job = await storage.createCareer(result.data);
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to create job listing" });
    }
  });

  app.patch("/api/admin/careers/:id", adminAuth, requirePermission("careers"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const partialSchema = insertCareerSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid update data", details: result.error.issues });
      }
      const job = await storage.updateCareer(id, result.data);
      if (!job) {
        return res.status(404).json({ error: "Job listing not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to update job listing" });
    }
  });

  app.delete("/api/admin/careers/:id", adminAuth, requirePermission("careers"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteCareer(id);
      if (!deleted) {
        return res.status(404).json({ error: "Job listing not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete job listing" });
    }
  });

  // ===== SETTINGS =====
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getAllSettings();
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.key] = s.value; });
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json(map);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings", adminAuth, requirePermission("settings"), async (_req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", adminAuth, requirePermission("settings"), async (req, res) => {
    try {
      const entries = req.body as Record<string, string>;
      const results = [];
      for (const [key, value] of Object.entries(entries)) {
        const result = insertSiteSettingSchema.safeParse({ key, value: String(value) });
        if (result.success) {
          const saved = await storage.upsertSetting(result.data);
          results.push(saved);
        }
      }
      clearTrackingCache();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // ===== TEAM =====
  app.get("/api/team", async (_req, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.setHeader("Cache-Control", "public, max-age=300");
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/admin/team", adminAuth, requirePermission("team"), async (_req, res) => {
    try {
      const members = await storage.getAllTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/admin/team", adminAuth, requirePermission("team"), async (req, res) => {
    try {
      const result = insertTeamMemberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid team member data", details: result.error.issues });
      }
      const member = await storage.createTeamMember(result.data);
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.patch("/api/admin/team/:id", adminAuth, requirePermission("team"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const partialSchema = insertTeamMemberSchema.partial();
      const result = partialSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid update data", details: result.error.issues });
      }
      const member = await storage.updateTeamMember(id, result.data);
      if (!member) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.post("/api/admin/team/reorder", adminAuth, requirePermission("team"), async (req, res) => {
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items array required" });
      }
      for (const item of items) {
        if (!item.id || item.displayOrder === undefined) {
          return res.status(400).json({ error: "Each item needs id and displayOrder" });
        }
        await storage.updateTeamMember(item.id, { displayOrder: String(item.displayOrder) });
      }
      const updated = await storage.getAllTeamMembers();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder team members" });
    }
  });

  app.delete("/api/admin/team/:id", adminAuth, requirePermission("team"), async (req, res) => {
    try {
      const id = req.params.id as string;
      const deleted = await storage.deleteTeamMember(id);
      if (!deleted) {
        return res.status(404).json({ error: "Team member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  app.get("/api/page-meta", async (_req, res) => {
    try {
      const pages = await storage.getAllPageMeta();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page meta" });
    }
  });

  app.get("/api/page-meta/:slug", async (req, res) => {
    try {
      const slug = req.params.slug as string;
      const meta = await storage.getPageMeta(slug);
      if (!meta) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.setHeader("Cache-Control", "public, max-age=300");
      res.json(meta);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page meta" });
    }
  });

  app.get("/api/admin/pages", adminAuth, requirePermission("pages"), async (_req, res) => {
    try {
      const pages = await storage.getAllPageMeta();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.put("/api/admin/pages/:slug", adminAuth, requirePermission("pages"), async (req, res) => {
    try {
      const slug = req.params.slug as string;
      const data = { ...req.body, pageSlug: slug };
      const result = insertPageMetaSchema.safeParse(data);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error.issues });
      }
      const updated = await storage.upsertPageMeta(result.data);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update page meta" });
    }
  });

  app.post("/api/admin/pages", adminAuth, requirePermission("pages"), async (req, res) => {
    try {
      const result = insertPageMetaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid data", details: result.error.issues });
      }
      const created = await storage.upsertPageMeta(result.data);
      res.json(created);
    } catch (error) {
      res.status(500).json({ error: "Failed to create page" });
    }
  });

  app.delete("/api/admin/pages/:id", adminAuth, requirePermission("pages"), async (req, res) => {
    try {
      const deleted = await storage.deletePageMeta(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Newsletter - Public subscribe
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { turnstileToken } = req.body;
      if (!await verifyTurnstile(turnstileToken)) {
        return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      }
      const result = insertNewsletterSubscriberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      const normalizedEmail = result.data.email.toLowerCase().trim();
      const existing = await storage.getNewsletterSubscriberByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: "This email is already subscribed" });
      }
      const subscriber = await storage.addNewsletterSubscriber({ email: normalizedEmail });
      res.json({ success: true, message: "Successfully subscribed to newsletter!" });
    } catch (error) {
      res.status(500).json({ error: "Failed to subscribe. Please try again." });
    }
  });

  // Newsletter - Admin routes
  app.get("/api/admin/newsletter", adminAuth, requirePermission("settings"), async (_req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.delete("/api/admin/newsletter/:id", adminAuth, requirePermission("settings"), async (req, res) => {
    try {
      const deleted = await storage.deleteNewsletterSubscriber(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ error: "Subscriber not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subscriber" });
    }
  });

  // ===== CLIENT AUTH ROUTES =====
  app.post("/api/client/signup", async (req, res) => {
    try {
      const { turnstileToken } = req.body;
      if (!await verifyTurnstile(turnstileToken)) {
        return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      }
      const result = clientSignupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid signup data", details: result.error.issues });
      }
      const existing = await storage.getClientByEmail(result.data.email);
      if (existing) {
        return res.status(409).json({ error: "An account with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(result.data.password, 10);
      const client = await storage.createClient({
        email: result.data.email,
        name: result.data.name,
        passwordHash,
      });
      const payload: ClientJwtPayload = { clientId: client.id, email: client.email };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        success: true,
        token,
        client: {
          id: client.id,
          email: client.email,
          name: client.name,
          avatarUrl: client.avatarUrl,
          bio: client.bio,
          phone: client.phone,
          company: client.company,
          isActive: client.isActive,
          createdAt: client.createdAt,
        },
      });
    } catch (error) {
      console.error("Client signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });

  app.post("/api/client/login", async (req, res) => {
    try {
      const { turnstileToken } = req.body;
      if (!await verifyTurnstile(turnstileToken)) {
        return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      }
      const result = clientLoginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid login data", details: result.error.issues });
      }
      const client = await storage.getClientByEmail(result.data.email);
      if (!client || !client.isActive) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (!client.passwordHash) {
        return res.status(401).json({ error: "Please use Google login for this account" });
      }
      const valid = await bcrypt.compare(result.data.password, client.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      await storage.updateClient(client.id, { lastLoginAt: new Date() });
      const payload: ClientJwtPayload = { clientId: client.id, email: client.email };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        success: true,
        token,
        client: {
          id: client.id,
          email: client.email,
          name: client.name,
          avatarUrl: client.avatarUrl,
          bio: client.bio,
          phone: client.phone,
          company: client.company,
          isActive: client.isActive,
          createdAt: client.createdAt,
        },
      });
    } catch (error) {
      console.error("Client login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });


  app.post("/api/client/forgot-password", async (req, res) => {
    try {
      const { turnstileToken } = req.body;
      if (!await verifyTurnstile(turnstileToken)) {
        return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      }
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const client = await storage.getClientByEmail(email);
      if (!client) {
        return res.json({ success: true, message: "If an account exists with this email, a reset code has been sent." });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await storage.createPasswordResetToken(client.id, otpHash, expiresAt);

      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          await transporter.sendMail({
            from: `"MetaEdge Creatives" <${process.env.SMTP_USER}>`,
            to: client.email,
            subject: "Password Reset Code - MetaEdge Creatives",
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">MetaEdge Creatives</h1>
                  <p style="color: #a0aec0; margin: 8px 0 0; font-size: 14px;">Client Portal</p>
                </div>
                <div style="padding: 40px 30px;">
                  <h2 style="color: #1a1a2e; margin: 0 0 16px; font-size: 22px;">Password Reset Request</h2>
                  <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px;">Hi ${client.name},</p>
                  <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px;">We received a request to reset your password. Use the verification code below to complete the process:</p>
                  <div style="background: #f7fafc; border: 2px dashed #0f3460; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 24px;">
                    <span style="font-size: 36px; font-weight: 700; color: #0f3460; letter-spacing: 8px;">${otp}</span>
                  </div>
                  <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">This code will expire in <strong>15 minutes</strong>. If you didn't request this, please ignore this email.</p>
                </div>
                <div style="background: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #a0aec0; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} MetaEdge Creatives. All rights reserved.</p>
                </div>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send password reset email:", emailError);
        }
      } else {
        console.log("Password reset OTP (email not configured):", otp, "for client:", client.email);
      }

      res.json({ success: true, message: "If an account exists with this email, a reset code has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  app.post("/api/client/reset-password", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const client = await storage.getClientByEmail(email);
      if (!client) {
        return res.status(400).json({ error: "Invalid reset request" });
      }
      const token = await storage.getValidPasswordResetToken(client.id);
      if (!token) {
        return res.status(400).json({ error: "Invalid or expired reset code" });
      }
      const validOtp = await bcrypt.compare(otp, token.otpHash);
      if (!validOtp) {
        return res.status(400).json({ error: "Invalid reset code" });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      const { clients: clientsTable } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      const { db } = await import("./db");
      await db.update(clientsTable).set({ passwordHash }).where(eq(clientsTable.id, client.id));
      await storage.markPasswordResetTokenUsed(token.id);
      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/client/me", clientAuth, async (req, res) => {
    try {
      const client = await storage.getClientById(req.clientUser!.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({
        id: client.id,
        email: client.email,
        name: client.name,
        avatarUrl: client.avatarUrl,
        bio: client.bio,
        phone: client.phone,
        company: client.company,
        isActive: client.isActive,
        createdAt: client.createdAt,
        lastLoginAt: client.lastLoginAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // ===== CLIENT PROFILE ROUTES =====
  app.put("/api/client/profile", clientAuth, async (req, res) => {
    try {
      const result = clientProfileUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid profile data", details: result.error.issues });
      }
      const updated = await storage.updateClient(req.clientUser!.clientId, result.data as any);
      if (!updated) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
        bio: updated.bio,
        phone: updated.phone,
        company: updated.company,
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        lastLoginAt: updated.lastLoginAt,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/client/services", clientAuth, async (req, res) => {
    try {
      const services = await storage.getClientServices(req.clientUser!.clientId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/client/tickets", clientAuth, async (req, res) => {
    try {
      const tickets = await storage.getClientTickets(req.clientUser!.clientId);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.post("/api/client/tickets", clientAuth, async (req, res) => {
    try {
      const result = createTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid ticket data", details: result.error.issues });
      }
      const { imageUrl } = req.body;
      const ticket = await storage.createTicket(req.clientUser!.clientId, result.data.subject, result.data.message, imageUrl || undefined);
      sendNotificationEmail(
        `New Support Ticket: ${result.data.subject}`,
        `<h2>New Support Ticket</h2>
        <p><strong>Subject:</strong> ${result.data.subject}</p>
        <p><strong>Client ID:</strong> ${req.clientUser!.clientId}</p>
        <h3>Message:</h3>
        <p>${result.data.message.replace(/\n/g, "<br>")}</p>`,
        "support"
      );
      res.json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  app.get("/api/client/tickets/:id", clientAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket || ticket.clientId !== req.clientUser!.clientId) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const messages = await storage.getTicketMessages(ticket.id);
      res.json({ ...ticket, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.post("/api/client/tickets/:id/messages", clientAuth, async (req, res) => {
    try {
      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket || ticket.clientId !== req.clientUser!.clientId) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const { message, imageUrl } = req.body;
      if ((!message || message.trim().length === 0) && !imageUrl) {
        return res.status(400).json({ error: "Message or image is required" });
      }
      const client = await storage.getClientById(req.clientUser!.clientId);
      const ticketMessage = await storage.addTicketMessage(
        ticket.id,
        "client",
        req.clientUser!.clientId,
        client?.name ?? "Client",
        message || "",
        imageUrl || undefined
      );
      res.json(ticketMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // ===== ADMIN CLIENT MANAGEMENT ROUTES =====
  app.get("/api/admin/clients", adminAuth, requirePermission("clients"), async (_req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        avatarUrl: c.avatarUrl,
        phone: c.phone,
        company: c.company,
        isActive: c.isActive,
        createdAt: c.createdAt,
        lastLoginAt: c.lastLoginAt,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/admin/clients/:id", adminAuth, requirePermission("clients"), async (req, res) => {
    try {
      const client = await storage.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const services = await storage.getClientServices(client.id);
      res.json({
        id: client.id,
        email: client.email,
        name: client.name,
        avatarUrl: client.avatarUrl,
        bio: client.bio,
        phone: client.phone,
        company: client.company,
        isActive: client.isActive,
        createdAt: client.createdAt,
        lastLoginAt: client.lastLoginAt,
        services,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.patch("/api/admin/clients/:id/password", adminAuth, requirePermission("clients"), async (req, res) => {
    try {
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const client = await storage.getClientById(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await storage.updateClientPassword(req.params.id, passwordHash);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.patch("/api/admin/clients/:id/status", adminAuth, requirePermission("clients"), async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive must be a boolean" });
      }
      const updated = await storage.toggleClientActive(req.params.id, isActive);
      if (!updated) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client status" });
    }
  });

  app.get("/api/admin/services", adminAuth, async (_req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", adminAuth, async (req, res) => {
    try {
      const { name, description, category } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Service name is required" });
      }
      const service = await storage.createService({ name, description, category });
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.post("/api/admin/clients/:id/services", adminAuth, requirePermission("clients"), async (req, res) => {
    try {
      const { serviceId, notes } = req.body;
      if (!serviceId) {
        return res.status(400).json({ error: "Service ID is required" });
      }
      const clientService = await storage.assignServiceToClient(req.params.id, serviceId, notes);
      res.json(clientService);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign service" });
    }
  });

  app.patch("/api/admin/client-services/:id", adminAuth, requirePermission("clients"), async (req, res) => {
    try {
      const { status, notes } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      const updated = await storage.updateClientServiceStatus(req.params.id, status, notes);
      if (!updated) {
        return res.status(404).json({ error: "Client service not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client service" });
    }
  });

  app.delete("/api/admin/client-services/:id", adminAuth, requirePermission("clients"), async (req, res) => {
    try {
      const deleted = await storage.removeClientService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Client service not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove client service" });
    }
  });

  app.get("/api/admin/tickets", adminAuth, requirePermission("tickets"), async (_req, res) => {
    try {
      const tickets = await storage.getAllTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });

  app.get("/api/admin/tickets/:id", adminAuth, requirePermission("tickets"), async (req, res) => {
    try {
      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const messages = await storage.getTicketMessages(ticket.id);
      res.json({ ...ticket, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });

  app.post("/api/admin/tickets/:id/messages", adminAuth, requirePermission("tickets"), async (req, res) => {
    try {
      const ticket = await storage.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      const { message, imageUrl } = req.body;
      if ((!message || message.trim().length === 0) && !imageUrl) {
        return res.status(400).json({ error: "Message or image is required" });
      }
      const ticketMessage = await storage.addTicketMessage(
        ticket.id,
        "admin",
        req.adminUser!.userId,
        "MetaEdge Creatives Support",
        message || "",
        imageUrl || undefined
      );
      res.json(ticketMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.patch("/api/admin/tickets/:id/status", adminAuth, requirePermission("tickets"), async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Valid status is required (open, in_progress, resolved, closed)" });
      }
      const updated = await storage.updateTicketStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket status" });
    }
  });

  app.get("/api/admin/notifications", adminAuth, async (_req, res) => {
    try {
      const counts = await storage.getAdminNotificationCounts();
      res.json(counts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  storage.seedDefaultServices().catch(console.error);
  storage.seedDefaultFaqs().catch(console.error);

  app.get("/api/admin/chat/sessions", adminAuth, requirePermission("messages"), async (_req, res) => {
    try {
      const sessions = await storage.getAllChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.get("/api/admin/chat/sessions/:id/messages", adminAuth, requirePermission("messages"), async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.patch("/api/admin/chat/sessions/:id/close", adminAuth, requirePermission("messages"), async (req, res) => {
    try {
      const session = await storage.closeChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to close chat session" });
    }
  });

  app.get("/api/chat/session/:visitorId", async (req, res) => {
    try {
      const session = await storage.getChatSessionByVisitorId(req.params.visitorId);
      if (!session) {
        return res.json({ session: null });
      }
      const messages = await storage.getChatMessages(session.id);
      res.json({ session, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat session" });
    }
  });

  // ===== JOB APPLICATIONS =====
  app.post("/api/job-applications", async (req, res) => {
    try {
      const { turnstileToken } = req.body;
      if (!await verifyTurnstile(turnstileToken)) {
        return res.status(400).json({ error: "CAPTCHA verification failed. Please try again." });
      }
      const result = insertJobApplicationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid application data", details: result.error.issues });
      }
      const career = await storage.getCareerById(result.data.careerId);
      if (!career || !career.published) {
        return res.status(404).json({ error: "Job listing not found" });
      }
      const application = await storage.createJobApplication(result.data);
      sendNotificationEmail(
        `New Job Application: ${career.title}`,
        `<h2>New Job Application Received</h2>
        <p><strong>Position:</strong> ${career.title}</p>
        <p><strong>Name:</strong> ${result.data.firstName} ${result.data.lastName}</p>
        <p><strong>Email:</strong> ${result.data.email}</p>
        <p><strong>Phone:</strong> ${result.data.phone}</p>
        <p><strong>Address:</strong> ${result.data.address}</p>
        ${result.data.portfolioUrl ? `<p><strong>Portfolio:</strong> ${result.data.portfolioUrl}</p>` : ""}
        ${result.data.cvUrl ? `<p><strong>CV:</strong> <a href="${result.data.cvUrl}">Download</a></p>` : ""}`,
        "hr"
      );
      res.json({ success: true, message: "Application submitted successfully!" });
    } catch (error) {
      console.error("Job application error:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.get("/api/admin/applications", adminAuth, requirePermission("applications"), async (_req, res) => {
    try {
      const applications = await storage.getAllJobApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.patch("/api/admin/applications/:id/status", adminAuth, requirePermission("applications"), async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "reviewed", "shortlisted", "rejected"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: "Valid status is required. Use interview endpoint for interview invites." });
      }
      const updated = await storage.updateJobApplicationStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: "Application not found" });
      }

      if (status !== "pending" && status !== "interview" && updated.email) {
        const career = await storage.getCareerById(updated.careerId);
        const positionTitle = career?.title || "the position";
        const applicantName = `${updated.firstName} ${updated.lastName}`;

        const statusMessages: Record<string, { subject: string; heading: string; body: string; color: string }> = {
          reviewed: {
            subject: `Application Under Review - ${positionTitle} | MetaEdge Creatives`,
            heading: "Your Application is Under Review",
            body: `<p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Dear <strong>${applicantName}</strong>,</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Thank you for applying for the <strong>${positionTitle}</strong> position at MetaEdge Creatives. We wanted to let you know that your application has been received and is currently being reviewed by our hiring team.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We carefully evaluate every application, and we will notify you as soon as there is an update on your application status. This process typically takes a few business days.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We appreciate your patience and interest in joining our team.</p>`,
            color: "#2563eb",
          },
          shortlisted: {
            subject: `Congratulations! You've Been Shortlisted - ${positionTitle} | MetaEdge Creatives`,
            heading: "You've Been Shortlisted!",
            body: `<p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Dear <strong>${applicantName}</strong>,</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We are excited to inform you that your application for the <strong>${positionTitle}</strong> position at MetaEdge Creatives has been <strong style="color:#16a34a;">shortlisted</strong>!</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Your qualifications, skills, and experience truly stood out among the applicants. Our team was impressed with your profile and we would like to move forward with you in the hiring process.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We will be reaching out to you shortly with further details regarding the next steps, including a potential interview. Please keep an eye on your inbox.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">If you have any questions in the meantime, feel free to contact us:</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 14px;">
              <tr><td style="padding:4px 0;font-size:14px;color:#555;">Email:</td><td style="padding:4px 0 4px 12px;font-size:14px;"><a href="mailto:info@metaedgecreatives.com" style="color:#C41E3A;text-decoration:none;font-weight:600;">info@metaedgecreatives.com</a></td></tr>
              <tr><td style="padding:4px 0;font-size:14px;color:#555;">Phone:</td><td style="padding:4px 0 4px 12px;font-size:14px;"><a href="tel:+923335063129" style="color:#C41E3A;text-decoration:none;font-weight:600;">+92 333 5063129</a></td></tr>
            </table>`,
            color: "#16a34a",
          },
          rejected: {
            subject: `Application Update - ${positionTitle} | MetaEdge Creatives`,
            heading: "Application Update",
            body: `<p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Dear <strong>${applicantName}</strong>,</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Thank you for your interest in the <strong>${positionTitle}</strong> position at MetaEdge Creatives and for taking the time to submit your application.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">After careful review, we have decided to proceed with other candidates whose experience more closely aligns with the current requirements of this role.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Please know that this does not reflect on your abilities or potential. We strongly encourage you to apply for future openings at MetaEdge Creatives that match your skill set.</p>
            <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We wish you the very best in your career journey.</p>`,
            color: "#C41E3A",
          },
        };

        const msg = statusMessages[status];
        if (msg) {
          const emailHtml = `
            <div style="background:linear-gradient(135deg, ${msg.color}15, ${msg.color}05);border-left:4px solid ${msg.color};border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
              <h2 style="color:${msg.color};margin:0;font-size:20px;font-weight:700;">${msg.heading}</h2>
            </div>
            ${msg.body}
            
          `;
          sendEmailTo(updated.email, msg.subject, emailHtml, "hr").catch(() => {});
        }
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  app.post("/api/admin/applications/:id/interview-email", adminAuth, requirePermission("applications"), async (req, res) => {
    try {
      const { date, time, location, message } = req.body;
      if (!date || !time || !location) {
        return res.status(400).json({ error: "Date, time, and location are required" });
      }

      const applications = await storage.getAllJobApplications();
      const application = applications.find((a: any) => a.id === req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (!application.email) {
        return res.status(400).json({ error: "Application has no email address" });
      }

      const escHtml = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      const career = await storage.getCareerById(application.careerId);
      const positionTitle = career?.title || "the position";
      const applicantName = `${escHtml(application.firstName)} ${escHtml(application.lastName)}`;
      const safeDate = escHtml(date);
      const safeTime = escHtml(time);
      const safeLocation = escHtml(location);

      await storage.updateJobApplicationStatus(req.params.id, "interview");

      const customMessage = message ? `<p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 18px;">${escHtml(message).replace(/\n/g, '<br/>')}</p>` : '';

      const emailHtml = `
        <div style="background:linear-gradient(135deg, #7c3aed15, #7c3aed05);border-left:4px solid #7c3aed;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
          <h2 style="color:#7c3aed;margin:0;font-size:20px;font-weight:700;">Interview Invitation</h2>
        </div>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Dear <strong>${applicantName}</strong>,</p>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We are pleased to invite you for an interview for the <strong>${positionTitle}</strong> position at MetaEdge Creatives. Your application has impressed our team and we would like to learn more about you.</p>
        ${customMessage}
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background-color:#f8f6ff;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;">
              <p style="margin:0 0 8px;font-size:13px;color:#7c3aed;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Interview Details</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#666;width:90px;vertical-align:top;">Date:</td>
                  <td style="padding:8px 0;font-size:15px;color:#222;font-weight:600;">${safeDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#666;vertical-align:top;">Time:</td>
                  <td style="padding:8px 0;font-size:15px;color:#222;font-weight:600;">${safeTime}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:14px;color:#666;vertical-align:top;">Location:</td>
                  <td style="padding:8px 0;font-size:15px;color:#222;font-weight:600;">${safeLocation}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">Please confirm your availability by replying to this email or contacting us at:</p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 14px;">
          <tr><td style="padding:4px 0;font-size:14px;color:#555;">Email:</td><td style="padding:4px 0 4px 12px;font-size:14px;"><a href="mailto:info@metaedgecreatives.com" style="color:#C41E3A;text-decoration:none;font-weight:600;">info@metaedgecreatives.com</a></td></tr>
          <tr><td style="padding:4px 0;font-size:14px;color:#555;">Phone:</td><td style="padding:4px 0 4px 12px;font-size:14px;"><a href="tel:+923335063129" style="color:#C41E3A;text-decoration:none;font-weight:600;">+92 333 5063129</a></td></tr>
        </table>
        <p style="font-size:15px;line-height:1.7;color:#333;margin:0 0 14px;">We look forward to meeting you!</p>
      `;

      await sendEmailTo(application.email, `Interview Invitation - ${positionTitle} | MetaEdge Creatives`, emailHtml, "hr");
      res.json({ success: true, message: "Interview email sent successfully" });
    } catch (error) {
      console.error("Interview email error:", error);
      res.status(500).json({ error: "Failed to send interview email" });
    }
  });

  app.delete("/api/admin/applications/:id", adminAuth, requirePermission("applications"), async (req, res) => {
    try {
      const deleted = await storage.deleteJobApplication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // ===== FAQs =====
  app.get("/api/faqs", async (_req, res) => {
    try {
      const items = await storage.getActiveFaqs();
      res.setHeader("Cache-Control", "public, max-age=300");
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  app.get("/api/admin/faqs", adminAuth, requirePermission("faqs"), async (_req, res) => {
    try {
      const items = await storage.getAllFaqs();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FAQs" });
    }
  });

  app.post("/api/admin/faqs", adminAuth, requirePermission("faqs"), async (req, res) => {
    try {
      const parsed = insertFaqSchema.parse(req.body);
      const created = await storage.createFaq(parsed);
      res.status(201).json(created);
    } catch (error: any) {
      if (error.errors) return res.status(400).json({ error: "Validation failed", details: error.errors });
      res.status(500).json({ error: "Failed to create FAQ" });
    }
  });

  app.patch("/api/admin/faqs/:id", adminAuth, requirePermission("faqs"), async (req, res) => {
    try {
      const { question, answer, displayOrder, isActive } = req.body;
      const updateData: Record<string, any> = {};
      if (question !== undefined) {
        if (typeof question !== "string" || !question.trim()) return res.status(400).json({ error: "Question cannot be empty" });
        updateData.question = question;
      }
      if (answer !== undefined) {
        if (typeof answer !== "string" || !answer.trim()) return res.status(400).json({ error: "Answer cannot be empty" });
        updateData.answer = answer;
      }
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
      if (isActive !== undefined) updateData.isActive = isActive;
      const updated = await storage.updateFaq(req.params.id, updateData);
      if (!updated) return res.status(404).json({ error: "FAQ not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update FAQ" });
    }
  });

  app.delete("/api/admin/faqs/:id", adminAuth, requirePermission("faqs"), async (req, res) => {
    try {
      const deleted = await storage.deleteFaq(req.params.id);
      if (!deleted) return res.status(404).json({ error: "FAQ not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete FAQ" });
    }
  });

  app.get("/api/admin/leaves", adminAuth, requirePermission("team"), async (_req, res) => {
    try {
      const leaves = await storage.getLeaveRequests();
      const employees = await storage.getAllEmployees();
      const empMap = new Map(employees.map(e => [e.id, e]));
      const enriched = leaves.map(l => ({
        ...l,
        employeeName: empMap.get(l.employeeId)?.name || "Unknown",
        employeeEmail: empMap.get(l.employeeId)?.email || "",
      }));
      res.json(enriched);
    } catch {
      res.status(500).json({ error: "Failed to fetch leave requests" });
    }
  });

  app.patch("/api/admin/leaves/:id", adminAuth, requirePermission("team"), async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateLeaveStatus(req.params.id, status, req.adminUser!.userId);
      if (!updated) return res.status(404).json({ error: "Leave request not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update leave request" });
    }
  });

  app.get("/api/admin/employee-reports", adminAuth, requirePermission("team"), async (req, res) => {
    try {
      const { startDate, endDate } = req.query as any;
      const employees = await storage.getAllEmployees();
      const clockData = await storage.getAllClockEntries(startDate, endDate);
      const leaveData = await storage.getLeaveRequests();

      const reports = employees.map(emp => {
        const empClock = clockData.filter(c => c.employeeId === emp.id);
        const empLeaves = leaveData.filter(l => l.employeeId === emp.id);
        const totalMinutes = empClock.reduce((sum, c) => sum + (c.totalMinutes || 0), 0);
        const totalDays = empClock.filter(c => c.clockOut).length;
        const pendingLeaves = empLeaves.filter(l => l.status === "pending").length;
        const approvedLeaves = empLeaves.filter(l => l.status === "approved").length;

        return {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          department: emp.department,
          totalHoursWorked: Math.round((totalMinutes / 60) * 100) / 100,
          totalDaysWorked: totalDays,
          totalClockEntries: empClock.length,
          pendingLeaves,
          approvedLeaves,
          totalLeaves: empLeaves.length,
          clockEntries: empClock,
          leaves: empLeaves,
        };
      });

      res.json(reports);
    } catch {
      res.status(500).json({ error: "Failed to fetch employee reports" });
    }
  });

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const baseUrl = "https://metaedgecreatives.com";
      const today = new Date().toISOString().split("T")[0];

      const staticPages = [
        { loc: "/", priority: "1.0", changefreq: "weekly" },
        { loc: "/about", priority: "0.8", changefreq: "monthly" },
        { loc: "/about/testimonials", priority: "0.6", changefreq: "monthly" },
        { loc: "/services", priority: "0.9", changefreq: "monthly" },
        { loc: "/services/web-development", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/custom-crm", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/mobile-app-development", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/ai-automation", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/seo-and-geo", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/digital-marketing", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/graphic-design", priority: "0.8", changefreq: "monthly" },
        { loc: "/services/video-editing", priority: "0.8", changefreq: "monthly" },
        { loc: "/portfolio", priority: "0.8", changefreq: "weekly" },
        { loc: "/blog", priority: "0.8", changefreq: "daily" },
        { loc: "/careers", priority: "0.7", changefreq: "weekly" },
        { loc: "/contact", priority: "0.7", changefreq: "monthly" },
        { loc: "/faqs", priority: "0.5", changefreq: "monthly" },
        { loc: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
        { loc: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
        { loc: "/workspace-policy", priority: "0.3", changefreq: "yearly" },
      ];

      const portfolioSlugs = [
        "ai-avatar-video-production","ai-content-generation-workflow","ai-customer-support-chatbot","ai-invoice-processing-system","ai-review-reputation-management","automated-lead-scoring-pipeline","beauty-brand-influencer-marketing","clickfunnels-projects","community-building-tech-startup","custom-crm-system","ecommerce-brand-digital-marketing","ecommerce-home-decor-seo","ecommerce-solutions","education-student-enrollment-crm","event-booking-ticketing-app","event-planning-client-crm","figma-to-wordpress","financial-advisory-content-marketing","fitness-studio-social-ads","fitness-tracking-mobile-app","freelancer-project-management-crm","ghl-ai-calling-system","gohighlevel-landing-pages","grocery-delivery-app","healthcare-patient-management-crm","home-services-ppc-campaigns","insurance-policy-management-crm","language-learning-app","legal-case-management-crm","linkedin-thought-leadership-campaign","local-dental-practice-seo","local-plumbing-service-seo-geo","local-restaurant-chain-google-ads","logistics-fleet-management-crm","mental-wellness-meditation-app","n8n-zapier-automations","nonprofit-multi-channel-campaign","on-demand-home-services-app","online-academy-email-marketing","parking-finder-reservation-app","pet-care-veterinary-app","pet-donation-digital-marketing","pet-donation-websites","podcast-launch-growth-management","portfolio-websites","property-management-mobile-app","real-estate-landing-page","real-estate-lead-tracking-crm","recruitment-talent-management-crm","regional-law-firm-seo-geo","restaurant-ordering-mobile-app","saas-startup-seo","seo-clarity-consultant","seo-consultation-business","seo-pet-donation-organizations","seo-service-page-businesses","shopify-store-design","smart-appointment-scheduling-system","social-media-brand-management","social-media-crisis-management-hospitality","social-media-music-artist","subscription-box-performance-marketing","tiktok-growth-strategy-food-brand","travel-tourism-agency-seo","viral-content-strategy-education-platform","website-migrations","wix-websites","wordpress-donation-websites","wordpress-ecommerce","youtube-automation-system"
      ];

      const platformSlugs = [
        "adobe","adobe-after-effects","adobe-indesign","ahrefs","android-studio","aws","canva","capcut","clickfunnels","coursera","css3","davinci-resolve","designrush","distrokid","facebook","facebook-ads","figma","filmora","flutter","gohighlevel","goodfirms","google","google-ads","html5","hubspot","illustrator","instagram","instagram-ads","irs","javascript","kotlin","laravel","linkedin","magento","mailchimp","meta","microsoft","microsoft-dynamics","moz","mysql","n8n","nextjs","nodejs","paypal","photoshop","php","pipedrive","power-automate","premiere-pro","pseb","ptcl","react","react-native","salesforce","semrush","shopify","slack","spotify","stripe","swift","tailwind-css","techbehemoths","tiktok","twilio","typescript","wix","wordpress","wyoming-state","yoast","youtube","youtube-ads","zapier","zoho"
      ];

      let blogPosts: any[] = [];
      let careers: any[] = [];
      try {
        blogPosts = await storage.getBlogPosts();
        blogPosts = blogPosts.filter((p: any) => p.published);
      } catch (e) {}
      try {
        careers = await storage.getCareers();
        careers = careers.filter((c: any) => c.published);
      } catch (e) {}

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      for (const page of staticPages) {
        xml += `  <url>\n    <loc>${baseUrl}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
      }

      for (const slug of portfolioSlugs) {
        xml += `  <url>\n    <loc>${baseUrl}/portfolio/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }

      for (const slug of platformSlugs) {
        xml += `  <url>\n    <loc>${baseUrl}/platforms/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      }

      for (const post of blogPosts) {
        const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString().split("T")[0] : today;
        xml += `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }

      for (const career of careers) {
        xml += `  <url>\n    <loc>${baseUrl}/careers/${career.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /client/*
Disallow: /team-portal
Disallow: /team-portal/*

Sitemap: https://metaedgecreatives.com/sitemap.xml`;
    res.set("Content-Type", "text/plain");
    res.send(robots);
  });

  return httpServer;
}
