import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { insertEmployeeSchema, updateEmployeeSchema, selfUpdateEmployeeSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./jwt-config";
import { sendNotificationEmail } from "./resend-email";

interface EmployeeJwtPayload {
  employeeId: string;
  email: string;
  name: string;
  role: string;
  accessLevel: string;
  accessTeams: string[];
}

declare global {
  namespace Express {
    interface Request {
      employeeUser?: EmployeeJwtPayload;
    }
  }
}

function employeeAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as EmployeeJwtPayload;
    if (!decoded.employeeId) {
      return res.status(401).json({ error: "Invalid token type" });
    }
    req.employeeUser = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function employeeOrAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.employeeId) {
      req.employeeUser = decoded;
    } else if (decoded.userId) {
      req.adminUser = decoded;
    }
    if (!req.employeeUser && !req.adminUser) {
      return res.status(401).json({ error: "Invalid token" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function isSuperAdminOrFullAccess(req: Request): boolean {
  if (req.adminUser?.role === "super_admin") return true;
  if (req.employeeUser?.accessLevel === "full") return true;
  return false;
}

function canAccessTeam(req: Request, teamId: string): boolean {
  if (isSuperAdminOrFullAccess(req)) return true;
  if (req.employeeUser) {
    if (req.employeeUser.accessLevel === "multi_team" || req.employeeUser.accessLevel === "team_only") {
      return req.employeeUser.accessTeams.includes(teamId);
    }
  }
  return false;
}

export function registerTeamPortalRoutes(app: Express) {

  app.post("/api/team-portal/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || !employee.isActive) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(password, employee.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const memberships = await storage.getEmployeeTeams(employee.id);
      const teamIds = memberships.map(m => m.teamId);
      const accessTeams = employee.accessLevel === "full" ? teamIds : (Array.isArray(employee.accessTeams) ? employee.accessTeams : []);
      const token = jwt.sign({
        employeeId: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        accessLevel: employee.accessLevel,
        accessTeams: employee.accessLevel === "full" ? teamIds : accessTeams,
      } as EmployeeJwtPayload, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        token,
        user: {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
          designation: employee.designation,
          description: (employee as any).description || null,
          accessLevel: employee.accessLevel,
          accessTeams: employee.accessLevel === "full" ? teamIds : accessTeams,
          avatarUrl: employee.avatarUrl,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/team-portal/me", employeeAuth, async (req: Request, res: Response) => {
    try {
      const employee = await storage.getEmployeeById(req.employeeUser!.employeeId);
      if (!employee || !employee.isActive) {
        return res.status(401).json({ error: "Account not found or disabled" });
      }
      const memberships = await storage.getEmployeeTeams(employee.id);
      const teamIds = memberships.map(m => m.teamId);
      res.json({
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        designation: employee.designation,
        description: employee.description,
        accessLevel: employee.accessLevel,
        accessTeams: employee.accessLevel === "full" ? teamIds : (Array.isArray(employee.accessTeams) ? employee.accessTeams : []),
        avatarUrl: employee.avatarUrl,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/team-portal/me", employeeAuth, async (req: Request, res: Response) => {
    try {
      const parsed = selfUpdateEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const updated = await storage.updateEmployee(req.employeeUser!.employeeId, parsed.data);
      if (!updated) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        designation: updated.designation,
        description: updated.description,
        accessLevel: updated.accessLevel,
        avatarUrl: updated.avatarUrl,
      });
    } catch {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/team-portal/employees", employeeAuth, async (req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      const safe = employees.map(e => ({
        id: e.id,
        email: e.email,
        name: e.name,
        role: e.role,
        designation: e.designation,
        phone: e.phone,
        accessLevel: e.accessLevel,
        accessTeams: e.accessTeams,
        isActive: e.isActive,
        avatarUrl: e.avatarUrl,
        createdAt: e.createdAt,
      }));
      res.json(safe);
    } catch {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.post("/api/team-portal/employees", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const parsed = insertEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const existing = await storage.getEmployeeByEmail(parsed.data.email);
      if (existing) {
        return res.status(400).json({ error: "An employee with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(parsed.data.password, 10);
      const employee = await storage.createEmployee({
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        role: parsed.data.role,
        designation: parsed.data.designation || undefined,
        phone: parsed.data.phone || undefined,
        accessLevel: parsed.data.accessLevel || "team_only",
        accessTeams: parsed.data.accessTeams || [],
      });
      res.json({ ...employee, passwordHash: undefined });
    } catch (error) {
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/team-portal/employees/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const parsed = updateEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const updateData: any = { ...parsed.data };
      if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }
      const updated = await storage.updateEmployee(req.params.id as string, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ ...updated, passwordHash: undefined });
    } catch {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/team-portal/employees/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const deleted = await storage.deleteEmployee(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  app.get("/api/team-portal/teams", employeeAuth, async (req: Request, res: Response) => {
    try {
      const allTeams = await storage.getAllTeams();
      res.json(allTeams);
    } catch {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  app.post("/api/team-portal/teams", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const { name, description, color } = req.body;
      if (!name) return res.status(400).json({ error: "Team name is required" });
      const team = await storage.createTeam({ name, description, color });
      res.json(team);
    } catch {
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.patch("/api/team-portal/teams/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const updated = await storage.updateTeam(req.params.id as string, req.body);
      if (!updated) return res.status(404).json({ error: "Team not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  app.delete("/api/team-portal/teams/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const deleted = await storage.deleteTeam(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

  app.get("/api/team-portal/teams/:id/members", employeeAuth, async (req: Request, res: Response) => {
    try {
      const members = await storage.getTeamMembers(req.params.id as string as string);
      res.json(members);
    } catch {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.post("/api/team-portal/teams/:id/members", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const { employeeId, role } = req.body;
      if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });
      const membership = await storage.addTeamMember(req.params.id as string, employeeId, role);
      res.json(membership);
    } catch {
      res.status(500).json({ error: "Failed to add team member" });
    }
  });

  app.delete("/api/team-portal/teams/:teamId/members/:employeeId", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const removed = await storage.removeTeamMember(req.params.teamId as string, req.params.employeeId as string);
      res.json({ success: removed });
    } catch {
      res.status(500).json({ error: "Failed to remove team member" });
    }
  });

  app.get("/api/team-portal/tasks", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { teamId } = req.query;
      if (teamId && typeof teamId === "string") {
        if (!canAccessTeam(req, teamId)) {
          return res.status(403).json({ error: "You don't have access to this team's tasks" });
        }
        const tasks = await storage.getTasksByTeam(teamId);
        return res.json(tasks);
      }
      if (isSuperAdminOrFullAccess(req)) {
        const allTeams = await storage.getAllTeams();
        let allTasks: any[] = [];
        for (const team of allTeams) {
          const tasks = await storage.getTasksByTeam(team.id);
          allTasks = allTasks.concat(tasks);
        }
        return res.json(allTasks);
      }
      const accessTeams = req.employeeUser?.accessTeams || [];
      let tasks: any[] = [];
      for (const tid of accessTeams) {
        const t = await storage.getTasksByTeam(tid);
        tasks = tasks.concat(t);
      }
      res.json(tasks);
    } catch {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/team-portal/tasks", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Only admins with full access can create tasks" });
      }
      const { title, description, teamId, assigneeId, priority, dueDate } = req.body;
      if (!title || !teamId) {
        return res.status(400).json({ error: "Title and team are required" });
      }
      if (!canAccessTeam(req, teamId)) {
        return res.status(403).json({ error: "You don't have access to this team" });
      }
      const task = await storage.createTask({
        title,
        description,
        teamId,
        assigneeId: assigneeId || null,
        createdById: req.employeeUser!.employeeId,
        priority: priority || "medium",
        dueDate: dueDate || undefined,
      });
      res.json(task);
    } catch {
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/team-portal/tasks/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const task = await storage.getTaskById(req.params.id as string);
      if (!task) return res.status(404).json({ error: "Task not found" });
      if (!canAccessTeam(req, task.teamId)) {
        return res.status(403).json({ error: "You don't have access to this task" });
      }
      const updateData: any = { ...req.body };
      if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
      if (updateData.status === "done" && task.status !== "done") {
        updateData.completedAt = new Date();
      }
      const updated = await storage.updateTask(req.params.id as string, updateData);
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/team-portal/tasks/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Only admins with full access can delete tasks" });
      }
      const task = await storage.getTaskById(req.params.id as string);
      if (!task) return res.status(404).json({ error: "Task not found" });
      if (!canAccessTeam(req, task.teamId)) {
        return res.status(403).json({ error: "You don't have access to this task" });
      }
      const deleted = await storage.deleteTask(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  app.get("/api/team-portal/tasks/:id/comments", employeeAuth, async (req: Request, res: Response) => {
    try {
      const comments = await storage.getTaskComments(req.params.id as string);
      res.json(comments);
    } catch {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/team-portal/tasks/:id/comments", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content is required" });
      const comment = await storage.createTaskComment({
        taskId: req.params.id as string,
        employeeId: req.employeeUser!.employeeId,
        content,
      });
      res.json(comment);
    } catch {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  app.delete("/api/team-portal/comments/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteTaskComment(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  app.post("/api/team-portal/clock/in", employeeAuth, async (req: Request, res: Response) => {
    try {
      const active = await storage.getActiveClockEntry(req.employeeUser!.employeeId);
      if (active) {
        return res.status(400).json({ error: "You are already clocked in" });
      }
      const entry = await storage.clockIn(req.employeeUser!.employeeId, req.body?.notes);
      res.json(entry);
    } catch (error: any) {
      console.error("Clock in error:", error?.message || error, error?.sql || "");
      res.status(500).json({ error: "Failed to clock in", details: error?.message });
    }
  });

  app.post("/api/team-portal/clock/out", employeeAuth, async (req: Request, res: Response) => {
    try {
      const active = await storage.getActiveClockEntry(req.employeeUser!.employeeId);
      if (!active) {
        return res.status(400).json({ error: "You are not clocked in" });
      }
      const entry = await storage.clockOut(active.id);
      res.json(entry);
    } catch (error: any) {
      console.error("Clock out error:", error?.message || error, error?.sql || "");
      res.status(500).json({ error: "Failed to clock out", details: error?.message });
    }
  });

  app.get("/api/team-portal/clock/status", employeeAuth, async (req: Request, res: Response) => {
    try {
      const active = await storage.getActiveClockEntry(req.employeeUser!.employeeId);
      res.json({ clockedIn: !!active, clockEntry: active || null });
    } catch (error: any) {
      console.error("Clock status error:", error?.message || error);
      res.status(500).json({ error: "Failed to fetch clock status" });
    }
  });

  app.get("/api/team-portal/clock/entries", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { employeeId, startDate, endDate } = req.query as any;
      if (employeeId && !isSuperAdminOrFullAccess(req) && employeeId !== req.employeeUser!.employeeId) {
        return res.status(403).json({ error: "You can only view your own time entries" });
      }
      const targetId = employeeId || req.employeeUser!.employeeId;
      const entries = await storage.getClockEntries(targetId, startDate, endDate);
      res.json(entries);
    } catch {
      res.status(500).json({ error: "Failed to fetch time entries" });
    }
  });

  app.get("/api/team-portal/clock/all", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const { startDate, endDate } = req.query as any;
      const entries = await storage.getAllClockEntries(startDate, endDate);
      res.json(entries);
    } catch {
      res.status(500).json({ error: "Failed to fetch all time entries" });
    }
  });

  app.post("/api/team-portal/leaves", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { type, startDate, endDate, reason } = req.body;
      if (!type || !startDate || !endDate || !reason) {
        return res.status(400).json({ error: "All fields are required" });
      }
      const leave = await storage.createLeaveRequest({
        employeeId: req.employeeUser!.employeeId,
        type,
        startDate,
        endDate,
        reason,
      });
      try {
        const emp = await storage.getEmployeeById(req.employeeUser!.employeeId);
        await sendNotificationEmail(
          "New Leave Request",
          `<p style="margin:0 0 16px;font-size:15px;color:#333;line-height:1.6;">
            <strong>${emp?.name || req.employeeUser!.name}</strong> has submitted a leave request.
          </p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:600;color:#555;width:120px;">Type</td><td style="padding:8px 12px;border:1px solid #eee;color:#333;">${type}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:600;color:#555;">From</td><td style="padding:8px 12px;border:1px solid #eee;color:#333;">${startDate}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:600;color:#555;">To</td><td style="padding:8px 12px;border:1px solid #eee;color:#333;">${endDate}</td></tr>
            <tr><td style="padding:8px 12px;border:1px solid #eee;font-weight:600;color:#555;">Reason</td><td style="padding:8px 12px;border:1px solid #eee;color:#333;">${reason}</td></tr>
          </table>`
        );
      } catch {}
      res.json(leave);
    } catch {
      res.status(500).json({ error: "Failed to submit leave request" });
    }
  });

  app.get("/api/team-portal/leaves", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.query as any;
      if (isSuperAdminOrFullAccess(req)) {
        const leaves = await storage.getLeaveRequests(employeeId || undefined);
        return res.json(leaves);
      }
      const leaves = await storage.getLeaveRequests(req.employeeUser!.employeeId);
      res.json(leaves);
    } catch {
      res.status(500).json({ error: "Failed to fetch leave requests" });
    }
  });

  app.patch("/api/team-portal/leaves/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const { status } = req.body;
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateLeaveStatus(req.params.id as string, status, req.employeeUser!.employeeId);
      if (!updated) return res.status(404).json({ error: "Leave request not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update leave request" });
    }
  });

  app.get("/api/team-portal/notes", employeeAuth, async (req: Request, res: Response) => {
    try {
      const notes = await storage.getNotes(req.employeeUser!.employeeId);
      res.json(notes);
    } catch {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/team-portal/notes", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { title, content, color } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });
      const note = await storage.createNote({
        employeeId: req.employeeUser!.employeeId,
        title,
        content,
        color,
      });
      res.json(note);
    } catch {
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.patch("/api/team-portal/notes/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const updated = await storage.updateNote(req.params.id as string, req.body);
      if (!updated) return res.status(404).json({ error: "Note not found" });
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/team-portal/notes/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteNote(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  app.get("/api/team-portal/dashboard", employeeAuth, async (req: Request, res: Response) => {
    try {
      const employeeId = req.employeeUser!.employeeId;
      const today = new Date().toISOString().split("T")[0];
      const [clockStatus, myEntries, leaves, employees, allTeams] = await Promise.all([
        storage.getActiveClockEntry(employeeId),
        storage.getClockEntries(employeeId, today, today),
        isSuperAdminOrFullAccess(req) ? storage.getLeaveRequests() : storage.getLeaveRequests(employeeId),
        isSuperAdminOrFullAccess(req) ? storage.getAllEmployees() : Promise.resolve([]),
        storage.getAllTeams(),
      ]);

      let taskCount = 0;
      let pendingTasks = 0;
      const accessTeams = req.employeeUser!.accessTeams || [];
      const teamsToCheck = isSuperAdminOrFullAccess(req) ? allTeams.map(t => t.id) : accessTeams;
      for (const tid of teamsToCheck) {
        const tasks = await storage.getTasksByTeam(tid);
        taskCount += tasks.length;
        pendingTasks += tasks.filter(t => t.status !== "done").length;
      }

      const todayMinutes = myEntries.reduce((sum, e) => sum + (e.totalMinutes || 0), 0);
      const pendingLeaves = leaves.filter(l => l.status === "pending").length;

      res.json({
        clockedIn: !!clockStatus,
        clockEntry: clockStatus,
        todayHours: Math.round((todayMinutes / 60) * 10) / 10,
        totalTasks: taskCount,
        pendingTasks,
        pendingLeaves,
        totalEmployees: employees.length,
        totalTeams: allTeams.length,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/team-portal/performance", employeeAuth, async (req: Request, res: Response) => {
    try {
      const employeeId = req.employeeUser!.employeeId;
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const weeklyHours: { date: string; hours: number; label: string }[] = [];
      const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const entries = await storage.getClockEntries(employeeId, dateStr, dateStr);
        const mins = entries.reduce((sum, e) => sum + (e.totalMinutes || 0), 0);
        weeklyHours.push({ date: dateStr, hours: Math.round((mins / 60) * 10) / 10, label: dayLabels[i] });
      }

      const totalWeekHours = weeklyHours.reduce((s, d) => s + d.hours, 0);
      const workedDays = weeklyHours.filter(d => d.hours > 0).length || 1;
      const avgDailyHours = Math.round((totalWeekHours / workedDays) * 10) / 10;

      const accessTeams = req.employeeUser!.accessTeams || [];
      const allTeams = await storage.getAllTeams();
      const teamsToCheck = isSuperAdminOrFullAccess(req) ? allTeams.map(t => t.id) : accessTeams;

      let totalTasksDone = 0;
      let totalTasksAssigned = 0;
      for (const tid of teamsToCheck) {
        const tasks = await storage.getTasksByTeam(tid);
        const myTasks = isSuperAdminOrFullAccess(req) ? tasks : tasks.filter(t => t.assigneeId === employeeId);
        totalTasksAssigned += myTasks.length;
        totalTasksDone += myTasks.filter(t => t.status === "done").length;
      }

      const taskCompletion = totalTasksAssigned > 0 ? Math.round((totalTasksDone / totalTasksAssigned) * 100) : 0;

      res.json({
        weeklyHours,
        totalWeekHours,
        avgDailyHours,
        taskCompletion,
        totalTasksDone,
        totalTasksAssigned,
        tasksTotal: totalTasksAssigned,
      });
    } catch {
      res.status(500).json({ error: "Failed to fetch performance data" });
    }
  });

  app.get("/api/team-portal/admin/performance", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const employees = await storage.getAllEmployees();
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split("T")[0];

      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthStart = firstOfMonth.toISOString().split("T")[0];

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekEnd = sunday.toISOString().split("T")[0];

      const allTeams = await storage.getAllTeams();

      const result = [];

      for (const emp of employees) {
        if (!emp.isActive) continue;

        const todayEntries = await storage.getClockEntries(emp.id, today, today);
        const todayMins = todayEntries.reduce((s, e) => s + (e.totalMinutes || 0), 0);

        const weekEntries = await storage.getClockEntries(emp.id, weekStart, weekEnd);
        const weekMins = weekEntries.reduce((s, e) => s + (e.totalMinutes || 0), 0);

        const monthEntries = await storage.getClockEntries(emp.id, monthStart, today);
        const monthMins = monthEntries.reduce((s, e) => s + (e.totalMinutes || 0), 0);

        const activeEntry = await storage.getActiveClockEntry(emp.id);

        let tasksDone = 0;
        let tasksTotal = 0;
        for (const team of allTeams) {
          const tasks = await storage.getTasksByTeam(team.id);
          const empTasks = tasks.filter(t => t.assigneeId === emp.id);
          tasksTotal += empTasks.length;
          tasksDone += empTasks.filter(t => t.status === "done").length;
        }

        result.push({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          designation: emp.designation || "Employee",
          todayHours: Math.round((todayMins / 60) * 100) / 100,
          weekHours: Math.round((weekMins / 60) * 100) / 100,
          monthHours: Math.round((monthMins / 60) * 100) / 100,
          tasksDone,
          tasksTotal,
          isOnline: !!activeEntry,
        });
      }

      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to fetch admin performance data" });
    }
  });

  app.post("/api/team-portal/heartbeat", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { appName, windowTitle } = req.body;
      await storage.upsertHeartbeat(req.employeeUser!.employeeId, appName, windowTitle);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to record heartbeat" });
    }
  });

  app.get("/api/team-portal/heartbeats", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const heartbeats = await storage.getHeartbeats();
      res.json(heartbeats);
    } catch {
      res.status(500).json({ error: "Failed to fetch heartbeats" });
    }
  });

  app.post("/api/team-portal/screenshots", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { imageData, appName, windowTitle } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "imageData is required" });
      }
      const screenshot = await storage.createScreenshot({
        employeeId: req.employeeUser!.employeeId,
        imageData,
        appName,
        windowTitle,
      });
      res.json({ id: screenshot.id, capturedAt: screenshot.capturedAt });
    } catch {
      res.status(500).json({ error: "Failed to create screenshot" });
    }
  });

  app.get("/api/team-portal/screenshots", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const { employeeId, limit } = req.query as any;
      const screenshots = await storage.getScreenshots(employeeId || undefined, limit ? parseInt(limit, 10) : undefined);
      res.json(screenshots);
    } catch {
      res.status(500).json({ error: "Failed to fetch screenshots" });
    }
  });

  app.get("/api/team-portal/screenshots/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }
      const screenshot = await storage.getScreenshotById(req.params.id as string);
      if (!screenshot) {
        return res.status(404).json({ error: "Screenshot not found" });
      }
      res.json(screenshot);
    } catch {
      res.status(500).json({ error: "Failed to fetch screenshot" });
    }
  });

  app.delete("/api/team-portal/screenshots/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      if (!isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "Only admins can delete screenshots" });
      }
      const deleted = await storage.deleteScreenshot(req.params.id as string);
      if (!deleted) {
        return res.status(404).json({ error: "Screenshot not found" });
      }
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete screenshot" });
    }
  });

  app.post("/api/team-portal/weekly-reports", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { teamId, weekStart, weekEnd, accomplishments, challenges, nextWeekPlan, hoursWorked, pdfUrl } = req.body;
      if (!teamId || !weekStart || !weekEnd) {
        return res.status(400).json({ error: "teamId, weekStart, and weekEnd are required" });
      }
      if (!pdfUrl && !accomplishments) {
        return res.status(400).json({ error: "Please upload a file or add a note" });
      }
      const report = await storage.createWeeklyReport({
        employeeId: req.employeeUser!.employeeId,
        teamId,
        weekStart,
        weekEnd,
        accomplishments,
        challenges,
        nextWeekPlan,
        hoursWorked,
        pdfUrl,
      });
      res.json(report);
    } catch {
      res.status(500).json({ error: "Failed to create weekly report" });
    }
  });

  app.get("/api/team-portal/weekly-reports", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { teamId, employeeId } = req.query as any;
      if (isSuperAdminOrFullAccess(req)) {
        const reports = await storage.getWeeklyReports(teamId || undefined, employeeId || undefined);
        return res.json(reports);
      }
      const accessTeams = req.employeeUser?.accessTeams || [];
      if (teamId) {
        if (!accessTeams.includes(teamId)) {
          return res.status(403).json({ error: "You don't have access to this team's reports" });
        }
        const reports = await storage.getWeeklyReports(teamId, employeeId || undefined);
        return res.json(reports);
      }
      let allReports: any[] = [];
      for (const tid of accessTeams) {
        const reports = await storage.getWeeklyReports(tid, employeeId || undefined);
        allReports = allReports.concat(reports);
      }
      res.json(allReports);
    } catch {
      res.status(500).json({ error: "Failed to fetch weekly reports" });
    }
  });

  app.get("/api/team-portal/weekly-reports/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const report = await storage.getWeeklyReportById(req.params.id as string);
      if (!report) {
        return res.status(404).json({ error: "Weekly report not found" });
      }
      res.json(report);
    } catch {
      res.status(500).json({ error: "Failed to fetch weekly report" });
    }
  });

  app.put("/api/team-portal/weekly-reports/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const report = await storage.getWeeklyReportById(req.params.id as string);
      if (!report) {
        return res.status(404).json({ error: "Weekly report not found" });
      }
      if (report.employeeId !== req.employeeUser!.employeeId && !isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "You can only update your own reports" });
      }
      const updated = await storage.updateWeeklyReport(req.params.id as string, req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update weekly report" });
    }
  });

  app.delete("/api/team-portal/weekly-reports/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const report = await storage.getWeeklyReportById(req.params.id as string);
      if (!report) {
        return res.status(404).json({ error: "Weekly report not found" });
      }
      if (report.employeeId !== req.employeeUser!.employeeId && !isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "You can only delete your own reports" });
      }
      const deleted = await storage.deleteWeeklyReport(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete weekly report" });
    }
  });

  app.post("/api/team-portal/monthly-reports", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { teamId, month, summary, achievements, challenges, goalsNextMonth, totalHours, tasksCompleted, pdfUrl } = req.body;
      if (!teamId || !month) {
        return res.status(400).json({ error: "teamId and month are required" });
      }
      if (!pdfUrl && !summary) {
        return res.status(400).json({ error: "Please upload a file or add a note" });
      }
      const report = await storage.createMonthlyReport({
        employeeId: req.employeeUser!.employeeId,
        teamId,
        month,
        summary: summary || "",
        achievements,
        challenges,
        goalsNextMonth,
        totalHours,
        tasksCompleted,
        pdfUrl,
      });
      res.json(report);
    } catch {
      res.status(500).json({ error: "Failed to create monthly report" });
    }
  });

  app.get("/api/team-portal/monthly-reports", employeeAuth, async (req: Request, res: Response) => {
    try {
      const { teamId, employeeId } = req.query as any;
      if (isSuperAdminOrFullAccess(req)) {
        const reports = await storage.getMonthlyReports(teamId || undefined, employeeId || undefined);
        return res.json(reports);
      }
      const accessTeams = req.employeeUser?.accessTeams || [];
      if (teamId) {
        if (!accessTeams.includes(teamId)) {
          return res.status(403).json({ error: "You don't have access to this team's reports" });
        }
        const reports = await storage.getMonthlyReports(teamId, employeeId || undefined);
        return res.json(reports);
      }
      let allReports: any[] = [];
      for (const tid of accessTeams) {
        const reports = await storage.getMonthlyReports(tid, employeeId || undefined);
        allReports = allReports.concat(reports);
      }
      res.json(allReports);
    } catch {
      res.status(500).json({ error: "Failed to fetch monthly reports" });
    }
  });

  app.get("/api/team-portal/monthly-reports/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const report = await storage.getMonthlyReportById(req.params.id as string);
      if (!report) {
        return res.status(404).json({ error: "Monthly report not found" });
      }
      res.json(report);
    } catch {
      res.status(500).json({ error: "Failed to fetch monthly report" });
    }
  });

  app.put("/api/team-portal/monthly-reports/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const report = await storage.getMonthlyReportById(req.params.id as string);
      if (!report) {
        return res.status(404).json({ error: "Monthly report not found" });
      }
      if (report.employeeId !== req.employeeUser!.employeeId && !isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "You can only update your own reports" });
      }
      const updated = await storage.updateMonthlyReport(req.params.id as string, req.body);
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Failed to update monthly report" });
    }
  });

  app.delete("/api/team-portal/monthly-reports/:id", employeeAuth, async (req: Request, res: Response) => {
    try {
      const report = await storage.getMonthlyReportById(req.params.id as string);
      if (!report) {
        return res.status(404).json({ error: "Monthly report not found" });
      }
      if (report.employeeId !== req.employeeUser!.employeeId && !isSuperAdminOrFullAccess(req)) {
        return res.status(403).json({ error: "You can only delete your own reports" });
      }
      const deleted = await storage.deleteMonthlyReport(req.params.id as string);
      res.json({ success: deleted });
    } catch {
      res.status(500).json({ error: "Failed to delete monthly report" });
    }
  });
}
