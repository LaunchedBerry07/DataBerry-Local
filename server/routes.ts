import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmailSchema, insertLabelSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user?: { id: string; username: string; email: string };
  }
}

// Session middleware to check authentication
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user?.id) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple auth for demo - in production, use proper password hashing
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.user = { id: user.id, username: user.username, email: user.email };
      res.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      req.session.user = { id: user.id, username: user.username, email: user.email };
      res.status(201).json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

// Add this endpoint in server/routes.ts, for example, after the /api/auth/logout route

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Sync emails endpoint
  // Replace the existing /api/sync endpoint in server/routes.ts

app.post("/api/sync", requireAuth, async (req, res) => {
  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    console.error("FATAL: GOOGLE_APPS_SCRIPT_URL is not set.");
    return res.status(500).json({ 
      success: false, 
      error: "Sync service is not configured." 
    });
  }

  try {
    // Here you would get a valid OAuth access token for the user.
    // This is a placeholder as we haven't implemented full OAuth yet.
    const userAccessToken = "placeholder_access_token_from_user_session";

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // The script will need a way to identify the user,
        // which would typically be an access token.
        userId: req.session.user?.id,
        accessToken: userAccessToken 
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Google Apps Script returned an error.");
    }

    res.json({ 
      success: true, 
      message: "Email sync initiated successfully!",
      details: result
    });

  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

      // CONSOLIDATED CSV Export Endpoint
  app.get("/api/export/csv", requireAuth, async (req, res) => {
    try {
      const {
        search,
        category,
        dateFrom,
        dateTo,
      } = req.query;

      const emails = await storage.getEmails(
        1000, // Large limit for export
        0,
        search as string,
        category as string,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );

      const csvContent = [/* ... */].join('\n');
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="emails-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Emails endpoints
  app.get("/api/emails", async (req, res) => {
    try {
      const {
        limit = "50",
        offset = "0",
        search,
        category,
        dateFrom,
        dateTo,
      } = req.query;

      const emails = await storage.getEmails(
        parseInt(limit as string),
        parseInt(offset as string),
        search as string,
        category as string,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );

      res.json(emails);
    } catch (error) {
      console.error("Error fetching emails:", error);
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  app.get("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const email = await storage.getEmailById(id);
      
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }
      
      res.json(email);
    } catch (error) {
      console.error("Error fetching email:", error);
      res.status(500).json({ error: "Failed to fetch email" });
    }
  });

  app.post("/api/emails", async (req, res) => {
    try {
      const validatedData = insertEmailSchema.parse(req.body);
      const email = await storage.createEmail(validatedData);
      res.status(201).json(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email data", details: error.errors });
      }
      console.error("Error creating email:", error);
      res.status(500).json({ error: "Failed to create email" });
    }
  });

  app.put("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEmailSchema.partial().parse(req.body);
      const email = await storage.updateEmail(id, validatedData);
      res.json(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email data", details: error.errors });
      }
      console.error("Error updating email:", error);
      res.status(500).json({ error: "Failed to update email" });
    }
  });

  app.delete("/api/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmail(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).json({ error: "Failed to delete email" });
    }
  });

  // Export to PDF
  app.post("/api/emails/:id/export", async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.exportEmailToPdf(id);
      res.json(result);
    } catch (error) {
      console.error("Error exporting email to PDF:", error);
      res.status(500).json({ error: "Failed to export email to PDF" });
    }
  });

  // Labels endpoints
  app.get("/api/labels", async (req, res) => {
    try {
      const labels = await storage.getLabels();
      res.json(labels);
    } catch (error) {
      console.error("Error fetching labels:", error);
      res.status(500).json({ error: "Failed to fetch labels" });
    }
  });

  app.post("/api/labels", async (req, res) => {
    try {
      const validatedData = insertLabelSchema.parse(req.body);
      const label = await storage.createLabel(validatedData);
      res.status(201).json(label);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid label data", details: error.errors });
      }
      console.error("Error creating label:", error);
      res.status(500).json({ error: "Failed to create label" });
    }
  });

  app.put("/api/labels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLabelSchema.partial().parse(req.body);
      const label = await storage.updateLabel(parseInt(id), validatedData);
      res.json(label);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid label data", details: error.errors });
      }
      console.error("Error updating label:", error);
      res.status(500).json({ error: "Failed to update label" });
    }
  });

  app.delete("/api/labels/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLabel(parseInt(id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting label:", error);
      res.status(500).json({ error: "Failed to delete label" });
    }
  });

  // CSV Export
  app.get("/api/export/csv", async (req, res) => {
    try {
      const {
        search,
        category,
        dateFrom,
        dateTo,
      } = req.query;

      const emails = await storage.getEmails(
        1000, // Large limit for export
        0,
        search as string,
        category as string,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );

      // Generate CSV content
      const headers = [
        "Subject",
        "Sender Name",
        "Sender Email", 
        "Category",
        "Amount",
        "Status",
        "Received Date",
        "Labels"
      ];

      const csvRows = [
        headers.join(","),
        ...emails.map(email => [
          `"${email.subject.replace(/"/g, '""')}"`,
          `"${email.senderName.replace(/"/g, '""')}"`,
          `"${email.senderEmail}"`,
          `"${email.category}"`,
          `"${email.amount || ''}"`,
          `"${email.status}"`,
          `"${email.receivedAt.toISOString()}"`,
          `"${email.labels.map(l => l.name).join('; ')}"`
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="emails-export-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
