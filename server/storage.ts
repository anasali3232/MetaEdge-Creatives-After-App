import { type User, type InsertUser, type ContactMessage, type InsertContactMessage, type BlogPost, type InsertBlogPost, type Career, type InsertCareer, type SiteSetting, type InsertSiteSetting, type TeamMember, type InsertTeamMember, type AdminUser, type PageMeta, type InsertPageMeta, type NewsletterSubscriber, type InsertNewsletterSubscriber, type Client, type Service, type ClientService, type Ticket, type TicketMessage, type PasswordResetToken, type ChatSession, type ChatMessage, type JobApplication, type InsertJobApplication, type Faq, type InsertFaq, type Employee, type Team, type TeamMembership, type Task, type TaskComment, type ClockEntry, type LeaveRequest, type PersonalNote, type ActivityHeartbeat, type Screenshot, type WeeklyReport, type MonthlyReport, users, contactMessages, blogPosts, careers, siteSettings, teamMembers, adminUsers, pageMeta, newsletterSubscribers, clients, services, clientServices, tickets, ticketMessages, passwordResetTokens, chatSessions, chatMessages, jobApplications, faqs, employees, teams, teamMemberships, tasks, taskComments, clockEntries, leaveRequests, personalNotes, activityHeartbeats, screenshots, weeklyReports, monthlyReports } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, gt, gte, lte, isNull, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

function safeJsonArray(val: any): string[] | null {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return null;
}

function fixCareerJson<T extends { responsibilities?: any; requirements?: any }>(career: T): T {
  return {
    ...career,
    responsibilities: safeJsonArray(career.responsibilities),
    requirements: safeJsonArray(career.requirements),
  };
}

function fixBlogJson<T extends { tags?: any }>(post: T): T {
  return {
    ...post,
    tags: safeJsonArray(post.tags),
  };
}

function fixAdminJson<T extends { permissions?: any }>(user: T): T {
  return {
    ...user,
    permissions: safeJsonArray(user.permissions) || [],
  };
}

