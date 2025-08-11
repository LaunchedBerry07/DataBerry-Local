var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attachments: () => attachments,
  attachmentsRelations: () => attachmentsRelations,
  emailLabels: () => emailLabels,
  emailLabelsRelations: () => emailLabelsRelations,
  emails: () => emails,
  emailsRelations: () => emailsRelations,
  insertAttachmentSchema: () => insertAttachmentSchema,
  insertEmailLabelSchema: () => insertEmailLabelSchema,
  insertEmailSchema: () => insertEmailSchema,
  insertLabelSchema: () => insertLabelSchema,
  insertUserSchema: () => insertUserSchema,
  labels: () => labels,
  labelsRelations: () => labelsRelations,
  users: () => users
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var labels = pgTable("labels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3B82F6"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var emails = pgTable("emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  snippet: text("snippet"),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  category: text("category").notNull().default("Uncategorized"),
  status: text("status").notNull().default("pending"),
  // pending, processed, exported
  driveFileId: text("drive_file_id"),
  driveFileUrl: text("drive_file_url"),
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  emailId: varchar("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content"),
  // base64 encoded content
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var emailLabels = pgTable("email_labels", {
  id: serial("id").primaryKey(),
  emailId: varchar("email_id").notNull().references(() => emails.id, { onDelete: "cascade" }),
  labelId: integer("label_id").notNull().references(() => labels.id, { onDelete: "cascade" })
});
var emailsRelations = relations(emails, ({ many }) => ({
  attachments: many(attachments),
  emailLabels: many(emailLabels)
}));
var labelsRelations = relations(labels, ({ many }) => ({
  emailLabels: many(emailLabels)
}));
var attachmentsRelations = relations(attachments, ({ one }) => ({
  email: one(emails, {
    fields: [attachments.emailId],
    references: [emails.id]
  })
}));
var emailLabelsRelations = relations(emailLabels, ({ one }) => ({
  email: one(emails, {
    fields: [emailLabels.emailId],
    references: [emails.id]
  }),
  label: one(labels, {
    fields: [emailLabels.labelId],
    references: [labels.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true
});
var insertLabelSchema = createInsertSchema(labels).omit({
  id: true,
  createdAt: true
});
var insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  createdAt: true
});
var insertEmailLabelSchema = createInsertSchema(emailLabels).omit({
  id: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { desc, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  // ... (all other database methods like getUser, getEmails, etc.)
  async getContacts() {
    const result = await db.select({
      id: sql2`md5(${emails.senderEmail})`,
      // Create a stable ID from email
      name: emails.senderName,
      email: emails.senderEmail,
      emailCount: sql2`count(${emails.id})`,
      totalAmount: sql2`sum(${emails.amount})::float`,
      lastEmailDate: sql2`max(${emails.receivedAt})`
    }).from(emails).groupBy(emails.senderName, emails.senderEmail).orderBy(desc(sql2`max(${emails.receivedAt})`));
    return result;
  }
  // ... (rest of the database methods)
};
var storage = new DatabaseStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/contacts", requireAuth, async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });
  app2.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var getAdditionalPlugins = async () => {
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0) {
    const cartographer = await import("@replit/vite-plugin-cartographer").then(
      (m) => m.cartographer()
    );
    return [cartographer];
  }
  return [];
};
var vite_config_default = defineConfig(async () => {
  const additionalPlugins = await getAdditionalPlugins();
  return {
    plugins: [react(), runtimeErrorOverlay(), ...additionalPlugins],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets")
      }
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"]
      }
    }
  };
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  log("FATAL ERROR: SESSION_SECRET environment variable is not set.", "startup");
  process.exit(1);
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "dev-secret-placeholder",
  // Fallback only for development
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
