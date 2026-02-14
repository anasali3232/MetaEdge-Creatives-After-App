import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, boolean, timestamp, int, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const adminUsers = mysqlTable("admin_users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("admin"),
  permissions: json("permissions").$type<string[]>().default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["super_admin", "admin"]).optional().default("admin"),
  permissions: z.array(z.string()).optional().default([]),
});

export const updateAdminUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["super_admin", "admin"]).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type UpdateAdminUser = z.infer<typeof updateAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export const ADMIN_PERMISSIONS = [
  "blog",
  "careers",
  "team",
  "messages",
  "settings",
  "users",
  "clients",
  "tickets",
  "applications",
  "faqs",
  "pages",
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

export const contactMessages = mysqlTable("contact_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: text("phone"),
  company: text("company"),
  subject: text("subject"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true }).extend({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export const blogPosts = mysqlTable("blog_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  tags: json("tags").$type<string[]>(),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional().nullable(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const careers = mysqlTable("careers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  responsibilities: json("responsibilities").$type<string[]>(),
  requirements: json("requirements").$type<string[]>(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCareerSchema = createInsertSchema(careers).omit({ id: true, createdAt: true }).extend({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.string().min(1, "Job type is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  responsibilities: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export type InsertCareer = z.infer<typeof insertCareerSchema>;
export type Career = typeof careers.$inferSelect;

export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true }).extend({
  key: z.string().min(1),
  value: z.string(),
});

export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

export const teamMembers = mysqlTable("team_members", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  displayOrder: varchar("display_order", { length: 10 }).default("0").notNull(),
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  websiteUrl: text("website_url"),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true }).extend({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional().nullable(),
  displayOrder: z.string().optional(),
  linkedinUrl: z.string().optional().nullable(),
  twitterUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  websiteUrl: z.string().optional().nullable(),
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

export const pageMeta = mysqlTable("page_meta", {
  id: varchar("id", { length: 36 }).primaryKey(),
  pageSlug: varchar("page_slug", { length: 255 }).notNull().unique(),
  pageName: text("page_name").notNull(),
  title: text("title"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  description: text("description"),
  ogImage: text("og_image"),
  keywords: text("keywords"),
});

export const insertPageMetaSchema = createInsertSchema(pageMeta).omit({ id: true }).extend({
  pageSlug: z.string().min(1),
  pageName: z.string().min(1),
  title: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  keywords: z.string().optional().nullable(),
});

export type InsertPageMeta = z.infer<typeof insertPageMetaSchema>;
export type PageMeta = typeof pageMeta.$inferSelect;

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ id: true, subscribedAt: true }).extend({
  email: z.string().email("Please enter a valid email address"),
});

export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;

export const clients = mysqlTable("clients", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  googleId: varchar("google_id", { length: 255 }).unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  phone: text("phone"),
  company: text("company"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
});

export const clientSignupSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const clientLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const clientProfileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export type Client = typeof clients.$inferSelect;
export type ClientSignup = z.infer<typeof clientSignupSchema>;
export type ClientLogin = z.infer<typeof clientLoginSchema>;
export type ClientProfileUpdate = z.infer<typeof clientProfileUpdateSchema>;

export const services = mysqlTable("services", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Service = typeof services.$inferSelect;

export const clientServices = mysqlTable("client_services", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull(),
  serviceId: varchar("service_id", { length: 36 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("active"),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type ClientService = typeof clientServices.$inferSelect;

export const tickets = mysqlTable("tickets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  clientId: varchar("client_id", { length: 36 }).notNull(),
  subject: text("subject").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  priority: varchar("priority", { length: 50 }).notNull().default("normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type Ticket = typeof tickets.$inferSelect;
export type CreateTicket = z.infer<typeof createTicketSchema>;

export const ticketMessages = mysqlTable("ticket_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ticketId: varchar("ticket_id", { length: 36 }).notNull(),
  senderType: text("sender_type").notNull(),
  senderId: varchar("sender_id", { length: 36 }),
  senderName: text("sender_name"),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clientId: varchar("client_id", { length: 36 }).notNull(),
  otpHash: text("otp_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const chatSessions = mysqlTable("chat_sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  visitorId: varchar("visitor_id", { length: 255 }).notNull(),
  visitorName: text("visitor_name"),
  visitorEmail: varchar("visitor_email", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("open"),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;

export const chatMessages = mysqlTable("chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sessionId: varchar("session_id", { length: 36 }).notNull(),
  senderType: text("sender_type").notNull(),
  senderName: text("sender_name"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;

export const jobApplications = mysqlTable("job_applications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  careerId: varchar("career_id", { length: 36 }).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  cvUrl: text("cv_url"),
  portfolioUrl: text("portfolio_url"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobApplicationSchema = z.object({
  careerId: z.string().min(1, "Career ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  cvUrl: z.string().optional().nullable(),
  portfolioUrl: z.string().optional().nullable(),
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

export const faqs = mysqlTable("faqs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  displayOrder: int("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  displayOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type Faq = typeof faqs.$inferSelect;

export const employees = mysqlTable("employees", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 100 }).default("employee").notNull(),
  designation: text("designation"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  accessLevel: varchar("access_level", { length: 50 }).default("team_only").notNull(),
  accessTeams: json("access_teams").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().optional().default("employee"),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  accessLevel: z.enum(["full", "multi_team", "team_only"]).optional().default("team_only"),
  accessTeams: z.array(z.string()).optional().default([]),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  designation: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional(),
  accessLevel: z.enum(["full", "multi_team", "team_only"]).optional(),
  accessTeams: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type UpdateEmployee = z.infer<typeof updateEmployeeSchema>;

export const teams = mysqlTable("teams", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#C41E3A"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;

export const teamMemberships = mysqlTable("team_memberships", {
  id: varchar("id", { length: 36 }).primaryKey(),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  role: varchar("role", { length: 50 }).default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type TeamMembership = typeof teamMemberships.$inferSelect;

export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  assigneeId: varchar("assignee_id", { length: 36 }),
  createdById: varchar("created_by_id", { length: 36 }).notNull(),
  status: varchar("status", { length: 50 }).default("todo").notNull(),
  priority: varchar("priority", { length: 20 }).default("medium").notNull(),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;

export const taskComments = mysqlTable("task_comments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  taskId: varchar("task_id", { length: 36 }).notNull(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TaskComment = typeof taskComments.$inferSelect;

export const clockEntries = mysqlTable("clock_entries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  totalMinutes: int("total_minutes"),
  notes: text("notes"),
  date: varchar("date", { length: 10 }).notNull(),
});

export type ClockEntry = typeof clockEntries.$inferSelect;

export const leaveRequests = mysqlTable("leave_requests", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  reviewedBy: varchar("reviewed_by", { length: 36 }),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type LeaveRequest = typeof leaveRequests.$inferSelect;

export const personalNotes = mysqlTable("personal_notes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  title: text("title").notNull(),
  content: text("content"),
  color: varchar("color", { length: 20 }).default("#ffffff"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PersonalNote = typeof personalNotes.$inferSelect;

export const activityHeartbeats = mysqlTable("activity_heartbeats", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  lastActive: timestamp("last_active").notNull(),
  appName: varchar("app_name", { length: 255 }),
  windowTitle: text("window_title"),
});

export type ActivityHeartbeat = typeof activityHeartbeats.$inferSelect;

export const screenshots = mysqlTable("screenshots", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  imageData: text("image_data").notNull(),
  appName: varchar("app_name", { length: 255 }),
  windowTitle: text("window_title"),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
});

export type Screenshot = typeof screenshots.$inferSelect;

export const weeklyReports = mysqlTable("weekly_reports", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  weekStart: varchar("week_start", { length: 10 }).notNull(),
  weekEnd: varchar("week_end", { length: 10 }).notNull(),
  accomplishments: text("accomplishments").notNull(),
  challenges: text("challenges"),
  nextWeekPlan: text("next_week_plan"),
  hoursWorked: int("hours_worked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type WeeklyReport = typeof weeklyReports.$inferSelect;

export const monthlyReports = mysqlTable("monthly_reports", {
  id: varchar("id", { length: 36 }).primaryKey(),
  employeeId: varchar("employee_id", { length: 36 }).notNull(),
  teamId: varchar("team_id", { length: 36 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  summary: text("summary").notNull(),
  achievements: text("achievements"),
  challenges: text("challenges"),
  goalsNextMonth: text("goals_next_month"),
  totalHours: int("total_hours"),
  tasksCompleted: int("tasks_completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type MonthlyReport = typeof monthlyReports.$inferSelect;