function fixEmployeeJson<T extends { accessTeams?: any }>(emp: T): T {
  return {
    ...emp,
    accessTeams: safeJsonArray(emp.accessTeams) || [],
  };
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  saveContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  deleteContactMessage(id: string): Promise<boolean>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  getPublishedCareers(): Promise<Career[]>;
  getAllCareers(): Promise<Career[]>;
  getCareerBySlug(slug: string): Promise<Career | undefined>;
  getCareerById(id: string): Promise<Career | undefined>;
  createCareer(career: InsertCareer): Promise<Career>;
  updateCareer(id: string, career: Partial<InsertCareer>): Promise<Career | undefined>;
  deleteCareer(id: string): Promise<boolean>;
  getAllSettings(): Promise<SiteSetting[]>;
  getSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  deleteSetting(key: string): Promise<boolean>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  getTeamMemberById(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminUserById(id: string): Promise<AdminUser | undefined>;
  getAllAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(email: string, name: string, passwordHash: string, role: string, permissions: string[]): Promise<AdminUser>;
  updateAdminUser(id: string, data: Partial<{ name: string; email: string; role: string; permissions: string[]; isActive: boolean; passwordHash: string }>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: string): Promise<boolean>;
  seedSuperAdmin(): Promise<void>;
  getAllPageMeta(): Promise<PageMeta[]>;
  getPageMeta(pageSlug: string): Promise<PageMeta | undefined>;
  upsertPageMeta(data: InsertPageMeta): Promise<PageMeta>;
  deletePageMeta(id: string): Promise<boolean>;
  seedDefaultPages(): Promise<void>;
  getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  addNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  deleteNewsletterSubscriber(id: string): Promise<boolean>;
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;

  getClientByEmail(email: string): Promise<Client | undefined>;
  getClientById(id: string): Promise<Client | undefined>;
  getClientByGoogleId(googleId: string): Promise<Client | undefined>;
  createClient(data: { email: string; name: string; passwordHash?: string; googleId?: string; avatarUrl?: string }): Promise<Client>;
  updateClient(id: string, data: Partial<{ name: string; bio: string; phone: string; company: string; avatarUrl: string; lastLoginAt: Date }>): Promise<Client | undefined>;
  updateClientPassword(id: string, passwordHash: string): Promise<void>;
  getAllClients(): Promise<Client[]>;
  toggleClientActive(id: string, isActive: boolean): Promise<Client | undefined>;

  getAllServices(): Promise<Service[]>;
  createService(data: { name: string; description?: string; category?: string }): Promise<Service>;
  getClientServices(clientId: string): Promise<(ClientService & { serviceName: string; serviceDescription: string | null })[]>;
  assignServiceToClient(clientId: string, serviceId: string, notes?: string): Promise<ClientService>;
  updateClientServiceStatus(id: string, status: string, notes?: string): Promise<ClientService | undefined>;
  removeClientService(id: string): Promise<boolean>;
  seedDefaultServices(): Promise<void>;

  createTicket(clientId: string, subject: string, message: string, imageUrl?: string): Promise<Ticket>;
  getClientTickets(clientId: string): Promise<Ticket[]>;
  getAllTickets(): Promise<(Ticket & { clientName: string; clientEmail: string })[]>;
  getTicketById(id: string): Promise<Ticket | undefined>;
  getTicketMessages(ticketId: string): Promise<TicketMessage[]>;
  addTicketMessage(ticketId: string, senderType: string, senderId: string, senderName: string, message: string, imageUrl?: string): Promise<TicketMessage>;
  updateTicketStatus(id: string, status: string): Promise<Ticket | undefined>;

  getAdminNotificationCounts(): Promise<{ unreadMessages: number; openTickets: number; newTicketMessages: number; activeChatSessions: number }>;

  createPasswordResetToken(clientId: string, otpHash: string, expiresAt: Date): Promise<PasswordResetToken>;
  getValidPasswordResetToken(clientId: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;

  createChatSession(visitorId: string, visitorName?: string, visitorEmail?: string): Promise<ChatSession>;
  getChatSessionByVisitorId(visitorId: string): Promise<ChatSession | undefined>;
  getChatSessionById(id: string): Promise<ChatSession | undefined>;
  getAllChatSessions(): Promise<ChatSession[]>;
  closeChatSession(id: string): Promise<ChatSession | undefined>;
  updateChatSessionName(id: string, visitorName: string, visitorEmail?: string): Promise<void>;
  addChatMessage(sessionId: string, senderType: string, senderName: string | null, message: string): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  updateChatSessionLastMessage(id: string): Promise<void>;

  createJobApplication(data: InsertJobApplication): Promise<JobApplication>;
  getAllJobApplications(): Promise<(JobApplication & { careerTitle: string })[]>;
  getJobApplicationById(id: string): Promise<JobApplication | undefined>;
  updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined>;
  deleteJobApplication(id: string): Promise<boolean>;

  getActiveFaqs(): Promise<Faq[]>;
  getAllFaqs(): Promise<Faq[]>;
  getFaqById(id: string): Promise<Faq | undefined>;
  createFaq(data: InsertFaq): Promise<Faq>;
  updateFaq(id: string, data: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: string): Promise<boolean>;
  seedDefaultFaqs(): Promise<void>;

  createEmployee(data: { email: string; name: string; passwordHash: string; role?: string; designation?: string; phone?: string; accessLevel?: string; accessTeams?: string[] }): Promise<Employee>;
  getEmployeeById(id: string): Promise<Employee | undefined>;
  getEmployeeByEmail(email: string): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  updateEmployee(id: string, data: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  createTeam(data: { name: string; description?: string; color?: string }): Promise<Team>;
  getTeamById(id: string): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  addTeamMember(teamId: string, employeeId: string, role?: string): Promise<TeamMembership>;
  removeTeamMember(teamId: string, employeeId: string): Promise<boolean>;
  getTeamMembers(teamId: string): Promise<TeamMembership[]>;
  getEmployeeTeams(employeeId: string): Promise<TeamMembership[]>;

  createTask(data: { title: string; description?: string; teamId: string; assigneeId?: string; createdById: string; priority?: string; dueDate?: string }): Promise<Task>;
  getTaskById(id: string): Promise<Task | undefined>;
  getTasksByTeam(teamId: string): Promise<Task[]>;
  getTasksByAssignee(employeeId: string): Promise<Task[]>;
  updateTask(id: string, data: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  createTaskComment(data: { taskId: string; employeeId: string; content: string }): Promise<TaskComment>;
  getTaskComments(taskId: string): Promise<TaskComment[]>;
  deleteTaskComment(id: string): Promise<boolean>;

  clockIn(employeeId: string, notes?: string): Promise<ClockEntry>;
  clockOut(id: string): Promise<ClockEntry | undefined>;
  getActiveClockEntry(employeeId: string): Promise<ClockEntry | undefined>;
  getClockEntries(employeeId: string, startDate?: string, endDate?: string): Promise<ClockEntry[]>;
  getAllClockEntries(startDate?: string, endDate?: string): Promise<ClockEntry[]>;

  createLeaveRequest(data: { employeeId: string; type: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest>;
  getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]>;
  updateLeaveStatus(id: string, status: string, reviewedBy: string): Promise<LeaveRequest | undefined>;

  createNote(data: { employeeId: string; title: string; content?: string; color?: string }): Promise<PersonalNote>;
  getNotes(employeeId: string): Promise<PersonalNote[]>;
  updateNote(id: string, data: Partial<PersonalNote>): Promise<PersonalNote | undefined>;
  deleteNote(id: string): Promise<boolean>;

  upsertHeartbeat(employeeId: string, appName?: string, windowTitle?: string): Promise<ActivityHeartbeat>;
  getHeartbeats(): Promise<ActivityHeartbeat[]>;
  getHeartbeat(employeeId: string): Promise<ActivityHeartbeat | undefined>;

  createScreenshot(data: { employeeId: string; imageData: string; appName?: string; windowTitle?: string }): Promise<Screenshot>;
  getScreenshots(employeeId?: string, limit?: number): Promise<Screenshot[]>;
  getScreenshotById(id: string): Promise<Screenshot | undefined>;
  deleteOldScreenshots(daysOld: number): Promise<number>;

  createWeeklyReport(data: { employeeId: string; teamId: string; weekStart: string; weekEnd: string; accomplishments: string; challenges?: string; nextWeekPlan?: string; hoursWorked?: number }): Promise<WeeklyReport>;
  getWeeklyReports(teamId?: string, employeeId?: string): Promise<WeeklyReport[]>;
  getWeeklyReportById(id: string): Promise<WeeklyReport | undefined>;
  updateWeeklyReport(id: string, data: any): Promise<WeeklyReport | undefined>;
  deleteWeeklyReport(id: string): Promise<boolean>;

  createMonthlyReport(data: { employeeId: string; teamId: string; month: string; summary: string; achievements?: string; challenges?: string; goalsNextMonth?: string; totalHours?: number; tasksCompleted?: number }): Promise<MonthlyReport>;
  getMonthlyReports(teamId?: string, employeeId?: string): Promise<MonthlyReport[]>;
  getMonthlyReportById(id: string): Promise<MonthlyReport | undefined>;
  updateMonthlyReport(id: string, data: any): Promise<MonthlyReport | undefined>;
  deleteMonthlyReport(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    await db.insert(users).values({ ...insertUser, id });
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async saveContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    await db.insert(contactMessages).values({
      ...message,
      id,
      phone: message.phone ?? null,
      company: message.company ?? null,
      subject: message.subject ?? null,
    });
    const [saved] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return saved;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    const existing = await db.select({ id: contactMessages.id }).from(contactMessages).where(eq(contactMessages.id, id));
    if (existing.length === 0) return false;
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return true;
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    const results = await db.select().from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt));
    return results.map(fixBlogJson);
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    const results = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    return results.map(fixBlogJson);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post ? fixBlogJson(post) : undefined;
  }

  async getBlogPostById(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post ? fixBlogJson(post) : undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    await db.insert(blogPosts).values({
      id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage ?? null,
      tags: post.tags ?? null,
      published: post.published ?? false,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : (post.published ? new Date() : null),
    });
    const [created] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return fixBlogJson(created);
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const existing = await this.getBlogPostById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = {};
    if (post.title !== undefined) updateData.title = post.title;
    if (post.slug !== undefined) updateData.slug = post.slug;
    if (post.excerpt !== undefined) updateData.excerpt = post.excerpt;
    if (post.content !== undefined) updateData.content = post.content;
    if (post.coverImage !== undefined) updateData.coverImage = post.coverImage ?? null;
    if (post.tags !== undefined) updateData.tags = post.tags ?? null;
    if (post.published !== undefined) {
      updateData.published = post.published;
      if (post.published && !existing.published) {
        updateData.publishedAt = new Date();
      } else if (!post.published) {
        updateData.publishedAt = null;
      }
    }

    await db.update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id));
    const [updated] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return updated ? fixBlogJson(updated) : undefined;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.id, id));
    if (existing.length === 0) return false;
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  async getPublishedCareers(): Promise<Career[]> {
    const results = await db.select().from(careers)
      .where(eq(careers.published, true))
      .orderBy(desc(careers.createdAt));
    return results.map(fixCareerJson);
  }

  async getAllCareers(): Promise<Career[]> {
    const results = await db.select().from(careers).orderBy(desc(careers.createdAt));
    return results.map(fixCareerJson);
  }

  async getCareerBySlug(slug: string): Promise<Career | undefined> {
    const [career] = await db.select().from(careers).where(eq(careers.slug, slug));
    return career ? fixCareerJson(career) : undefined;
  }

  async getCareerById(id: string): Promise<Career | undefined> {
    const [career] = await db.select().from(careers).where(eq(careers.id, id));
    return career ? fixCareerJson(career) : undefined;
  }

  async createCareer(career: InsertCareer): Promise<Career> {
    const id = randomUUID();
    await db.insert(careers).values({
      id,
      title: career.title,
      slug: career.slug,
      type: career.type,
      location: career.location,
      description: career.description,
      responsibilities: career.responsibilities ?? null,
      requirements: career.requirements ?? null,
      published: career.published ?? true,
    });
    const [created] = await db.select().from(careers).where(eq(careers.id, id));
    return fixCareerJson(created);
  }

  async updateCareer(id: string, career: Partial<InsertCareer>): Promise<Career | undefined> {
    const existing = await this.getCareerById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = {};
    if (career.title !== undefined) updateData.title = career.title;
    if (career.slug !== undefined) updateData.slug = career.slug;
    if (career.type !== undefined) updateData.type = career.type;
    if (career.location !== undefined) updateData.location = career.location;
    if (career.description !== undefined) updateData.description = career.description;
    if (career.responsibilities !== undefined) updateData.responsibilities = career.responsibilities ?? null;
    if (career.requirements !== undefined) updateData.requirements = career.requirements ?? null;
    if (career.published !== undefined) updateData.published = career.published;

    await db.update(careers)
      .set(updateData)
      .where(eq(careers.id, id));
    const [updated] = await db.select().from(careers).where(eq(careers.id, id));
    return updated ? fixCareerJson(updated) : undefined;
  }

  async deleteCareer(id: string): Promise<boolean> {
    const existing = await db.select({ id: careers.id }).from(careers).where(eq(careers.id, id));
    if (existing.length === 0) return false;
    await db.delete(careers).where(eq(careers.id, id));
    return true;
  }

  async getAllSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }

  async getSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async upsertSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSetting(setting.key);
    if (existing) {
      await db.update(siteSettings)
        .set({ value: setting.value })
        .where(eq(siteSettings.key, setting.key));
      const [updated] = await db.select().from(siteSettings).where(eq(siteSettings.key, setting.key));
      return updated;
    }
    const id = randomUUID();
    await db.insert(siteSettings).values({ ...setting, id });
    const [created] = await db.select().from(siteSettings).where(eq(siteSettings.id, id));
    return created;
  }

  async deleteSetting(key: string): Promise<boolean> {
    const existing = await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.key, key));
    if (existing.length === 0) return false;
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
    return true;
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    const members = await db.select().from(teamMembers);
    return members.sort((a, b) => {
      const numA = parseInt(a.displayOrder, 10) || 0;
      const numB = parseInt(b.displayOrder, 10) || 0;
      return numA - numB;
    });
  }

  async getTeamMemberById(id: string): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    await db.insert(teamMembers).values({
      id,
      name: member.name,
      role: member.role,
      description: member.description,
      imageUrl: member.imageUrl ?? null,
      displayOrder: member.displayOrder ?? "0",
      linkedinUrl: member.linkedinUrl ?? null,
      twitterUrl: member.twitterUrl ?? null,
      instagramUrl: member.instagramUrl ?? null,
      facebookUrl: member.facebookUrl ?? null,
      websiteUrl: member.websiteUrl ?? null,
    });
    const [created] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return created;
  }

  async updateTeamMember(id: string, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const existing = await this.getTeamMemberById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = {};
    if (member.name !== undefined) updateData.name = member.name;
    if (member.role !== undefined) updateData.role = member.role;
    if (member.description !== undefined) updateData.description = member.description;
    if (member.imageUrl !== undefined) updateData.imageUrl = member.imageUrl ?? null;
    if (member.displayOrder !== undefined) updateData.displayOrder = member.displayOrder;
    if (member.linkedinUrl !== undefined) updateData.linkedinUrl = member.linkedinUrl ?? null;
    if (member.twitterUrl !== undefined) updateData.twitterUrl = member.twitterUrl ?? null;
    if (member.instagramUrl !== undefined) updateData.instagramUrl = member.instagramUrl ?? null;
    if (member.facebookUrl !== undefined) updateData.facebookUrl = member.facebookUrl ?? null;
    if (member.websiteUrl !== undefined) updateData.websiteUrl = member.websiteUrl ?? null;

    await db.update(teamMembers)
      .set(updateData)
      .where(eq(teamMembers.id, id));
    const [updated] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return updated;
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    const existing = await db.select({ id: teamMembers.id }).from(teamMembers).where(eq(teamMembers.id, id));
    if (existing.length === 0) return false;
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.toLowerCase()));
    return user ? fixAdminJson(user) : undefined;
  }

  async getAdminUserById(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user ? fixAdminJson(user) : undefined;
  }

  async getAllAdminUsers(): Promise<AdminUser[]> {
    const results = await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
    return results.map(fixAdminJson);
  }

  async createAdminUser(email: string, name: string, passwordHash: string, role: string, permissions: string[]): Promise<AdminUser> {
    const id = randomUUID();
    await db.insert(adminUsers).values({
      id,
      email: email.toLowerCase(),
      name,
      passwordHash,
      role,
      permissions,
    });
    const [created] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return fixAdminJson(created);
  }

  async updateAdminUser(id: string, data: Partial<{ name: string; email: string; role: string; permissions: string[]; isActive: boolean; passwordHash: string }>): Promise<AdminUser | undefined> {
    const existing = await this.getAdminUserById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email.toLowerCase();
    if (data.role !== undefined) updateData.role = data.role;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;

    await db.update(adminUsers)
      .set(updateData)
      .where(eq(adminUsers.id, id));
    const [updated] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return updated ? fixAdminJson(updated) : undefined;
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const existing = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.id, id));
    if (existing.length === 0) return false;
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return true;
  }

  async seedSuperAdmin(): Promise<void> {
    const superAdminEmail = "wmisaw99@gmail.com";
    const existing = await this.getAdminUserByEmail(superAdminEmail);
    if (!existing) {
      const defaultPassword = process.env.ADMIN_PASSWORD || "Ihavethelogins321$";
      const hash = await bcrypt.hash(defaultPassword, 10);
      await this.createAdminUser(
        superAdminEmail,
        "MetaEdge Admin",
        hash,
        "super_admin",
        ["blog", "careers", "team", "messages", "settings", "users", "applications", "pages", "clients", "tickets", "faqs"]
      );
      console.log("Super admin seeded:", superAdminEmail);
    }
  }

  async getAllPageMeta(): Promise<PageMeta[]> {
    return db.select().from(pageMeta).orderBy(asc(pageMeta.pageName));
  }

  async getPageMeta(pageSlug: string): Promise<PageMeta | undefined> {
    const [meta] = await db.select().from(pageMeta).where(eq(pageMeta.pageSlug, pageSlug));
    return meta;
  }

  async upsertPageMeta(data: InsertPageMeta): Promise<PageMeta> {
    const existing = await this.getPageMeta(data.pageSlug);
    if (existing) {
      await db.update(pageMeta)
        .set({
          pageName: data.pageName,
          title: data.title ?? null,
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
          description: data.description ?? null,
          ogImage: data.ogImage ?? null,
          keywords: data.keywords ?? null,
        })
        .where(eq(pageMeta.pageSlug, data.pageSlug));
      const [updated] = await db.select().from(pageMeta).where(eq(pageMeta.pageSlug, data.pageSlug));
      return updated;
    }
    const id = randomUUID();
    await db.insert(pageMeta).values({
      id,
      pageSlug: data.pageSlug,
      pageName: data.pageName,
      title: data.title ?? null,
      metaTitle: data.metaTitle ?? null,
      metaDescription: data.metaDescription ?? null,
      description: data.description ?? null,
      ogImage: data.ogImage ?? null,
      keywords: data.keywords ?? null,
    });
    const [created] = await db.select().from(pageMeta).where(eq(pageMeta.id, id));
    return created;
  }

  async deletePageMeta(id: string): Promise<boolean> {
    const existing = await db.select({ id: pageMeta.id }).from(pageMeta).where(eq(pageMeta.id, id));
    if (existing.length === 0) return false;
    await db.delete(pageMeta).where(eq(pageMeta.id, id));
    return true;
  }

  async seedDefaultPages(): Promise<void> {
    const defaultPages = [
      { pageSlug: "home", pageName: "Home (Front Page)" },
      { pageSlug: "about", pageName: "About" },
      { pageSlug: "services", pageName: "Services" },
      { pageSlug: "contact", pageName: "Contact" },
      { pageSlug: "blog", pageName: "Blog" },
      { pageSlug: "careers", pageName: "Careers" },
      { pageSlug: "portfolio", pageName: "Portfolio" },
      { pageSlug: "faqs", pageName: "FAQs" },
      { pageSlug: "testimonials", pageName: "Testimonials" },
      { pageSlug: "privacy-policy", pageName: "Privacy Policy" },
      { pageSlug: "terms-of-service", pageName: "Terms of Service" },
      { pageSlug: "workspace-policy", pageName: "Workspace Policy" },
      { pageSlug: "services/web-development", pageName: "Web Development" },
      { pageSlug: "services/custom-crm", pageName: "Custom CRM" },
      { pageSlug: "services/mobile-app-development", pageName: "Mobile App Development" },
      { pageSlug: "services/ai-automation", pageName: "AI Automation" },
      { pageSlug: "services/seo-and-geo", pageName: "SEO & GEO" },
      { pageSlug: "services/digital-marketing", pageName: "Digital Marketing" },
      { pageSlug: "services/graphic-design", pageName: "Graphic Design" },
      { pageSlug: "services/video-editing", pageName: "Video Editing" },
      { pageSlug: "platforms/react", pageName: "React" },
      { pageSlug: "platforms/nextjs", pageName: "Next.js" },
      { pageSlug: "platforms/nodejs", pageName: "Node.js" },
      { pageSlug: "platforms/typescript", pageName: "TypeScript" },
      { pageSlug: "platforms/javascript", pageName: "JavaScript" },
      { pageSlug: "platforms/html5", pageName: "HTML5" },
      { pageSlug: "platforms/css3", pageName: "CSS3" },
      { pageSlug: "platforms/php", pageName: "PHP" },
      { pageSlug: "platforms/laravel", pageName: "Laravel" },
      { pageSlug: "platforms/mysql", pageName: "MySQL" },
      { pageSlug: "platforms/tailwind-css", pageName: "Tailwind CSS" },
      { pageSlug: "platforms/wordpress", pageName: "WordPress" },
      { pageSlug: "platforms/shopify", pageName: "Shopify" },
      { pageSlug: "platforms/wix", pageName: "Wix" },
      { pageSlug: "platforms/magento", pageName: "Magento" },
      { pageSlug: "platforms/clickfunnels", pageName: "ClickFunnels" },
      { pageSlug: "platforms/figma", pageName: "Figma" },
      { pageSlug: "platforms/canva", pageName: "Canva" },
      { pageSlug: "platforms/photoshop", pageName: "Adobe Photoshop" },
      { pageSlug: "platforms/illustrator", pageName: "Adobe Illustrator" },
      { pageSlug: "platforms/premiere-pro", pageName: "Adobe Premiere Pro" },
      { pageSlug: "platforms/adobe-after-effects", pageName: "Adobe After Effects" },
      { pageSlug: "platforms/adobe-indesign", pageName: "Adobe InDesign" },
      { pageSlug: "platforms/adobe", pageName: "Adobe Creative Suite" },
      { pageSlug: "platforms/davinci-resolve", pageName: "DaVinci Resolve" },
      { pageSlug: "platforms/filmora", pageName: "Filmora" },
      { pageSlug: "platforms/capcut", pageName: "CapCut" },
      { pageSlug: "platforms/hubspot", pageName: "HubSpot" },
      { pageSlug: "platforms/salesforce", pageName: "Salesforce" },
      { pageSlug: "platforms/zoho", pageName: "Zoho" },
      { pageSlug: "platforms/pipedrive", pageName: "Pipedrive" },
      { pageSlug: "platforms/microsoft-dynamics", pageName: "Microsoft Dynamics" },
      { pageSlug: "platforms/mailchimp", pageName: "Mailchimp" },
      { pageSlug: "platforms/gohighlevel", pageName: "GoHighLevel" },
      { pageSlug: "platforms/zapier", pageName: "Zapier" },
      { pageSlug: "platforms/n8n", pageName: "n8n" },
      { pageSlug: "platforms/slack", pageName: "Slack" },
      { pageSlug: "platforms/twilio", pageName: "Twilio" },
      { pageSlug: "platforms/stripe", pageName: "Stripe" },
      { pageSlug: "platforms/paypal", pageName: "PayPal" },
      { pageSlug: "platforms/google", pageName: "Google" },
      { pageSlug: "platforms/google-ads", pageName: "Google Ads" },
      { pageSlug: "platforms/meta", pageName: "Meta" },
      { pageSlug: "platforms/facebook", pageName: "Facebook" },
      { pageSlug: "platforms/facebook-ads", pageName: "Facebook Ads" },
      { pageSlug: "platforms/instagram", pageName: "Instagram" },
      { pageSlug: "platforms/instagram-ads", pageName: "Instagram Ads" },
      { pageSlug: "platforms/linkedin", pageName: "LinkedIn" },
      { pageSlug: "platforms/tiktok", pageName: "TikTok" },
      { pageSlug: "platforms/youtube", pageName: "YouTube" },
      { pageSlug: "platforms/youtube-ads", pageName: "YouTube Ads" },
      { pageSlug: "platforms/spotify", pageName: "Spotify" },
      { pageSlug: "platforms/distrokid", pageName: "DistroKid" },
      { pageSlug: "platforms/semrush", pageName: "SEMrush" },
      { pageSlug: "platforms/ahrefs", pageName: "Ahrefs" },
      { pageSlug: "platforms/moz", pageName: "Moz" },
      { pageSlug: "platforms/yoast", pageName: "Yoast SEO" },
      { pageSlug: "platforms/aws", pageName: "Amazon Web Services" },
      { pageSlug: "platforms/microsoft", pageName: "Microsoft" },
      { pageSlug: "platforms/coursera", pageName: "Coursera" },
      { pageSlug: "platforms/flutter", pageName: "Flutter" },
      { pageSlug: "platforms/react-native", pageName: "React Native" },
      { pageSlug: "platforms/kotlin", pageName: "Kotlin" },
      { pageSlug: "platforms/swift", pageName: "Swift" },
      { pageSlug: "platforms/android-studio", pageName: "Android Studio" },
      { pageSlug: "platforms/wyoming-state", pageName: "Wyoming State" },
      { pageSlug: "platforms/ptcl", pageName: "PTCL" },
      { pageSlug: "platforms/irs", pageName: "IRS" },
      { pageSlug: "platforms/pseb", pageName: "PSEB" },
      { pageSlug: "platforms/designrush", pageName: "DesignRush" },
      { pageSlug: "platforms/goodfirms", pageName: "GoodFirms" },
      { pageSlug: "platforms/techbehemoths", pageName: "TechBehemoths" },
    ];
    for (const page of defaultPages) {
      const existing = await this.getPageMeta(page.pageSlug);
      if (!existing) {
        const id = randomUUID();
        await db.insert(pageMeta).values({
          id,
          pageSlug: page.pageSlug,
          pageName: page.pageName,
        });
      }
    }
    await db.update(pageMeta).set({ pageName: "Home (Front Page)" }).where(eq(pageMeta.pageSlug, "home"));
    console.log("Default pages seeded (including platforms)");
  }

  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscribedAt));
  }

  async addNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = randomUUID();
    await db.insert(newsletterSubscribers).values({ ...data, id });
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return subscriber;
  }

  async deleteNewsletterSubscriber(id: string): Promise<boolean> {
    const existing = await db.select({ id: newsletterSubscribers.id }).from(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    if (existing.length === 0) return false;
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return true;
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return subscriber;
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email.toLowerCase()));
    return client;
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByGoogleId(googleId: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.googleId, googleId));
    return client;
  }

  async createClient(data: { email: string; name: string; passwordHash?: string; googleId?: string; avatarUrl?: string }): Promise<Client> {
    const id = randomUUID();
    await db.insert(clients).values({
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: data.passwordHash ?? null,
      googleId: data.googleId ?? null,
      avatarUrl: data.avatarUrl ?? null,
    });
    const [created] = await db.select().from(clients).where(eq(clients.id, id));
    return created;
  }

  async updateClient(id: string, data: Partial<{ name: string; bio: string; phone: string; company: string; avatarUrl: string; lastLoginAt: Date }>): Promise<Client | undefined> {
    const existing = await this.getClientById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.lastLoginAt !== undefined) updateData.lastLoginAt = data.lastLoginAt;

    await db.update(clients)
      .set(updateData)
      .where(eq(clients.id, id));
    const [updated] = await db.select().from(clients).where(eq(clients.id, id));
    return updated;
  }

  async updateClientPassword(id: string, passwordHash: string): Promise<void> {
    await db.update(clients).set({ passwordHash }).where(eq(clients.id, id));
  }

  async getAllClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async toggleClientActive(id: string, isActive: boolean): Promise<Client | undefined> {
    const existing = await this.getClientById(id);
    if (!existing) return undefined;

    await db.update(clients)
      .set({ isActive })
      .where(eq(clients.id, id));
    const [updated] = await db.select().from(clients).where(eq(clients.id, id));
    return updated;
  }

  async getAllServices(): Promise<Service[]> {
    return db.select().from(services).orderBy(asc(services.name));
  }

  async createService(data: { name: string; description?: string; category?: string }): Promise<Service> {
    const id = randomUUID();
    await db.insert(services).values({
      id,
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? null,
    });
    const [created] = await db.select().from(services).where(eq(services.id, id));
    return created;
  }

  async getClientServices(clientId: string): Promise<(ClientService & { serviceName: string; serviceDescription: string | null })[]> {
    const cs = await db.select().from(clientServices).where(eq(clientServices.clientId, clientId)).orderBy(desc(clientServices.assignedAt));
    const result: (ClientService & { serviceName: string; serviceDescription: string | null })[] = [];
    for (const item of cs) {
      const [svc] = await db.select().from(services).where(eq(services.id, item.serviceId));
      result.push({
        ...item,
        serviceName: svc?.name ?? "Unknown",
        serviceDescription: svc?.description ?? null,
      });
    }
    return result;
  }

  async assignServiceToClient(clientId: string, serviceId: string, notes?: string): Promise<ClientService> {
    const id = randomUUID();
    await db.insert(clientServices).values({
      id,
      clientId,
      serviceId,
      notes: notes ?? null,
    });
    const [created] = await db.select().from(clientServices).where(eq(clientServices.id, id));
    return created;
  }

  async updateClientServiceStatus(id: string, status: string, notes?: string): Promise<ClientService | undefined> {
    const [existing] = await db.select().from(clientServices).where(eq(clientServices.id, id));
    if (!existing) return undefined;

    const updateData: Record<string, any> = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === "completed") updateData.completedAt = new Date();

    await db.update(clientServices)
      .set(updateData)
      .where(eq(clientServices.id, id));
    const [updated] = await db.select().from(clientServices).where(eq(clientServices.id, id));
    return updated;
  }

  async removeClientService(id: string): Promise<boolean> {
    const existing = await db.select({ id: clientServices.id }).from(clientServices).where(eq(clientServices.id, id));
    if (existing.length === 0) return false;
    await db.delete(clientServices).where(eq(clientServices.id, id));
    return true;
  }

  async seedDefaultServices(): Promise<void> {
    const defaultServices = [
      { name: "Web Development", description: "Custom website design and development", category: "Development" },
      { name: "Custom CRM", description: "Tailored CRM solutions for your business", category: "Development" },
      { name: "Mobile App Development", description: "iOS and Android mobile application development", category: "Development" },
      { name: "AI Automation", description: "AI-powered automation and workflow optimization", category: "Technology" },
      { name: "SEO & GEO", description: "Search engine and geographic optimization", category: "Marketing" },
      { name: "Digital Marketing", description: "Comprehensive digital marketing strategies", category: "Marketing" },
      { name: "Graphic Design", description: "Professional graphic design and branding", category: "Design" },
      { name: "Video Editing", description: "Professional video editing and production", category: "Design" },
    ];
    for (const svc of defaultServices) {
      const existing = await db.select().from(services).where(eq(services.name, svc.name));
      if (existing.length === 0) {
        const id = randomUUID();
        await db.insert(services).values({ ...svc, id });
      }
    }
    console.log("Default services seeded");
  }

  async createTicket(clientId: string, subject: string, message: string, imageUrl?: string): Promise<Ticket> {
    const allTickets = await db.select().from(tickets);
    const ticketCount = allTickets.length + 1;
    const ticketNumber = `MEC-${String(ticketCount).padStart(4, "0")}`;

    const id = randomUUID();
    await db.insert(tickets).values({
      id,
      ticketNumber,
      clientId,
      subject,
    });
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));

    const client = await this.getClientById(clientId);
    const msgId = randomUUID();
    await db.insert(ticketMessages).values({
      id: msgId,
      ticketId: ticket.id,
      senderType: "client",
      senderId: clientId,
      senderName: client?.name ?? "Client",
      message,
      ...(imageUrl ? { imageUrl } : {}),
    });

    return ticket;
  }

  async getClientTickets(clientId: string): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.clientId, clientId)).orderBy(desc(tickets.updatedAt));
  }

  async getAllTickets(): Promise<(Ticket & { clientName: string; clientEmail: string })[]> {
    const allTickets = await db.select().from(tickets).orderBy(desc(tickets.updatedAt));
    const result: (Ticket & { clientName: string; clientEmail: string })[] = [];
    for (const ticket of allTickets) {
      const [client] = await db.select().from(clients).where(eq(clients.id, ticket.clientId));
      result.push({
        ...ticket,
        clientName: client?.name ?? "Unknown",
        clientEmail: client?.email ?? "unknown",
      });
    }
    return result;
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    return db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(asc(ticketMessages.createdAt));
  }

  async addTicketMessage(ticketId: string, senderType: string, senderId: string, senderName: string, message: string, imageUrl?: string): Promise<TicketMessage> {
    const id = randomUUID();
    await db.insert(ticketMessages).values({
      id,
      ticketId,
      senderType,
      senderId,
      senderName,
      message,
      ...(imageUrl ? { imageUrl } : {}),
    });

    await db.update(tickets)
      .set({ updatedAt: new Date() })
      .where(eq(tickets.id, ticketId));

    const [created] = await db.select().from(ticketMessages).where(eq(ticketMessages.id, id));
    return created;
  }

  async updateTicketStatus(id: string, status: string): Promise<Ticket | undefined> {
    const existing = await this.getTicketById(id);
    if (!existing) return undefined;

    const updateData: Record<string, any> = { status, updatedAt: new Date() };
    if (status === "closed") updateData.closedAt = new Date();

    await db.update(tickets)
      .set(updateData)
      .where(eq(tickets.id, id));
    const [updated] = await db.select().from(tickets).where(eq(tickets.id, id));
    return updated;
  }

  async getAdminNotificationCounts(): Promise<{ unreadMessages: number; openTickets: number; newTicketMessages: number; activeChatSessions: number }> {
    const [msgResult] = await db.select({ count: sql<number>`count(*)` }).from(contactMessages);
    const unreadMessages = Number(msgResult?.count ?? 0);

    const [openTicketResult] = await db.select({ count: sql<number>`count(*)` }).from(tickets)
      .where(sql`${tickets.status} IN ('open', 'in_progress')`);
    const openTickets = Number(openTicketResult?.count ?? 0);

    const [clientMsgResult] = await db.select({ count: sql<number>`count(*)` }).from(ticketMessages)
      .where(eq(ticketMessages.senderType, "client"));
    const newTicketMessages = Number(clientMsgResult?.count ?? 0);

    const [chatResult] = await db.select({ count: sql<number>`count(*)` }).from(chatSessions)
      .where(eq(chatSessions.status, "active"));
    const activeChatSessions = Number(chatResult?.count ?? 0);

    return { unreadMessages, openTickets, newTicketMessages, activeChatSessions };
  }

  async createPasswordResetToken(clientId: string, otpHash: string, expiresAt: Date): Promise<PasswordResetToken> {
    const id = randomUUID();
    await db.insert(passwordResetTokens).values({
      id,
      clientId,
      otpHash,
      expiresAt,
    });
    const [created] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.id, id));
    return created;
  }

  async getValidPasswordResetToken(clientId: string): Promise<PasswordResetToken | undefined> {
    const [token] = await db.select().from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.clientId, clientId),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .orderBy(desc(passwordResetTokens.createdAt))
      .limit(1);
    return token;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }

  async createChatSession(visitorId: string, visitorName?: string, visitorEmail?: string): Promise<ChatSession> {
    const id = randomUUID();
    await db.insert(chatSessions).values({
      id,
      visitorId,
      visitorName: visitorName || null,
      visitorEmail: visitorEmail || null,
    });
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async getChatSessionByVisitorId(visitorId: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions)
      .where(and(eq(chatSessions.visitorId, visitorId), eq(chatSessions.status, "open")))
      .orderBy(desc(chatSessions.createdAt))
      .limit(1);
    return session;
  }

  async getChatSessionById(id: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    return db.select().from(chatSessions).orderBy(desc(chatSessions.lastMessageAt));
  }

  async closeChatSession(id: string): Promise<ChatSession | undefined> {
    await db.update(chatSessions)
      .set({ status: "closed" })
      .where(eq(chatSessions.id, id));
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async updateChatSessionName(id: string, visitorName: string, visitorEmail?: string): Promise<void> {
    const updateData: Record<string, any> = { visitorName };
    if (visitorEmail) updateData.visitorEmail = visitorEmail;
    await db.update(chatSessions)
      .set(updateData)
      .where(eq(chatSessions.id, id));
  }

  async addChatMessage(sessionId: string, senderType: string, senderName: string | null, message: string): Promise<ChatMessage> {
    const id = randomUUID();
    await db.insert(chatMessages).values({
      id,
      sessionId,
      senderType,
      senderName,
      message,
    });
    await this.updateChatSessionLastMessage(sessionId);
    const [msg] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return msg;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async updateChatSessionLastMessage(id: string): Promise<void> {
    await db.update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.id, id));
  }

  async createJobApplication(data: InsertJobApplication): Promise<JobApplication> {
    const id = randomUUID();
    await db.insert(jobApplications).values({
      id,
      careerId: data.careerId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      cvUrl: data.cvUrl ?? null,
      portfolioUrl: data.portfolioUrl ?? null,
    });
    const [created] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return created;
  }

  async getAllJobApplications(): Promise<(JobApplication & { careerTitle: string })[]> {
    const apps = await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
    const result: (JobApplication & { careerTitle: string })[] = [];
    for (const app of apps) {
      const [career] = await db.select().from(careers).where(eq(careers.id, app.careerId));
      result.push({
        ...app,
        careerTitle: career?.title ?? "Unknown Position",
      });
    }
    return result;
  }

  async getJobApplicationById(id: string): Promise<JobApplication | undefined> {
    const [app] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return app;
  }

  async updateJobApplicationStatus(id: string, status: string): Promise<JobApplication | undefined> {
    const existing = await this.getJobApplicationById(id);
    if (!existing) return undefined;
    await db.update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, id));
    const [updated] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return updated;
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    const existing = await db.select({ id: jobApplications.id }).from(jobApplications).where(eq(jobApplications.id, id));
    if (existing.length === 0) return false;
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
    return true;
  }

  async getActiveFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(asc(faqs.displayOrder));
  }

  async getAllFaqs(): Promise<Faq[]> {
    return db.select().from(faqs).orderBy(asc(faqs.displayOrder));
  }

  async getFaqById(id: string): Promise<Faq | undefined> {
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
    return faq;
  }

  async createFaq(data: InsertFaq): Promise<Faq> {
    const allFaqs = await this.getAllFaqs();
    const maxOrder = allFaqs.length > 0 ? Math.max(...allFaqs.map(f => f.displayOrder)) : -1;
    const id = randomUUID();
    await db.insert(faqs).values({
      id,
      question: data.question,
      answer: data.answer,
      displayOrder: data.displayOrder ?? maxOrder + 1,
      isActive: data.isActive ?? true,
    });
    const [created] = await db.select().from(faqs).where(eq(faqs.id, id));
    return created;
  }

  async updateFaq(id: string, data: Partial<InsertFaq>): Promise<Faq | undefined> {
    const existing = await this.getFaqById(id);
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.question !== undefined) updateData.question = data.question;
    if (data.answer !== undefined) updateData.answer = data.answer;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (Object.keys(updateData).length === 0) return existing;
    await db.update(faqs).set(updateData).where(eq(faqs.id, id));
    const [updated] = await db.select().from(faqs).where(eq(faqs.id, id));
    return updated;
  }

  async deleteFaq(id: string): Promise<boolean> {
    const existing = await db.select({ id: faqs.id }).from(faqs).where(eq(faqs.id, id));
    if (existing.length === 0) return false;
    await db.delete(faqs).where(eq(faqs.id, id));
    return true;
  }

  async seedDefaultFaqs(): Promise<void> {
    const existing = await this.getAllFaqs();
    if (existing.length > 0) return;
    const defaults = [
      { question: "What services does MetaEdge Creatives offer?", answer: "MetaEdge Creatives is a full-service creative agency offering web development, social media management, video editing, CRM automation, digital marketing, and SEO services. The goal is to help businesses build a professional online presence, attract the right audience, and convert them into loyal customers." },
      { question: "What types of businesses do you work with?", answer: "MetaEdge Creatives works with startups, small businesses, established brands, e‑commerce stores, and service-based companies across different industries. Whether you are just starting or looking to scale, the services are tailored to match your stage, budget, and growth goals." },
      { question: "How does the process work if I start a project with you?", answer: "The process usually includes a discovery call, proposal and pricing, onboarding (collecting content, access, and goals), execution, and final review/launch. Throughout the project, you receive regular updates, feedback rounds, and clear timelines so you always know what is happening." },
      { question: "How do you decide pricing for your services?", answer: "Pricing depends on the scope of work, timeline, required features, and ongoing support needs. After understanding your goals and requirements, a custom quote or package is shared so you only pay for what you actually need." },
      { question: "Do you offer ongoing support and maintenance?", answer: "Yes, MetaEdge Creatives offers ongoing support for websites, social media, campaigns, and CRM workflows, depending on the selected package. Support can include technical fixes, performance optimization, content updates, and strategy adjustments to keep your brand growing." },
      { question: "Can you manage my social media accounts?", answer: "Yes, MetaEdge Creatives offers full social media management including content creation, post scheduling, engagement strategies, and analytics reporting for platforms like Instagram, Facebook, TikTok, LinkedIn, and YouTube." },
      { question: "How long does it take to build a website?", answer: "A basic business website typically takes 1-2 weeks, while more complex projects like e-commerce stores, custom CRMs, or feature-rich platforms may take 3-6 weeks depending on the requirements and scope." },
      { question: "Do you offer SEO and digital marketing services?", answer: "Yes, MetaEdge Creatives provides comprehensive SEO services including on-page optimization, keyword research, technical SEO, and local SEO (GEO). Digital marketing services include Google Ads, Facebook Ads, Instagram Ads, email marketing, and conversion rate optimization." },
      { question: "What makes MetaEdge Creatives different from other agencies?", answer: "MetaEdge Creatives stands out through its commitment to quality, personalized service, and results-driven approach. The team focuses on understanding each client's unique needs, delivering creative solutions, and building long-term partnerships rather than just one-time projects." },
    ];
    for (let i = 0; i < defaults.length; i++) {
      const id = randomUUID();
      await db.insert(faqs).values({
        id,
        question: defaults[i].question,
        answer: defaults[i].answer,
        displayOrder: i,
        isActive: true,
      });
    }
    console.log("Default FAQs seeded");
  }

  async createEmployee(data: { email: string; name: string; passwordHash: string; role?: string; designation?: string; phone?: string; accessLevel?: string; accessTeams?: string[] }): Promise<Employee> {
    const id = randomUUID();
    await db.insert(employees).values({
      id,
      email: data.email.toLowerCase(),
      name: data.name,
      passwordHash: data.passwordHash,
      role: data.role ?? "employee",
      designation: data.designation ?? null,
      phone: data.phone ?? null,
      accessLevel: data.accessLevel ?? "team_only",
      accessTeams: data.accessTeams ?? [],
    });
    const [created] = await db.select().from(employees).where(eq(employees.id, id));
    return fixEmployeeJson(created);
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    const [emp] = await db.select().from(employees).where(eq(employees.id, id));
    return emp ? fixEmployeeJson(emp) : undefined;
  }

  async getEmployeeByEmail(email: string): Promise<Employee | undefined> {
    const [emp] = await db.select().from(employees).where(eq(employees.email, email.toLowerCase()));
    return emp ? fixEmployeeJson(emp) : undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    const results = await db.select().from(employees).orderBy(desc(employees.createdAt));
    return results.map(fixEmployeeJson);
  }

  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee | undefined> {
    const existing = await this.getEmployeeById(id);
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email.toLowerCase();
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.accessLevel !== undefined) updateData.accessLevel = data.accessLevel;
    if (data.accessTeams !== undefined) updateData.accessTeams = data.accessTeams;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.passwordHash !== undefined) updateData.passwordHash = data.passwordHash;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    await db.update(employees).set(updateData).where(eq(employees.id, id));
    const [updated] = await db.select().from(employees).where(eq(employees.id, id));
    return updated ? fixEmployeeJson(updated) : undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const existing = await db.select({ id: employees.id }).from(employees).where(eq(employees.id, id));
    if (existing.length === 0) return false;
    await db.delete(employees).where(eq(employees.id, id));
    return true;
  }

  async createTeam(data: { name: string; description?: string; color?: string }): Promise<Team> {
    const id = randomUUID();
    await db.insert(teams).values({
      id,
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? "#C41E3A",
    });
    const [created] = await db.select().from(teams).where(eq(teams.id, id));
    return created;
  }

  async getTeamById(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getAllTeams(): Promise<Team[]> {
    return db.select().from(teams).orderBy(desc(teams.createdAt));
  }

  async updateTeam(id: string, data: Partial<Team>): Promise<Team | undefined> {
    const existing = await this.getTeamById(id);
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.color !== undefined) updateData.color = data.color;
    await db.update(teams).set(updateData).where(eq(teams.id, id));
    const [updated] = await db.select().from(teams).where(eq(teams.id, id));
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const existing = await db.select({ id: teams.id }).from(teams).where(eq(teams.id, id));
    if (existing.length === 0) return false;
    await db.delete(teams).where(eq(teams.id, id));
    return true;
  }

  async addTeamMember(teamId: string, employeeId: string, role?: string): Promise<TeamMembership> {
    const id = randomUUID();
    await db.insert(teamMemberships).values({
      id,
      teamId,
      employeeId,
      role: role ?? "member",
    });
    const [created] = await db.select().from(teamMemberships).where(eq(teamMemberships.id, id));
    return created;
  }

  async removeTeamMember(teamId: string, employeeId: string): Promise<boolean> {
    const existing = await db.select({ id: teamMemberships.id }).from(teamMemberships).where(and(eq(teamMemberships.teamId, teamId), eq(teamMemberships.employeeId, employeeId)));
    if (existing.length === 0) return false;
    await db.delete(teamMemberships).where(and(eq(teamMemberships.teamId, teamId), eq(teamMemberships.employeeId, employeeId)));
    return true;
  }

  async getTeamMembers(teamId: string): Promise<TeamMembership[]> {
    return db.select().from(teamMemberships).where(eq(teamMemberships.teamId, teamId));
  }

  async getEmployeeTeams(employeeId: string): Promise<TeamMembership[]> {
    return db.select().from(teamMemberships).where(eq(teamMemberships.employeeId, employeeId));
  }

  async createTask(data: { title: string; description?: string; teamId: string; assigneeId?: string; createdById: string; priority?: string; dueDate?: string }): Promise<Task> {
    const id = randomUUID();
    await db.insert(tasks).values({
      id,
      title: data.title,
      description: data.description ?? null,
      teamId: data.teamId,
      assigneeId: data.assigneeId ?? null,
      createdById: data.createdById,
      priority: data.priority ?? "medium",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    });
    const [created] = await db.select().from(tasks).where(eq(tasks.id, id));
    return created;
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasksByTeam(teamId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.teamId, teamId)).orderBy(desc(tasks.createdAt));
  }

  async getTasksByAssignee(employeeId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.assigneeId, employeeId)).orderBy(desc(tasks.createdAt));
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | undefined> {
    const existing = await this.getTaskById(id);
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.teamId !== undefined) updateData.teamId = data.teamId;
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "done") {
        updateData.completedAt = new Date();
      }
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    updateData.updatedAt = new Date();
    await db.update(tasks).set(updateData).where(eq(tasks.id, id));
    const [updated] = await db.select().from(tasks).where(eq(tasks.id, id));
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    const existing = await db.select({ id: tasks.id }).from(tasks).where(eq(tasks.id, id));
    if (existing.length === 0) return false;
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  async createTaskComment(data: { taskId: string; employeeId: string; content: string }): Promise<TaskComment> {
    const id = randomUUID();
    await db.insert(taskComments).values({
      id,
      taskId: data.taskId,
      employeeId: data.employeeId,
      content: data.content,
    });
    const [created] = await db.select().from(taskComments).where(eq(taskComments.id, id));
    return created;
  }

  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return db.select().from(taskComments).where(eq(taskComments.taskId, taskId)).orderBy(asc(taskComments.createdAt));
  }

  async deleteTaskComment(id: string): Promise<boolean> {
    const existing = await db.select({ id: taskComments.id }).from(taskComments).where(eq(taskComments.id, id));
    if (existing.length === 0) return false;
    await db.delete(taskComments).where(eq(taskComments.id, id));
    return true;
  }

  async clockIn(employeeId: string, notes?: string): Promise<ClockEntry> {
    const id = randomUUID();
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    await db.insert(clockEntries).values({
      id,
      employeeId,
      clockIn: now,
      notes: notes ?? null,
      date,
    });
    const [created] = await db.select().from(clockEntries).where(eq(clockEntries.id, id));
    return created;
  }

  async clockOut(id: string): Promise<ClockEntry | undefined> {
    const [entry] = await db.select().from(clockEntries).where(eq(clockEntries.id, id));
    if (!entry) return undefined;
    const now = new Date();
    const clockInTime = new Date(entry.clockIn);
    const totalMinutes = Math.round((now.getTime() - clockInTime.getTime()) / 60000);
    await db.update(clockEntries).set({ clockOut: now, totalMinutes }).where(eq(clockEntries.id, id));
    const [updated] = await db.select().from(clockEntries).where(eq(clockEntries.id, id));
    return updated;
  }

  async getActiveClockEntry(employeeId: string): Promise<ClockEntry | undefined> {
    const [entry] = await db.select().from(clockEntries).where(and(eq(clockEntries.employeeId, employeeId), isNull(clockEntries.clockOut)));
    return entry;
  }

  async getClockEntries(employeeId: string, startDate?: string, endDate?: string): Promise<ClockEntry[]> {
    const conditions = [eq(clockEntries.employeeId, employeeId)];
    if (startDate) conditions.push(gte(clockEntries.date, startDate));
    if (endDate) conditions.push(lte(clockEntries.date, endDate));
    return db.select().from(clockEntries).where(and(...conditions)).orderBy(desc(clockEntries.clockIn));
  }

  async getAllClockEntries(startDate?: string, endDate?: string): Promise<ClockEntry[]> {
    const conditions: any[] = [];
    if (startDate) conditions.push(gte(clockEntries.date, startDate));
    if (endDate) conditions.push(lte(clockEntries.date, endDate));
    if (conditions.length > 0) {
      return db.select().from(clockEntries).where(and(...conditions)).orderBy(desc(clockEntries.clockIn));
    }
    return db.select().from(clockEntries).orderBy(desc(clockEntries.clockIn));
  }

  async createLeaveRequest(data: { employeeId: string; type: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> {
    const id = randomUUID();
    await db.insert(leaveRequests).values({
      id,
      employeeId: data.employeeId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    });
    const [created] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return created;
  }

  async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
    if (employeeId) {
      return db.select().from(leaveRequests).where(eq(leaveRequests.employeeId, employeeId)).orderBy(desc(leaveRequests.createdAt));
    }
    return db.select().from(leaveRequests).orderBy(desc(leaveRequests.createdAt));
  }

  async updateLeaveStatus(id: string, status: string, reviewedBy: string): Promise<LeaveRequest | undefined> {
    const [existing] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    if (!existing) return undefined;
    await db.update(leaveRequests).set({ status, reviewedBy, reviewedAt: new Date() }).where(eq(leaveRequests.id, id));
    const [updated] = await db.select().from(leaveRequests).where(eq(leaveRequests.id, id));
    return updated;
  }

  async createNote(data: { employeeId: string; title: string; content?: string; color?: string }): Promise<PersonalNote> {
    const id = randomUUID();
    await db.insert(personalNotes).values({
      id,
      employeeId: data.employeeId,
      title: data.title,
      content: data.content ?? null,
      color: data.color ?? "#ffffff",
    });
    const [created] = await db.select().from(personalNotes).where(eq(personalNotes.id, id));
    return created;
  }

  async getNotes(employeeId: string): Promise<PersonalNote[]> {
    return db.select().from(personalNotes).where(eq(personalNotes.employeeId, employeeId)).orderBy(desc(personalNotes.updatedAt));
  }

  async updateNote(id: string, data: Partial<PersonalNote>): Promise<PersonalNote | undefined> {
    const [existing] = await db.select().from(personalNotes).where(eq(personalNotes.id, id));
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    updateData.updatedAt = new Date();
    await db.update(personalNotes).set(updateData).where(eq(personalNotes.id, id));
    const [updated] = await db.select().from(personalNotes).where(eq(personalNotes.id, id));
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    const existing = await db.select({ id: personalNotes.id }).from(personalNotes).where(eq(personalNotes.id, id));
    if (existing.length === 0) return false;
    await db.delete(personalNotes).where(eq(personalNotes.id, id));
    return true;
  }

  async upsertHeartbeat(employeeId: string, appName?: string, windowTitle?: string): Promise<ActivityHeartbeat> {
    const [existing] = await db.select().from(activityHeartbeats).where(eq(activityHeartbeats.employeeId, employeeId));
    if (existing) {
      const updateData: Record<string, any> = { lastActive: new Date() };
      if (appName !== undefined) updateData.appName = appName;
      if (windowTitle !== undefined) updateData.windowTitle = windowTitle;
      await db.update(activityHeartbeats).set(updateData).where(eq(activityHeartbeats.employeeId, employeeId));
      const [updated] = await db.select().from(activityHeartbeats).where(eq(activityHeartbeats.employeeId, employeeId));
      return updated;
    }
    const id = randomUUID();
    await db.insert(activityHeartbeats).values({
      id,
      employeeId,
      lastActive: new Date(),
      appName: appName ?? null,
      windowTitle: windowTitle ?? null,
    });
    const [created] = await db.select().from(activityHeartbeats).where(eq(activityHeartbeats.id, id));
    return created;
  }

  async getHeartbeats(): Promise<ActivityHeartbeat[]> {
    return db.select().from(activityHeartbeats);
  }

  async getHeartbeat(employeeId: string): Promise<ActivityHeartbeat | undefined> {
    const [heartbeat] = await db.select().from(activityHeartbeats).where(eq(activityHeartbeats.employeeId, employeeId));
    return heartbeat;
  }

  async createScreenshot(data: { employeeId: string; imageData: string; appName?: string; windowTitle?: string }): Promise<Screenshot> {
    const id = randomUUID();
    await db.insert(screenshots).values({
      id,
      employeeId: data.employeeId,
      imageData: data.imageData,
      appName: data.appName ?? null,
      windowTitle: data.windowTitle ?? null,
    });
    const [created] = await db.select().from(screenshots).where(eq(screenshots.id, id));
    return created;
  }

  async getScreenshots(employeeId?: string, limit: number = 50): Promise<Screenshot[]> {
    if (employeeId) {
      return db.select().from(screenshots)
        .where(eq(screenshots.employeeId, employeeId))
        .orderBy(desc(screenshots.capturedAt))
        .limit(limit);
    }
    return db.select().from(screenshots)
      .orderBy(desc(screenshots.capturedAt))
      .limit(limit);
  }

  async getScreenshotById(id: string): Promise<Screenshot | undefined> {
    const [s] = await db.select().from(screenshots).where(eq(screenshots.id, id));
    return s;
  }

  async deleteOldScreenshots(daysOld: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);
    const old = await db.select({ id: screenshots.id }).from(screenshots).where(lte(screenshots.capturedAt, cutoff));
    if (old.length === 0) return 0;
    await db.delete(screenshots).where(lte(screenshots.capturedAt, cutoff));
    return old.length;
  }

  async createWeeklyReport(data: { employeeId: string; teamId: string; weekStart: string; weekEnd: string; accomplishments: string; challenges?: string; nextWeekPlan?: string; hoursWorked?: number }): Promise<WeeklyReport> {
    const id = randomUUID();
    await db.insert(weeklyReports).values({
      id,
      employeeId: data.employeeId,
      teamId: data.teamId,
      weekStart: data.weekStart,
      weekEnd: data.weekEnd,
      accomplishments: data.accomplishments,
      challenges: data.challenges ?? null,
      nextWeekPlan: data.nextWeekPlan ?? null,
      hoursWorked: data.hoursWorked ?? null,
    });
    const [created] = await db.select().from(weeklyReports).where(eq(weeklyReports.id, id));
    return created;
  }

  async getWeeklyReports(teamId?: string, employeeId?: string): Promise<WeeklyReport[]> {
    const conditions = [];
    if (teamId) conditions.push(eq(weeklyReports.teamId, teamId));
    if (employeeId) conditions.push(eq(weeklyReports.employeeId, employeeId));
    if (conditions.length > 0) {
      return db.select().from(weeklyReports)
        .where(and(...conditions))
        .orderBy(desc(weeklyReports.createdAt));
    }
    return db.select().from(weeklyReports).orderBy(desc(weeklyReports.createdAt));
  }

  async getWeeklyReportById(id: string): Promise<WeeklyReport | undefined> {
    const [report] = await db.select().from(weeklyReports).where(eq(weeklyReports.id, id));
    return report;
  }

  async updateWeeklyReport(id: string, data: any): Promise<WeeklyReport | undefined> {
    const [existing] = await db.select().from(weeklyReports).where(eq(weeklyReports.id, id));
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.accomplishments !== undefined) updateData.accomplishments = data.accomplishments;
    if (data.challenges !== undefined) updateData.challenges = data.challenges;
    if (data.nextWeekPlan !== undefined) updateData.nextWeekPlan = data.nextWeekPlan;
    if (data.hoursWorked !== undefined) updateData.hoursWorked = data.hoursWorked;
    if (data.weekStart !== undefined) updateData.weekStart = data.weekStart;
    if (data.weekEnd !== undefined) updateData.weekEnd = data.weekEnd;
    updateData.updatedAt = new Date();
    await db.update(weeklyReports).set(updateData).where(eq(weeklyReports.id, id));
    const [updated] = await db.select().from(weeklyReports).where(eq(weeklyReports.id, id));
    return updated;
  }

  async deleteWeeklyReport(id: string): Promise<boolean> {
    const existing = await db.select({ id: weeklyReports.id }).from(weeklyReports).where(eq(weeklyReports.id, id));
    if (existing.length === 0) return false;
    await db.delete(weeklyReports).where(eq(weeklyReports.id, id));
    return true;
  }

  async createMonthlyReport(data: { employeeId: string; teamId: string; month: string; summary: string; achievements?: string; challenges?: string; goalsNextMonth?: string; totalHours?: number; tasksCompleted?: number }): Promise<MonthlyReport> {
    const id = randomUUID();
    await db.insert(monthlyReports).values({
      id,
      employeeId: data.employeeId,
      teamId: data.teamId,
      month: data.month,
      summary: data.summary,
      achievements: data.achievements ?? null,
      challenges: data.challenges ?? null,
      goalsNextMonth: data.goalsNextMonth ?? null,
      totalHours: data.totalHours ?? null,
      tasksCompleted: data.tasksCompleted ?? null,
    });
    const [created] = await db.select().from(monthlyReports).where(eq(monthlyReports.id, id));
    return created;
  }

  async getMonthlyReports(teamId?: string, employeeId?: string): Promise<MonthlyReport[]> {
    const conditions = [];
    if (teamId) conditions.push(eq(monthlyReports.teamId, teamId));
    if (employeeId) conditions.push(eq(monthlyReports.employeeId, employeeId));
    if (conditions.length > 0) {
      return db.select().from(monthlyReports)
        .where(and(...conditions))
        .orderBy(desc(monthlyReports.createdAt));
    }
    return db.select().from(monthlyReports).orderBy(desc(monthlyReports.createdAt));
  }

  async getMonthlyReportById(id: string): Promise<MonthlyReport | undefined> {
    const [report] = await db.select().from(monthlyReports).where(eq(monthlyReports.id, id));
    return report;
  }

  async updateMonthlyReport(id: string, data: any): Promise<MonthlyReport | undefined> {
    const [existing] = await db.select().from(monthlyReports).where(eq(monthlyReports.id, id));
    if (!existing) return undefined;
    const updateData: Record<string, any> = {};
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.achievements !== undefined) updateData.achievements = data.achievements;
    if (data.challenges !== undefined) updateData.challenges = data.challenges;
    if (data.goalsNextMonth !== undefined) updateData.goalsNextMonth = data.goalsNextMonth;
    if (data.totalHours !== undefined) updateData.totalHours = data.totalHours;
    if (data.tasksCompleted !== undefined) updateData.tasksCompleted = data.tasksCompleted;
    updateData.updatedAt = new Date();
    await db.update(monthlyReports).set(updateData).where(eq(monthlyReports.id, id));
    const [updated] = await db.select().from(monthlyReports).where(eq(monthlyReports.id, id));
    return updated;
  }

  async deleteMonthlyReport(id: string): Promise<boolean> {
    const existing = await db.select({ id: monthlyReports.id }).from(monthlyReports).where(eq(monthlyReports.id, id));
    if (existing.length === 0) return false;
    await db.delete(monthlyReports).where(eq(monthlyReports.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();
